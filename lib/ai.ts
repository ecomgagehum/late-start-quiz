import Anthropic from "@anthropic-ai/sdk";
import { RESULT_TOOL, SYSTEM_PROMPT, buildUserMessage } from "./prompt";
import { AiResult, validateAiResult } from "./result";

// Default: Claude Haiku 5.5, Anthropic's current fast, low-cost model. Change with QUIZ_MODEL.
export const DEFAULT_MODEL = "claude-haiku-5-5";

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

// One AI call, plus one retry if the JSON is bad. Never logs or returns his answers.
export async function writeResults(taps: Record<string, string>, answers: (string | null)[]): Promise<AiResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AiError("no_api_key");
  const client = new Anthropic({ apiKey, maxRetries: 0, timeout: 25_000 }); // 2 tries x 25s stays under maxDuration 60
  const model = process.env.QUIZ_MODEL || DEFAULT_MODEL;
  const userMessage = buildUserMessage(taps, answers);

  for (let attempt = 0; attempt < 2; attempt++) {
    let msg: Anthropic.Message;
    try {
      msg = await client.messages.create({
        model,
        max_tokens: 1800,
        system: SYSTEM_PROMPT,
        tools: [RESULT_TOOL as unknown as Anthropic.Tool],
        tool_choice: { type: "tool", name: RESULT_TOOL.name },
        messages: [
          {
            role: "user",
            content:
              attempt === 0
                ? userMessage
                : userMessage + "\n\nYour last reply did not match the give_results format. Call give_results once, with every required field filled.",
          },
        ],
      });
    } catch (e) {
      // Log only a short code. The SDK error can echo request details, so never log it whole.
      const status = e instanceof Anthropic.APIError ? e.status : undefined;
      console.error(`quiz_ai_error status=${status ?? "none"}`);
      throw new AiError(status === 429 || status === 529 ? "ai_busy" : "ai_failed");
    }
    const parsed = validateAiResult(pickJson(msg));
    if (parsed) return parsed;
    console.error(`quiz_ai_bad_json attempt=${attempt + 1}`);
  }
  throw new AiError("bad_json");
}
