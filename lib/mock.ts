import { AiResult } from "./result";

// QUIZ_MOCK=1 returns this instead of calling the AI. Same sample as SAMPLE_RESULT.md ("Marcus", made up).
// Typing the word "mockcrisis", "mockunder18", "mockharm" or "mockjunk" in any answer switches the mock
// to that path, so the Tester can see every screen without a real key. (Real crisis words still trip
// the server keyword check first, in mock mode too.)
export const MOCK_RESULT: AiResult = {
  type: "freezer",
  type_reason: "You're around people every week, but when it counts, you said the hard part is \"my mind going blank.\"",
  where_you_are:
    "Your week is work at the warehouse, the gym four nights, and church on Sundays. You're not alone. You're around people. But at the gym you wanted to say something to a girl by the water fountain, and you said \"I ran the whole thing in my head and then she left.\" That's the moment this is about.",
  where_you_want:
    "A year from now, you want a normal week with friends on the weekend and someone to take to dinner. You said it matters because you \"don't want to be the guy who always waited.\"",
  holding_back: [
    {
      title: "The blank moment",
      text: "You run the whole talk in your head first, so there's nothing left when it's real. The When You Freeze steps give you a move for that exact second, starting with the Parrot.",
    },
    {
      title: "The \"behind\" voice",
      text: "You tell yourself \"it's too late, everyone figured this out in high school.\" That's the \"behind\" voice. Like the lie \"if it was going to happen, it would have,\" it skips the real reason: nobody gave you a step 1.",
    },
    {
      title: "Jumping to the big rep",
      text: "You keep picturing the scary ask. You skip the small reps that make it easy, like saying hi to a cashier first.",
    },
  ],
  steps: [
    {
      rep_id: "day1_hi_question",
      how: "Wherever you grab food or coffee this week, ask the person at the counter \"How's your day going?\" Then really listen to the answer.",
    },
    {
      rep_id: "day5_waiting_chat",
      how: "Waiting for a rack at the gym, say one thing about the moment: \"It's packed tonight, huh?\" Whatever they say back, you did it.",
    },
    {
      rep_id: "parrot",
      how: "After church, when someone tells you about their week, repeat their last words back as a question. \"Your new job?\" Let them keep going.",
    },
  ],
  if_nothing_changes:
    "Nothing bad happens tonight. You'll keep going to the gym and church, and keep running talks in your head. A year from now, you could still be the guy who always waited. You said you don't want that.",
  bridge_intro:
    "You said you want to stop freezing and actually talk to someone. The 30-day plan is built to walk you there one small rep at a time.",
  plan_fit: [
    "You said your mind goes blank. The When You Freeze card gives you five moves, in order, for that exact moment.",
    "You're already at the gym and church every week. The Week 3 real-life reps are about talking with women you already see, with no agenda.",
    "You keep jumping to the scary part. The Rep Ladder starts with a barista and climbs one small step a day, so the ask in Week 4 isn't a leap.",
  ],
  flags: { crisis: false, under18: false, harm_others: false, low_info: false },
};

export function mockFor(answers: (string | null)[]): AiResult {
  const all = answers.join(" ").toLowerCase();
  const empty = { ...MOCK_RESULT, flags: { ...MOCK_RESULT.flags } };
  if (all.includes("mockcrisis")) empty.flags.crisis = true;
  else if (all.includes("mockunder18")) empty.flags.under18 = true;
  else if (all.includes("mockharm")) empty.flags.harm_others = true;
  else if (all.includes("mockjunk")) empty.flags.low_info = true;
  return empty;
}
