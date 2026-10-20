// Every fixed word and list the quiz uses. COPY.md mirrors this file.
// The AI may only pick steps from REPS and only describe plan parts from PLAN_PARTS.

export const LIMITS = {
  answerMaxChars: 1500,
  totalMaxChars: 15000, // 10 x 1,500: every answer the counter allows must fit (Tester fix)
  firstNameMax: 40,
  emailMax: 254,
  maxSkips: 2,
};

export const LINKS = {
  salesPage: "https://start.confidenceofayes.com/the-late-start",
  privacy: "https://start.confidenceofayes.com/privacy-policy",
  terms: "https://start.confidenceofayes.com/terms",
  disclaimer: "https://start.confidenceofayes.com/disclaimer",
  support: "support@confidenceofayes.com",
  lifelineChat: "https://988lifeline.org/chat/",
};

export type TapOption = { id: string; label: string };
export type Tap = { id: "age" | "dating" | "people" | "want"; question: string; options: TapOption[] };

export const TAPS: Tap[] = [
  {
    id: "age",
    question: "How old are you?",
    options: [
      { id: "under18", label: "Under 18" },
      { id: "18-21", label: "18 to 21" },
      { id: "22-25", label: "22 to 25" },
      { id: "26-29", label: "26 to 29" },
      { id: "30plus", label: "30 or older" },
    ],
  },
  {
    id: "dating",
    question: "How has dating gone so far?",
    options: [
      { id: "never_date", label: "I've never been on a date." },
      { id: "never_asked", label: "I've talked to girls, but never asked one out." },
      { id: "date_or_two", label: "I've been on a date or two." },
      { id: "dated_stuck", label: "I've dated some, but I feel stuck now." },
    ],
  },
  {
    id: "people",
    question: "In a normal week, how many new people do you talk to?",
    options: [
      { id: "none", label: "None" },
      { id: "1-2", label: "1 or 2" },
      { id: "3-5", label: "3 to 5" },
      { id: "6plus", label: "More than 5" },
    ],
  },
  {
    id: "want",
    question: "What do you want most right now?",
    options: [
      { id: "stop_freezing", label: "Stop freezing up" },
      { id: "meet_people", label: "Meet more people" },
      { id: "confidence", label: "Feel more confident" },
      { id: "ask_out", label: "Ask a girl out" },
      { id: "friends", label: "Make more friends" },
    ],
  },
];

export const VOICE_TIP = "Tip: tap the mic on your keyboard and just talk. Rambling is good.";

export const QUESTIONS: { id: string; text: string; helper: string }[] = [
  {
    id: "q1",
    text: "Tell me a little about you. What are you into, and what are you good at?",
    helper: "Hobbies, work, sports, games, faith, anything. There are no wrong answers.",
  },
  {
    id: "q2",
    text: "Walk me through a normal week. Where do you go, and who do you talk to?",
    helper: "Work, the gym, church, online, home. Just say how it really is.",
  },
  {
    id: "q3",
    text: "Think of the last time you wanted to talk to a woman and didn't. What happened, and what went through your head?",
    helper: "Where were you? What did you think right before you didn't? (Or a time you wanted to talk to anyone and didn't.)",
  },
  {
    id: "q4",
    text: "Has anything happened in the past that makes talking to women harder for you now? Only share what you want.",
    helper: "A no that stung, something someone said, a moment that stuck. Or skip it.",
  },
  {
    id: "q5",
    text: "How do you feel about where you are with women and dating right now?",
    helper: "Lonely, frustrated, embarrassed, fine, hopeful. Say it how it really is. Gage never sees your answers.",
  },
  {
    id: "q6",
    text: "A year from now, if dating and confidence were going well for you, what would your life look like?",
    helper: "Who are you with? What do your weekends look like? How do you feel about yourself?",
  },
  {
    id: "q7",
    text: "Is getting to that life important to you? If so, why?",
    helper: "Give the real reason, not just the first one that pops up. (Skipped the last question? Think of the life you wish you had.)",
  },
  {
    id: "q8",
    text: "What have you tried so far to get better at talking to women or dating? How did it go?",
    helper: "Dating apps, videos, books, asking friends, going out more. It's fine if the answer is \"nothing yet.\"",
  },
  {
    id: "q9",
    text: "What do you tell yourself is the reason you're not where you want to be with women yet?",
    helper: "The thought that shows up when you're by yourself.",
  },
  {
    id: "q10",
    text: "If you could try one small thing this week to talk to more people, what would you do? What would make it hard?",
    helper: "Small is good. Like saying hi to someone you see every week.",
  },
];

