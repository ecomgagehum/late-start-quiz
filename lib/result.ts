import { REPS, REP_IDS, TYPES, TypeId } from "./content";

// What the AI must return (the tool input), before we enrich it. v2 shape (Oct 20, 2026).
export type AiResult = {
  type: TypeId;
  type_reason: string;
  whats_going_on: string[];
  whats_true: { title: string; text: string }[];
  your_why: string;
  cost_of_waiting: string;
  steps: { rep_id: string; headline: string; when_where: string; what_to_do: string }[];
  first_week: string;
  why_a_plan: string;
  flags: { crisis: boolean; under18: boolean; harm_others: boolean; low_info: boolean };
};

export type ResultStep = { repId: string; headline: string; whenWhere: string; whatToDo: string; doneWhen: string };

// What the page gets.
export type QuizResult =
  | { kind: "crisis" }
  | { kind: "under18" }
  | { kind: "harm_others" }
  | {
      kind: "result";
      fallback?: boolean;
      lowInfo: boolean;
      type: TypeId;
      typeName: string;
      typeTagline: string;
      typeReason: string;
      whatsGoingOn: string[];
      whatsTrue: { title: string; text: string }[];
      yourWhy: string;
      costOfWaiting: string;
      steps: ResultStep[];
      firstWeek: string;
      whyAPlan: string;
    };

const TYPE_IDS = Object.keys(TYPES) as TypeId[];

// The only numbers the AI may cite (lib/content.ts RESEARCH). Any other percentage is dropped, sentence and all.
const ALLOWED_PERCENTS = new Set(["44"]);

// Tester v2: also catch "9 out of 10", "1 in 3", and "studies show" style claims with no approved source.
const RATIO = /\b\d+\s+(?:out\s+of|in)\s+(?:\d+|ten|a\s+hundred)\b|\b(?:one|two|three|four|five|six|seven|eight|nine)\s+(?:out\s+of|in)\s+(?:ten|\d+)\b/i;
const UNSOURCED = /\b(?:studies|research|science|surveys?|data|experts|psychologists)\s+(?:show|shows|says?|found|finds|proves?|suggests?)\b/i;
const LINK = "\u0000link\u0000"; // marker: a sentence that held a link is dropped whole
const APPROVED_SOURCE = /\b(?:Hinge|Huang|American Enterprise Institute)\b/i;

function dropBadStats(s: string): string {
  if (!/\d+(\.\d+)?\s*(%|percent)/i.test(s) && !RATIO.test(s) && !UNSOURCED.test(s) && !s.includes(LINK)) return s;
  const sentences = s.match(/[^.!?]+[.!?]*["”]?\s*/g) || [s];
  return sentences
    .filter((x) => {
      const nums = [...x.matchAll(/(\d+(?:\.\d+)?)\s*(?:%|percent)/gi)].map((m) => m[1]);
      if (!nums.every((n) => ALLOWED_PERCENTS.has(n))) return false;
      if (RATIO.test(x) || x.includes(LINK)) return false;
      if (UNSOURCED.test(x) && !APPROVED_SOURCE.test(x)) return false;
      return true;
    })
    .join("")
    .trim();
}

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  // Plain text only: drop angle brackets and em/en dashes, collapse space, drop any stat we didn't approve.
  // Tester v2: drop tags whole (not just the brackets) and any link the model was talked into writing.
  let s = v
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/[<>]/g, "")
    .replace(/\bhttps?:\/\/\S+|\bwww\.\S+/gi, LINK)
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
  s = dropBadStats(s);
  if (!s || s.toLowerCase() === "n/a") return null;
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}

// Returns null when the shape is wrong (caller retries once if there's time, else falls back).
export function validateAiResult(raw: unknown): AiResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const f = (r.flags && typeof r.flags === "object" ? r.flags : {}) as Record<string, unknown>;
  const flags = {
    crisis: f.crisis === true,
    under18: f.under18 === true,
    harm_others: f.harm_others === true,
    low_info: f.low_info === true,
  };
  // Safety results don't need the rest of the fields.
  if (flags.crisis || flags.under18 || flags.harm_others) {
    return {
      type: "never_started", type_reason: "", whats_going_on: [], whats_true: [], your_why: "",
      cost_of_waiting: "", steps: [], first_week: "", why_a_plan: "", flags,
    };
  }
  const type = TYPE_IDS.includes(r.type as TypeId) ? (r.type as TypeId) : null;
  const type_reason = str(r.type_reason, 450);
  const your_why = str(r.your_why, 900);
  const cost_of_waiting = str(r.cost_of_waiting, 750);
  const first_week = str(r.first_week, 1100);
  const why_a_plan = str(r.why_a_plan, 750);
  if (!type || !type_reason || !your_why || !cost_of_waiting || !first_week || !why_a_plan) return null;

  const whats_going_on = Array.isArray(r.whats_going_on)
    ? r.whats_going_on.map((p) => str(p, 900)).filter((x): x is string => !!x).slice(0, 4)
    : [];
  if (whats_going_on.length < (flags.low_info ? 1 : 2)) return null;

  const whats_true = Array.isArray(r.whats_true)
    ? r.whats_true
        .map((h) => {
          const o = (h || {}) as Record<string, unknown>;
          const title = str(o.title, 80);
          const text = str(o.text, 550);
          return title && text ? { title, text } : null;
        })
        .filter((x): x is { title: string; text: string } => !!x)
        .slice(0, 3)
    : [];
  if (whats_true.length < (flags.low_info ? 1 : 2)) return null;

  const seen = new Set<string>();
  const steps = Array.isArray(r.steps)
    ? r.steps
        .map((s) => {
          const o = (s || {}) as Record<string, unknown>;
          const rep_id = typeof o.rep_id === "string" ? o.rep_id : "";
          const headline = str(o.headline, 90);
          const when_where = str(o.when_where, 160);
          const what_to_do = str(o.what_to_do, 650);
          if (!REP_IDS.includes(rep_id) || seen.has(rep_id) || !headline || !what_to_do) return null;
          seen.add(rep_id);
          return { rep_id, headline, when_where: when_where || "", what_to_do };
        })
        .filter((x): x is AiResult["steps"][number] => !!x)
        .slice(0, 3)
    : [];
  if (steps.length !== 3) return null;

  return { type, type_reason, whats_going_on, whats_true, your_why, cost_of_waiting, steps, first_week, why_a_plan, flags };
}

