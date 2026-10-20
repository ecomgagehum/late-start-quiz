import { REPS, REP_IDS, TYPES, TypeId } from "./content";

// What the AI must return (the tool input), before we enrich it.
export type AiResult = {
  type: TypeId;
  type_reason: string;
  where_you_are: string;
  where_you_want: string;
  holding_back: { title: string; text: string }[];
  steps: { rep_id: string; how: string }[];
  if_nothing_changes: string;
  bridge_intro: string;
  plan_fit: string[];
  flags: { crisis: boolean; under18: boolean; harm_others: boolean; low_info: boolean };
};

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
      typeReason: string;
      whereYouAre: string;
      whereYouWant: string;
      holdingBack: { title: string; text: string }[];
      steps: { repId: string; title: string; how: string; doneWhen: string }[];
      ifNothingChanges: string;
      bridgeIntro: string;
      planFit: string[];
    };

const TYPE_IDS = Object.keys(TYPES) as TypeId[];

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  // Plain text only: drop angle brackets and em/en dashes, collapse space.
  const s = v.replace(/[<>]/g, "").replace(/\s*[—–]\s*/g, ", ").replace(/\s+/g, " ").trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}

// Returns null when the shape is wrong (caller retries once).
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
      type: "never_started", type_reason: "", where_you_are: "", where_you_want: "", holding_back: [],
      steps: [], if_nothing_changes: "", bridge_intro: "", plan_fit: [], flags,
    };
  }
  const type = TYPE_IDS.includes(r.type as TypeId) ? (r.type as TypeId) : null;
  const type_reason = str(r.type_reason, 400);
  const where_you_are = str(r.where_you_are, 700);
  const where_you_want = str(r.where_you_want, 500);
  const if_nothing_changes = str(r.if_nothing_changes, 500);
  const bridge_intro = str(r.bridge_intro, 300);
  if (!type || !type_reason || !where_you_are || !where_you_want || !if_nothing_changes || !bridge_intro) return null;

  const holding_back = Array.isArray(r.holding_back)
    ? r.holding_back
        .map((h) => {
          const o = (h || {}) as Record<string, unknown>;
          const title = str(o.title, 80);
          const text = str(o.text, 400);
          return title && text ? { title, text } : null;
        })
        .filter((x): x is { title: string; text: string } => !!x)
        .slice(0, 3)
    : [];
  if (holding_back.length < 2) return null;

  const seen = new Set<string>();
  const steps = Array.isArray(r.steps)
    ? r.steps
        .map((s) => {
          const o = (s || {}) as Record<string, unknown>;
          const rep_id = typeof o.rep_id === "string" ? o.rep_id : "";
          const how = str(o.how, 350);
          if (!REP_IDS.includes(rep_id) || seen.has(rep_id) || !how) return null;
          seen.add(rep_id);
          return { rep_id, how };
        })
        .filter((x): x is { rep_id: string; how: string } => !!x)
        .slice(0, 3)
    : [];
  if (steps.length !== 3) return null;

  const plan_fit = Array.isArray(r.plan_fit)
    ? r.plan_fit.map((p) => str(p, 300)).filter((x): x is string => !!x).slice(0, 3)
    : [];
  if (plan_fit.length < 2) return null;

  return { type, type_reason, where_you_are, where_you_want, holding_back, steps, if_nothing_changes, bridge_intro, plan_fit, flags };
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
    typeReason: ai.type_reason,
    whereYouAre: ai.where_you_are,
    whereYouWant: ai.where_you_want,
    holdingBack: ai.holding_back,
    steps: ai.steps.map((s) => ({ repId: s.rep_id, title: REPS[s.rep_id].title, how: s.how, doneWhen: REPS[s.rep_id].doneWhen })),
    ifNothingChanges: ai.if_nothing_changes,
    bridgeIntro: ai.bridge_intro,
    planFit: ai.plan_fit,
  };
}

// Used when the AI fails twice. Built only from the quick taps. No AI words.
export function fallbackResult(want: string | undefined, people: string | undefined): QuizResult {
  const type: TypeId =
    want === "stop_freezing" ? "freezer"
    : want === "meet_people" || want === "friends" || people === "none" ? "no_places"
    : "never_started";
  const stepsByType: Record<TypeId, string[]> = {
    freezer: ["parrot", "day1_hi_question", "day5_waiting_chat"],
    no_places: ["pick_weekly_thing", "text_old_friend", "day1_hi_question"],
    burned_before: ["day7_get_a_no", "day1_hi_question", "text_old_friend"],
    never_started: ["day1_hi_question", "social_battery", "pick_weekly_thing"],
  };
  const reasons: Record<TypeId, string> = {
    freezer: "You said you want to stop freezing up. That usually means you can talk. Your brain just hits the brakes when it counts.",
    no_places: "The first move is more people in your week. The fix starts with where you spend your time, not with what you say.",
    burned_before: "Something stung before, and now your guard is up.",
    never_started: "You don't need to feel ready. You need one small step 1.",
  };
  return {
    kind: "result",
    fallback: true,
    lowInfo: false,
    type,
    typeName: TYPES[type].name,
    typeReason: reasons[type],
    whereYouAre: "We couldn't write your full read this time, so this one is based on your quick taps only.",
    whereYouWant: "You took this quiz because you want this part of life to change. That counts.",
    holdingBack: [
      { title: "No step 1", text: "Nobody handed you a first step, and \"it'll happen when you least expect it\" isn't a step." },
      { title: "The \"behind\" voice", text: "It says you're too late. You're not behind. You're starting." },
    ],
    steps: stepsByType[type].map((id) => ({ repId: id, title: REPS[id].title, how: REPS[id].rep, doneWhen: REPS[id].doneWhen })),
    ifNothingChanges: "Nothing bad happens tonight. The cost is quiet. Another year can go by the same way.",
    bridgeIntro: "If you want a step for every day, not just this week, that's what the 30-day plan is.",
    planFit: [
      "The Rep Ladder gives you one small rep a day for 4 weeks, each a little bigger than the last.",
      "The When You Freeze card tells you what to do when your mind goes blank.",
      "Build Your Circle shows you where to find people you'll see every week.",
    ],
  };
}
