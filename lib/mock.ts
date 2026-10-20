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
    "You're not shy around people. You talk to your crew every day, and they just made you team lead. But when a girl you like is close, your brain starts writing a script, and by the time it's done, she's gone.",
  whats_going_on: [
    "It started in 10th grade. You asked a girl to a dance in front of people, and she laughed and said \"oh my gosh, no.\" That's heavy for a kid. Your brain took one lesson from it: never get caught off guard like that again. So you stopped trying. Back then, that was your brain keeping you safe.",
    "That lesson never left. It changed shape. Now, instead of not trying at all, your brain tries to make it perfect first. Every Tuesday she's right there at the water fountain, and you write the whole talk in your head. You said \"I overthink it until the moment is gone.\" Going blank and overthinking aren't two problems. They're one. The script is armor. If every line is planned, nobody can laugh at you again. But a script takes time, and real moments are short.",
    "Here's what the armor costs you. Every moment that passes turns into proof for the story in your head: not good enough, not interesting, not a natural. Then the next moment feels even bigger, so the script gets even longer. That loop is why you feel frustrated and embarrassed, and why it stings when your friends are with someone. You've been trying to do it perfectly, with zero practice.",
    "Now look at the rest of your life. You've lifted for three years. Your dad taught you cars, and now you're good with them. You just got promoted. Every one started with reps you were bad at. Talking to a girl works the same way. You're missing reps, not something inside you.",
  ],
  whats_true: [
    {
      title: "Nobody is a natural",
      text: "You said you're \"not a natural.\" Neither is anyone. The guys who look natural just took more reps, earlier. A little nervous but kind beats smooth. Your nerves aren't what lose the moment. The waiting is.",
    },
    {
      title: "That laugh was one moment",
      text: "One girl, one dance, one bad answer, back in 10th grade. It was never a verdict on who you are at 24. A no is one person's answer to one question, on one day. You can relearn that in small doses.",
    },
  ],
  your_why:
    "You want to get married and have a family someday. That's about the biggest reason there is. You also said you don't want to be 30 and still the guy who never made a move, and you want to stop feeling like something's wrong with you. So hear this plainly: nothing is wrong with you. You want a wife and a family, and you're willing to feel awkward to get there. That's the kind of reason that carries a guy through the first hard reps.",
  cost_of_waiting:
    "If you change nothing, nothing bad happens tonight. You'll still lift, still go to church, still see her on Tuesday. The script keeps running, and the moments keep passing, one at a time. You named 30 as the line you don't want to cross. That's six years away, and years slide by fast when every week looks the same. The good news: the fix starts small, and it can start this week.",
  steps: [
    {
      rep_id: "social_battery",
      headline: "Warm up on the way into the gym",
      when_where: "Every gym night this week, from your truck to the front desk",
      what_to_do:
        "Nod and say hi to people you pass on the way in. \"What's up, man.\" \"Have a good one.\" That's all. You're warming up, so by the time you're inside, talking doesn't feel like flipping a cold switch.",
    },
    {
      rep_id: "day1_hi_question",
      headline: "Ask the barista one real question",
      when_where: "Two or three mornings this week, at the coffee place by work",
      what_to_do:
        "You're there almost every morning, so this is easy ground. When you order, ask, \"How's your morning going?\" Then really listen, and say one thing back. No script. That one plain question is the whole rep.",
    },
    {
      rep_id: "hi_regular",
      headline: "Say hi at the water fountain",
      when_where: "Tuesday at the gym, when she's at the fountain between sets",
      what_to_do:
        "This is the one you named yourself. Don't plan a speech. If she's resting and has no headphones in, say one plain thing: \"Hey, how's your workout going?\" Listen, say one thing back, then let her get back to it: \"Have a good one.\" If she gives a short answer, smile and go. You still did it.",
    },
  ],
  belief_cards: [
    {
      id: "perfect_line",
      personal_line:
        "You don't need the script you write at the water fountain. Ask about her workout, then really listen to what she says.",
    },
    {
      id: "looks",
      personal_line:
        "You put looks on your list. Your crew made you team lead. Being kind and steady counts here too, maybe more than you think.",
    },
  ],
  first_week:
    "Here's what your first week in the 30-day plan would look like. Day 0 is about an hour of short reads. You'd learn where talking to someone is normal and when to leave her alone, so the gym stops feeling like a guessing game. Day 1 is one small rep: ask the barista by work one real question. By Day 7 you go get a small no on purpose, like asking for a free sample, so your brain learns a no is over in seconds. By Week 3, you're having easy talks with people you already see, at the gym and at church, where you're already in a room full of people every Sunday. That's how the water fountain turns from a big moment into a normal Tuesday.",
  why_a_plan:
    "You already tried the usual stuff. Your buddy said \"just go talk to her bro,\" and he meant well, but that skips every step in between. The videos felt sleazy, and that's not who you are. The app gave you matches and nothing to say. What you haven't had is a plan: one small rep a day, each a little bigger than the last, so you never have to guess what's next. You're good at things you practice. This is something you can practice.",
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