export function toQuizResult(ai: AiResult): QuizResult {
  if (ai.flags.crisis) return { kind: "crisis" };
  if (ai.flags.under18) return { kind: "under18" };
  if (ai.flags.harm_others) return { kind: "harm_others" };
  return {
    kind: "result",
    lowInfo: ai.flags.low_info,
    type: ai.type,
    typeName: TYPES[ai.type].name,
    typeTagline: TYPES[ai.type].tagline,
    typeReason: ai.type_reason,
    whatsGoingOn: ai.whats_going_on,
    whatsTrue: ai.whats_true,
    yourWhy: ai.your_why,
    costOfWaiting: ai.cost_of_waiting,
    steps: ai.steps.map((s) => ({
      repId: s.rep_id,
      headline: s.headline,
      whenWhere: s.when_where,
      whatToDo: s.what_to_do,
      doneWhen: REPS[s.rep_id].doneWhen,
    })),
    firstWeek: ai.first_week,
    whyAPlan: ai.why_a_plan,
  };
}

// Used when the AI can't finish (bad format with no time to retry). Built only from the quick taps. No AI words.
export function fallbackResult(want: string | undefined, people: string | undefined): QuizResult {
  const type: TypeId =
    want === "stop_freezing" ? "freezer"
    : want === "meet_people" || want === "friends" || people === "none" ? "no_places"
    : "never_started";
  const stepsByType: Record<TypeId, string[]> = {
    freezer: ["social_battery", "day1_hi_question", "day5_waiting_chat"],
    no_places: ["text_old_friend", "day1_hi_question", "pick_weekly_thing"],
    burned_before: ["day1_hi_question", "day7_get_a_no", "text_old_friend"],
    never_started: ["social_battery", "day1_hi_question", "pick_weekly_thing"],
  };
  const reasons: Record<TypeId, string> = {
    freezer: "When it counts, your brain tries to plan the perfect thing to say. The planning is what eats the moment.",
    no_places: "The fix starts with where you spend your week, not with what you say.",
    burned_before: "Something stung before, and your brain made a rule to keep you safe. The rule is still running.",
    never_started: "You don't need to feel ready. You need one small step 1.",
  };
  return {
    kind: "result",
    fallback: true,
    lowInfo: false,
    type,
    typeName: TYPES[type].name,
    typeTagline: TYPES[type].tagline,
    typeReason: reasons[type],
    whatsGoingOn: [
      "We couldn't write your full read this time, so this one is based on your quick taps only.",
      "Here's what's true for almost every guy in your spot. Nobody handed you a step 1. \"Just put yourself out there\" isn't a step. That's not a flaw in you. It's a missing plan.",
    ],
    whatsTrue: [
      { title: "You don't need a perfect line", text: "A plain, honest question about the moment you're both in is enough. Then listen." },
      { title: "You're not behind", text: "Never having dated is more common than it feels. You're not broken. You're starting." },
    ],
    yourWhy: "You took this quiz because you want this part of life to change. That's a good reason, and it counts.",
    costOfWaiting: "Nothing bad happens tonight. The cost is quiet. Another year can go by the same way.",
    steps: stepsByType[type].map((id) => ({
      repId: id,
      headline: REPS[id].title,
      whenWhere: "",
      whatToDo: REPS[id].rep,
      doneWhen: REPS[id].doneWhen,
    })),
    firstWeek:
      "In the 30-day plan, Day 0 is about an hour of short reads and fill-in pages. Then Week 1 is one small rep a day, most under 5 minutes, with anyone: say hi and ask a barista one question, say one thing about a line you're in, text an old friend. Each week climbs one small step, until talking feels normal.",
    whyAPlan: "A plan means you never have to guess what to do next. One small rep a day, each a little bigger than the last.",
  };
}
