import { AiResult } from "./result";

// QUIZ_MOCK=1 returns this instead of calling the AI. Same sample as SAMPLE_RESULT_V2.md ("Marcus", 24, made up
// by Gage to test the quiz). Written by hand as the quality bar for the v2 prompt: it READS him (past -> present ->
// future), it doesn't list his answers back.
// Typing the word "mockcrisis", "mockunder18", "mockharm" or "mockjunk" in any answer switches the mock
// to that path, so the Tester can see every screen without a real key. (Real crisis words still trip
// the server keyword check first, in mock mode too.)

// Marcus's answers, exactly as the sample uses them (also typed by scripts/screens.cjs).
export const MARCUS_ANSWERS = [
  "I've been lifting for about 3 years. I play video games online with my buddies most nights. I just got promoted to team lead at the warehouse. I'm good with cars, my dad taught me. Church on Sundays is a big deal for me.",
  "I work 6 to 3. Gym at 5:30 four nights a week. I talk to my coworkers. Sunday is church and then lunch with my parents. Weekends I play games or work on my truck. I don't really meet new people.",
  "There's a girl by the water fountain at my gym every Tuesday. I scripted the whole conversation in my head and then she walked away. My mind goes blank or I overthink it until the moment is gone.",
  "In 10th grade I asked a girl to a dance in front of people. She laughed and said \"oh my gosh, no.\" I kind of stopped trying after that.",
  "Frustrated and embarrassed. I'm 24 and I've never been on a real date. Most of my friends are in relationships and that stings. I feel behind.",
  "I could walk up to a girl without my heart pounding. I'd go on some dates, maybe have someone I'm seeing. More friends on the weekends, not just online. I'd feel like myself.",
  "Yes. I want to get married and have a family someday. I don't want to be 30 and still the guy who never made a move. I want to stop feeling like something's wrong with me.",
  "I tried a dating app. Got 2 matches, didn't know what to say, deleted it. Watched some confidence videos on YouTube but they felt like sleazy pickup stuff. My buddy said \"just go talk to her bro.\"",
  "I'm not good enough. Not interesting enough or good-looking enough. I'll say something stupid. I'm not a natural.",
  "say hi to the girl by the water fountain. or talk to the barista at the coffee place by work, I go there almost every morning.",
];

export const MOCK_RESULT: AiResult = {
  type: "freezer",
  type_reason:
    "You talk to your crew every day, but when a girl you like is close, your brain writes a script until she's gone.",
  whats_going_on: [
    "In 10th grade a girl laughed at your dance invite. Your brain learned one rule: never get caught off guard again.",
    "Now that rule shows up as scripting. Every Tuesday at the water fountain, you plan the whole talk and the moment passes.",
    "The script is armor. Nobody can laugh at a line you never say. The cost: every missed moment feels like proof you're \"not a natural.\"",
    "You got good at lifting, cars and your job with reps. This works the same way.",
  ],
  plan_fixes: [
    { his_issue: "You script it until the moment is gone", plan_fix: "Week 1 trains you to say the plain, obvious thing about the moment. No clever line needed." },
    { his_issue: "Your mind goes blank", plan_fix: "Week 2 gives you a simple loop to keep a chat going, plus a card for when you blank." },
    { his_issue: "That old laugh still runs the show", plan_fix: "Day 7 you get a small no on purpose, so your brain learns a no is over in seconds." },
  ],
  whats_true: [
    { title: "Nobody is a natural", text: "The guys who look natural just took more reps, earlier. Kind and a little nervous beats smooth." },
    { title: "That laugh was one moment", text: "One girl, one dance, back in 10th grade. It was never a verdict on who you are at 24." },
  ],
  your_why:
    "You want a wife and a family someday. That's a great reason, and nothing is wrong with you. You're missing reps.",
  cost_of_waiting:
    "Nothing bad happens tonight. But you named 30 as the line, and years slide by fast when every week looks the same.",
  steps: [
    {
      rep_id: "social_battery",
      headline: "Warm up on the way into the gym",
      when_where: "Every gym night this week, truck to front desk",
      what_to_do: "Nod and say hi to people you pass: \"What's up, man.\" That's the whole rep.",
    },
    {
      rep_id: "day1_hi_question",
      headline: "Ask the barista one real question",
      when_where: "Two mornings this week, coffee place by work",
      what_to_do: "Ask, \"How's your morning going?\" Listen, say one thing back, then \"Have a good one.\"",
    },
    {
      rep_id: "hi_regular",
      headline: "Say hi at the water fountain",
      when_where: "Tuesday at the gym, between sets",
      what_to_do: "The one you named. If she's resting, no headphones: \"Hey, how's your workout going?\" Then let her get back to it.",
    },
  ],
  belief_cards: [
    { id: "perfect_line", personal_line: "You don't need the script. Ask about her workout and really listen." },
  ],
  first_week:
    "Day 0 is an hour of short reads. Day 1 you ask the barista one real question. By Week 3 you're having easy talks with people you already see at the gym and church.",
  why_a_plan:
    "\"Just go talk to her\" skipped every step, and the videos felt sleazy. A plan gives you one small rep a day.",
  flags: { crisis: false, under18: false, harm_others: false, low_info: false },
};

export function mockFor(answers: (string | null)[]): AiResult {
  const all = answers.join(" ").toLowerCase();
  const out = { ...MOCK_RESULT, flags: { ...MOCK_RESULT.flags } };
  if (all.includes("mockcrisis")) out.flags.crisis = true;
  else if (all.includes("mockunder18")) out.flags.under18 = true;
  else if (all.includes("mockharm")) out.flags.harm_others = true;
  else if (all.includes("mockjunk")) out.flags.low_info = true;
  return out;
}