export type TypeId = "freezer" | "no_places" | "burned_before" | "never_started";

// Same 4 types as the free Starter Kit, so emails and videos still match.
export const TYPES: Record<TypeId, { name: string; tag: string; meaning: string }> = {
  freezer: {
    name: "The Freezer",
    tag: "Quiz - Freezer",
    meaning:
      "Not bad at talking. His brain hits the brakes when it matters most. Nerves, not a flaw. Needs a plan for the blank moment plus small reps.",
  },
  no_places: {
    name: "The No-Places Guy",
    tag: "Quiz - No-Places Guy",
    meaning:
      "Would talk to people, but there aren't many in his week. Work, home, maybe the gym. When school ended, the easy places dried up. Needs more people in his week first.",
  },
  burned_before: {
    name: "Burned Before",
    tag: "Quiz - Burned Before",
    meaning:
      "Tried, and it stung. Maybe someone laughed, or a no hit hard. Now his brain keeps him safe by keeping him quiet. Needs to make no small again, on purpose.",
  },
  never_started: {
    name: "Never Started",
    tag: "Quiz - Never Started",
    meaning:
      "Not behind. Never got a step 1. Kept waiting to feel ready. Needs one small thing today, not more thinking.",
  },
};

// Real reps from The Late Start workbook (Act 1 action steps, Week 1, and the When You Freeze card).
// The AI must pick 3 by id. The page always shows OUR title and done-when, never invented ones.
export const REPS: Record<string, { title: string; rep: string; doneWhen: string }> = {
  social_battery: {
    title: "Warm up your social battery",
    rep: "On a morning walk, say hi to people you pass. A little small talk. \"Have a good one.\" Do it each morning.",
    doneWhen: "You said hi to a few people on your walk.",
  },
  day1_hi_question: {
    title: "Hi + one question",
    rep: "Say hi to a cashier, barista or server and ask one real question: \"How's your day going?\" or \"What's good here?\" Listen to the answer.",
    doneWhen: "You asked and listened.",
  },
  day2_compliment_choice: {
    title: "Notice something they chose",
    rep: "Give one honest compliment to anyone, guy or girl, about something they chose: shoes, dog, shirt, order. Never their body. \"Cool hat. Where'd you get it?\"",
    doneWhen: "You said it out loud.",
  },
  day3_recommendation: {
    title: "Ask for a recommendation",
    rep: "Ask a stranger or staff member what they'd recommend: best thing on the menu, a good book, a trail nearby.",
    doneWhen: "You asked and said thanks.",
  },
  day4_eye_contact: {
    title: "Eye contact + nod, five times",
    rep: "Look five people in the eye and give a small nod or soft smile. That's it. It trains your body to stop looking at the floor.",
    doneWhen: "You hit five.",
  },
  day5_waiting_chat: {
    title: "The waiting-room chat",
    rep: "In a line, waiting room or elevator, say one thing about the shared moment: \"This line is wild today.\"",
    doneWhen: "You said it, whatever they said back.",
  },
  text_old_friend: {
    title: "Text one old friend",
    rep: "Text someone you used to know: \"Hey man, saw [thing] and thought of you. How've you been?\" If he answers, ask him to grab lunch or hit the gym this week.",
    doneWhen: "The message is sent.",
  },
  day7_get_a_no: {
    title: "Go get a \"no\"",
    rep: "Ask for something small you might not get: a first-time discount, a sample, someone to take your picture. Ask once, politely. Thank them either way.",
    doneWhen: "You asked. Bonus if you heard \"no.\" Notice how fast the sting fades.",
  },
  pick_weekly_thing: {
    title: "Pick your one weekly thing",
    rep: "Pick one thing that repeats every week, where you do something together, and men and women both go: a run club, rec league, church young adults group, volunteer shift, class or trivia night. Sign up or go once this week.",
    doneWhen: "You picked it and signed up or showed up.",
  },
  find_organizer: {
    title: "Find the organizer",
    rep: "At a group, class or club, go a little early and find the person running it: \"Hey, first time here. Anything I should know?\"",
    doneWhen: "You said it and learned one name.",
  },
  learn_a_name: {
    title: "Learn one name and use it",
    rep: "In a chat, say \"I'm [your name], by the way.\" Remember their name. Use it when you leave: \"Good talking with you, Mike.\"",
    doneWhen: "You learned a name and used it.",
  },
  parrot: {
    title: "Practice the Parrot",
    rep: "When your mind goes blank, repeat the last thing they said as a question. She says, \"I'm really close with my brother.\" You say, \"Your brother?\" Try it once in a real chat.",
    doneWhen: "You used it once.",
  },
  sort_your_week: {
    title: "Sort your week: green, yellow, red",
    rep: "List the places you'll be this week. Green: social by design (groups, classes, church events). Yellow: public but not social (coffee shop, store). Red: she's busy or stuck (mid-set at the gym, headphones in). Talk freely in green places.",
    doneWhen: "You sorted every place you'll be this week.",
  },
};

