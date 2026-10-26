import { NextRequest, NextResponse } from "next/server";
import { LIMITS, QUESTIONS, TAPS } from "@/lib/content";
import { guard } from "@/lib/guard";
import { crisisHit, under18Hit } from "@/lib/safety";
import { AiError, writeResults } from "@/lib/ai";
import { mockFor } from "@/lib/mock";
import { QuizResult, fallbackResult, toQuizResult } from "@/lib/result";
import { subscribe } from "@/lib/kajabi";
import { TypeId } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// PRIVACY: this route holds his answers. Never console.log the body, the answers, or a raw error.
// Errors return and log a short code only.
// EMAIL: there is no open "add an email" route. The email rides along with the answers and is saved to
// Kajabi only here, only after a normal result (never crisis, under 18, harm, or a failed request).
// The email is never put in the AI prompt and never logged.

const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i;

function fail(status: number, code: string) {
  return NextResponse.json({ error: code }, { status, headers: { "Cache-Control": "no-store" } });
}

function ok(result: QuizResult) {
  return NextResponse.json({ result }, { headers: { "Cache-Control": "no-store" } });
}

// Save the email to Kajabi BEFORE answering (bounded), so it always runs and always logs.
// (It used to run after the response; on the live site it never logged, so leads were lost.)
async function syncEmail(started: number, firstName: string, email: string, type: TypeId | null) {
  const budget = Math.min(9_000, 58_000 - (Date.now() - started));
  if (budget < 2_000) {
    console.error("quiz_subscribe code=no_time");
    return;
  }
  try {
    const out = await Promise.race([
      subscribe({ firstName, email, type }),
      new Promise<{ ok: boolean; mode: string; code: string; tagged: boolean }>((r) =>
        setTimeout(() => r({ ok: false, mode: process.env.KAJABI_MODE || "off", code: "timeout", tagged: false }), budget),
      ),
    ]);
    const line = `quiz_subscribe mode=${out.mode} code=${out.code} tagged=${out.tagged}`;
    if (out.ok) console.log(line);
    else console.error(line);
  } catch (e) {
    console.error(`quiz_subscribe code=exception ${e instanceof Error ? e.name : "unknown"}`);
  }
}

export async function POST(req: NextRequest) {
  const started = Date.now();
  const blocked = guard(req, "results");
  if (blocked) return fail(blocked.status, blocked.code);

  const len = Number(req.headers.get("content-length") || 0);
  if (len > 80_000) return fail(413, "too_long");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "bad_request");
  }
  const b = (body || {}) as Record<string, unknown>;

  // Honeypot: real people never see or fill this hidden field (odd name so browsers don't autofill it).
  if (typeof b.hp_7c === "string" && b.hp_7c.trim()) return fail(400, "bad_request");

  // Quick taps: each must be one of our option ids.
  const tapsIn = (b.taps || {}) as Record<string, unknown>;
  const taps: Record<string, string> = {};
  for (const t of TAPS) {
    const v = tapsIn[t.id];
    if (typeof v !== "string" || !t.options.some((o) => o.id === v)) return fail(400, "bad_request");
    taps[t.id] = v;
  }
  if (taps.age === "under18") return ok({ kind: "under18" });

  // Name + email are required (the page asks before results). Checked here, used only after a normal result.
  const firstName = typeof b.firstName === "string" ? b.firstName.replace(/[<>]/g, "").trim().slice(0, LIMITS.firstNameMax) : "";
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  if (!firstName || email.length > LIMITS.emailMax || !EMAIL_RE.test(email)) return fail(400, "bad_email");
  // The page sets this on a retake in the same visit, so he isn't signed up twice.
  const alreadySaved = b.alreadySaved === true;
  const save = async (r: QuizResult) => {
    if (r.kind === "result" && !alreadySaved) await syncEmail(started, firstName, email, r.fallback ? null : r.type);
    return ok(r);
  };

  // Open answers: array of 10, each a string (max 1,500 chars) or null for skipped. At most 2 skips.
  if (!Array.isArray(b.answers) || b.answers.length !== QUESTIONS.length) return fail(400, "bad_request");
  const answers: (string | null)[] = [];
  let total = 0;
  let skips = 0;
  for (const a of b.answers) {
    if (a === null || (typeof a === "string" && !a.trim())) {
      answers.push(null);
      skips++;
      continue;
    }
    if (typeof a !== "string") return fail(400, "bad_request");
    if (a.length > LIMITS.answerMaxChars) return fail(400, "too_long");
    total += a.length;
    answers.push(a);
  }
  if (skips > LIMITS.maxSkips) return fail(400, "too_many_skips");
  if (total > LIMITS.totalMaxChars) return fail(400, "too_long");

  // Layer 1 safety: keyword check on the server. A hit skips the AI completely.
  if (crisisHit(answers.filter((a): a is string => !!a))) return ok({ kind: "crisis" });
  // Under-18 backstop (Tester v2): a clear present-tense "I'm 16" / "I'm in 11th grade" skips the AI and the pitch.
  if (under18Hit(answers.filter((a): a is string => !!a))) return ok({ kind: "under18" });

  if (process.env.QUIZ_MOCK === "1") {
    await new Promise((r) => setTimeout(r, 2500));
    return save(toQuizResult(mockFor(answers)));
  }

  try {
    const ai = await writeResults(taps, answers, started);
    return save(toQuizResult(ai));
  } catch (e) {
    const code = e instanceof AiError ? e.code : "ai_failed";
    if (code === "bad_json") return save(fallbackResult(taps.want, taps.people));
    if (code === "ai_busy") return fail(503, "busy");
    if (code === "ai_timeout") return fail(504, "slow");
    if (code === "no_api_key") console.error("quiz_no_api_key");
    return fail(502, "ai_failed");
  }
}
