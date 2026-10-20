import { NextRequest } from "next/server";

// Best-effort, in-memory limits. No Redis, no IP storage beyond a short-lived counter key.
// Resets when the server restarts (on Vercel, each instance has its own memory).
// The real backstop is the monthly spend limit in the Anthropic console.
const g = globalThis as unknown as { __quizGuard?: Map<string, { n: number; exp: number }> };
const mem = (g.__quizGuard ??= new Map());

function bump(key: string, ttlMs: number): number {
  const now = Date.now();
  // Drop expired counters every time, so an IP is kept in memory for about an hour at most.
  for (const [k, v] of mem) if (v.exp < now) mem.delete(k);
  const cur = mem.get(key);
  if (!cur || cur.exp < now) {
    mem.set(key, { n: 1, exp: now + ttlMs });
    return 1;
  }
  cur.n += 1;
  return cur.n;
}

function num(v: string | undefined, d: number): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
}

export type GuardFail = { status: number; code: "rate_limited" | "busy" | "bad_origin" };

export function clientIp(req: NextRequest): string {
  return (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown").split(",")[0].trim();
}

// Only accept requests from our own pages. Same host is always allowed. Extra hosts come from ALLOWED_ORIGINS.
export function originOk(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  let host: string;
  try {
    host = new URL(origin).host;
  } catch {
    return false;
  }
  const self = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (self && host === self) return true;
  const extra = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""))
    .filter(Boolean);
  return extra.includes(host);
}

export function guard(req: NextRequest, route: "results"): GuardFail | null {
  if (!originOk(req)) return { status: 403, code: "bad_origin" };
  // 12 per IP per hour: phone carriers and campus Wi-Fi share one IP, and retries count.
  const perHour = num(process.env.RATE_LIMIT_PER_HOUR, 12);
  const perDay = num(process.env.DAILY_LIMIT, 300);
  const hour = new Date().toISOString().slice(0, 13);
  const day = new Date().toISOString().slice(0, 10);
  if (bump(`${route}:ip:${clientIp(req)}:${hour}`, 3_700_000) > perHour) return { status: 429, code: "rate_limited" };
  if (bump(`${route}:day:${day}`, 90_000_000) > perDay) {
    console.error(`quiz_${route}_daily_cap`);
    return { status: 429, code: "busy" };
  }
  return null;
}