export const REP_IDS = Object.keys(REPS);

// Real parts of The Late Start the AI may point to in plan_fit. Nothing else.
export const PLAN_PARTS = [
  "The Rep Ladder: 4 weeks, one small rep a day. Week 1 warm-up reps (strangers, low stakes). Week 2 stay-in reps (keep a conversation going 2 to 5 minutes). Week 3 real-life reps (women you already see every week, no agenda). Week 4 ask reps (one clear, kind ask).",
  "Chapter 1, You're Not Behind. You're Starting: the three lies the \"behind\" voice tells you (\"I wasted my youth,\" \"She'll think something's wrong with me,\" \"If it was going to happen, it would have\"), and what you control besides looks.",
  "Chapter 2, Build Your Circle: be a regular, not a visitor. Pick one weekly thing. Text one old friend. How to join a group when you know nobody.",
  "Chapter 3, Respect First: the green, yellow, red rule for where it's OK to talk to her, how to tell interest from politeness, and the leave-well rule.",
  "The When You Freeze card: Parrot, go back to something she said, have her say it again, ask about the moment, or end it well with her name.",
  "The Notice, Ask, Follow loop for keeping a conversation going (Week 2).",
  "The Places Map: where to go every week so you see the same people again. Familiarity beats first impressions.",
  "The ask in one clear sentence: what you like + a simple plan + a specific day. \"Let's grab coffee Saturday.\" (Week 4)",
  "Hear It, Leave Well, Reset: the 3 steps after a no, so one answer never ruins your week (Chapter 8).",
  "Chapter 9, When She Says Yes: a simple first date, the 80/20 rule, and \"Do I tell her I've never dated?\"",
  "The 30-Day Rep Tracker: see your progress in real numbers.",
  "30 Rep Cards: today's rep on your phone.",
  "The AI Practice Partner: practice saying hi, keeping it going, and the ask, before you do it for real.",
];

export const OFFER = {
  name: "The Late Start: The 30-Day Plan for Guys Who've Never Dated",
  price: "$27",
};
