import Anthropic from "@anthropic-ai/sdk";
import { RESULT_TOOL, SYSTEM_PROMPT, buildUserMessage } from "./prompt";
import { AiResult, validateAiResult } from "./result";

// Default: Claude Sonnet 5.5. The v2 result is longer and deeper (about 800 to 1,000 words), which needs a
// stronger writer than Haiku. Change with QUIZ_MODEL (for example claude-haiku-5-5 to save cost).
export const DEFAULT_MODEL = "claude-sonnet-5-5";
// If the main model rejects the request (400/404), fall back to this one once so the guy still gets results.
export const FALLBACK_MODEL = "claude-haiku-5-5";

// Time budget. The route has maxDuration = 60 (Vercel Hobby max). We must answer before that.
// One full try gets up to 48s. A retry happens only if the first reply was bad AND at least 25s remain.
export const AI_LIMITS = {
  maxTokens: 3000, // about 1,500 needed for ~1,000 words + JSON; cap so a runaway reply can't blow the time limit
  deadlineMs: 54_000, // finish everything by 54s after the request started (6s margin for the rest of the route)
  firstTryMs: 48_000,
  retryMinMs: 25_000, // don't start a retry with less time than this left
};

export class AiError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

function pickJson(msg: Anthropic.Message): unknown {
  for (const block of msg.content) {
    if (block.type === "tool_use" && block.name === RESULT_TOOL.name) return block.input;
  }
  // Fallback: a JSON object written as text.
  const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return null;
    }
  }
  return null;
}

// One AI call, plus at most one retry if the JSON is bad and time remains. Never logs or returns his answers.
// startedAt = when the HTTP request arrived, so the whole route stays under maxDuration.
export async function writeResults(
  taps: Record<string, string>,
  answers: (string | null)[],
  startedAt: number = Date.now(),
): Promise<AiResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AiError("no_api_key");
  const client = new Anthropic({ apiKey, maxRetries: 0 });
  let model = process.env.QUIZ_MODEL || DEFAULT_MODEL;
  let usedFallback = false;
  const userMessage = buildUserMessage(taps, answers);
  const deadline = startedAt + AI_LIMITS.deadlineMs;

  for (let attempt = 0; attempt < 2; attempt++) {
    const left = deadline - Date.now();
    if (attempt > 0 && left < AI_LIMITS.retryMinMs) break;
    const timeout = Math.min(AI_LIMITS.firstTryMs, left);
    if (timeout < 5_000) break;
    let msg: Anthropic.Message;
    try {
      msg = await client.messages.create(
        {
          model,
          max_tokens: AI_LIMITS.maxTokens,
          // The system prompt is the same for everyone, so it's cached (cheaper and a little faster).
          system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
          tools: [RESULT_TOOL as unknown as Anthropic.Tool],
          // Sonnet 5.5 rejects a forced tool_choice ("tool"/"any"), so let the model choose and tell it to call the tool.
          tool_choice: { type: "auto" },
          messages: [
            {
              role: "user",
              content:
                attempt === 0
                  ? userMessage + "\n\nAnswer only by calling give_results once, with every required field filled."
                  : userMessage + "\n\nYour last reply did not match the give_results format. Call give_results once, with every required field filled. Keep it a little shorter.",
            },
          ],
        },
        { timeout },
      );
    } catch (e) {
      // Log only a short code. The SDK error can echo request details, so never log it whole.
      if (e instanceof Anthropic.APIConnectionTimeoutError) {
        console.error(`quiz_ai_error status=timeout attempt=${attempt + 1}`);
        // Tester v2: a retry that runs out of time falls back to the tap-based result (bad_json path)
        // instead of an error screen, since he already waited through one full try.
        if (attempt > 0) break;
        throw new AiError("ai_timeout");
      }
      const status = e instanceof Anthropic.APIError ? e.status : undefined;
      // Anthropic's error text explains what was wrong with the request (never his answers). Keep it short.
      let why = "";
      if (e instanceof Anthropic.APIError) {
        const body = e.error as { error?: { type?: string; message?: string } } | undefined;
        why = `${body?.error?.type ?? ""} ${(body?.error?.message ?? "").slice(0, 160)}`.replace(/\s+/g, " ").trim();
      }
      console.error(`quiz_ai_error status=${status ?? "none"} model=${model} why=${why || "none"}`);
      if ((status === 400 || status === 404) && !usedFallback && model !== FALLBACK_MODEL && deadline - Date.now() > AI_LIMITS.retryMinMs) {
        model = FALLBACK_MODEL;
        usedFallback = true;
        attempt--; // the fallback try doesn't use up the bad-JSON retry
        continue;
      }
      throw new AiError(status === 429 || status === 529 ? "ai_busy" : "ai_failed");
    }
    const parsed = validateAiResult(pickJson(msg));
    if (parsed) return parsed;
    console.error(`quiz_ai_bad_json attempt=${attempt + 1} stop=${msg.stop_reason}`);
  }
  throw new AiError("bad_json");
}
