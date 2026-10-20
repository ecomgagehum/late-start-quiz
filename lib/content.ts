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
      { id: "stop_freezing", label: "Stay calm when it's time to talk" },
      { id: "meet_people", label: "Meet more people" },
      { id: "confidence", label: "Feel sure of myself" },
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
    text: "Finish this sentence: \"One small thing I could do this week to talk to more people is...\"",
    helper: "Small is good. Like saying hi to the barista you see every week, or asking a coworker how their weekend was.",
  },
];

export type TypeId = "freezer" | "no_places" | "burned_before" | "never_started";

// The 4 types. The ids and Kajabi tags stay the same as the Starter Kit (so tagging keeps working).
// The display names name the HIDDEN pattern behind the symptom, not the symptom he tapped.
// name + tagline are fixed and shown by the page. meaning is for the AI only.
export const TYPES: Record<TypeId, { name: string; tag: string; tagline: string; meaning: string }> = {
  freezer: {
    name: "The Over-Scripter",
    tag: "Quiz - Freezer",
    tagline: "Your brain writes the whole talk first, so nothing can go wrong. By the time the script is done, the moment is gone.",
    meaning:
      "He is around people and can talk. When it matters, his brain tries to plan every line so he can't mess up. Planning feels safe, but it eats the moment. The protection: if it's perfect, nobody can laugh or say no. The cost: the moment passes and he blames himself. The fix: drop the script. A plain, honest first sentence about the moment, then listen. Short, small reps until starting feels normal.",
  },
  no_places: {
    name: "The Closed Loop",
    tag: "Quiz - No-Places Guy",
    tagline: "Your week runs on the same few places and the same few people. You're not the problem. There's just no door for anyone new.",
    meaning:
      "He would talk to people, but his week is a closed loop: work, home, maybe the gym, mostly the same faces. If school ended, the easy places dried up (if he's still in school, don't say it ended). The protection: a loop is safe and needs no risk. The cost: nobody new can walk in, so nothing changes. The fix: add one weekly place where he sees the same people again, and reach back to people he already knows.",
  },
  burned_before: {
    name: "The Old Rule",
    tag: "Quiz - Burned Before",
    tagline: "One moment that stung wrote a rule: don't try, and it can't happen again. The moment is over. The rule is still running.",
    meaning:
      "He tried once and it hurt. Someone laughed, or a no hit hard, maybe in front of people. His brain made a rule to keep him safe: don't put yourself out there. The rule worked, so it stayed. The cost: it still makes his choices years later. The fix: show his brain, on purpose and in small doses, that a no is short and survivable, and that he can leave with his head up.",
  },
  never_started: {
    name: "The Someday Guy",
    tag: "Quiz - Never Started",
    tagline: "You're waiting to feel ready first. But ready shows up after the first steps, not before them.",
    meaning:
      "Not behind. He never got a step 1, so he keeps waiting to feel ready, sure, or good enough. The protection: if he never starts, he can never fail. The cost: someday keeps sliding. The fix: one small, easy thing this week, done before he feels ready, so ready can catch up.",
  },
};

// Real reps from The Late Start workbook (Week 1 reps, Act 1 action steps, Week 2-3 reps, the When You Freeze card).
// The AI must pick 3 by id and may only fit them to his places, times and words.
// title = plain-English name the page can show. doneWhen is always ours, never AI-written.
// fit = when the rep is a good pick (AI only).
export const REPS: Record<string, { title: string; rep: string; doneWhen: string; fit: string }> = {
  social_battery: {
    title: "Warm up on the way",
    rep: "On a walk or on the way somewhere, say hi to people you pass. A nod, a smile, \"Have a good one.\" No full talks needed. It warms you up so talking later doesn't feel like flipping a cold switch.",
    doneWhen: "You said hi to a few people on the way.",
    fit: "Easiest first step for anyone. Great right before a place where he wants to talk (the gym, work, church).",
  },
  day4_eye_contact: {
    title: "Eye contact and a nod, five times",
    rep: "Look five people in the eye and give a small nod or soft smile. That's it. It trains your body to stop looking at the floor.",
    doneWhen: "You hit five.",
    fit: "Very easy first step. Good when even saying hi feels like too much.",
  },
  day1_hi_question: {
    title: "Say hi and ask one real question",
    rep: "Say hi to a cashier, barista or server and ask one real question: \"How's your day going?\" or \"What's good here?\" Then listen to the answer.",
    doneWhen: "You asked and listened.",
    fit: "Low-stakes practice at saying the first sentence. Best at a place he goes often (his coffee spot, lunch spot, gas station).",
  },
  day5_waiting_chat: {
    title: "Say one thing about the moment you share",
    rep: "In a line, a waiting room or an elevator, say one plain thing about what you're both in: \"This line is wild today.\" No clever line needed. Nobody remembers the first sentence.",
    doneWhen: "You said it, whatever they said back.",
    fit: "Teaches that a plain comment about the moment is enough. Great for a guy who scripts or thinks he needs a perfect opener.",
  },
  day2_compliment_choice: {
    title: "Compliment something they chose",
    rep: "Give one honest compliment to anyone, guy or girl, about something they chose: shoes, dog, shirt, order. Never their body. \"Cool hat. Where'd you get it?\"",
    doneWhen: "You said it out loud.",
    fit: "A step up from hi. Good for practice with anyone, not only women.",
  },
  day3_recommendation: {
    title: "Ask what they'd recommend",
    rep: "Ask a stranger or staff member what they'd recommend: best thing on the menu, a good book, a trail nearby. Say thanks.",
    doneWhen: "You asked and said thanks.",
    fit: "Easy question that gets people talking. Good at a coffee shop, store or restaurant he already goes to.",
  },
  day7_get_a_no: {
    title: "Go get a small no on purpose",
    rep: "Ask for something small you might not get: a first-time discount, a sample, someone to take your picture. Ask once, politely. Thank them either way. It teaches your brain that a no is small and over fast.",
    doneWhen: "You asked. Bonus if you heard \"no.\" Notice how fast the sting fades.",
    fit: "Best for a guy held back by an old no or being laughed at. Shows him a no is survivable.",
  },
  hi_regular: {
    title: "Say hi to someone you see every week",
    rep: "Pick someone you already see often (gym, work, church, your coffee spot). When she or he is not busy, say hi plus one short, friendly thing about the moment or one easy question. Then let it end kindly: \"Have a good one.\" Only when they can easily walk away. Never mid-workout, never with headphones in, never when they're stuck working.",
    doneWhen: "You said hi and one thing, then let it end well.",
    fit: "The bridge from strangers to people he sees every week. Use it when he named a real person or place in question 10, as the last (hardest) step.",
  },
  learn_a_name: {
    title: "Learn one name and use it",
    rep: "In a chat, say \"I'm [your name], by the way.\" Remember their name. Use it when you leave: \"Good talking with you, Mike.\"",
    doneWhen: "You learned a name and used it.",
    fit: "Good for someone he sees every week (coworker, gym regular, church). Turns a face into a person.",
  },
  callback: {
    title: "Bring back something they told you",
    rep: "Bring up something someone told you before: \"How'd the 5K go?\" \"Did you end up getting that job?\" People feel remembered.",
    doneWhen: "You made one callback.",
    fit: "For a guy who already has small chats with coworkers or regulars and wants to go one step deeper.",
  },
  parrot: {
    title: "Repeat their last words as a question",
    rep: "Once a conversation has started and your mind goes blank, repeat the last thing they said as a question. She says, \"I'm really close with my brother.\" You say, \"Your brother?\" They keep going, and you get a second to think.",
    doneWhen: "You used it once in a real chat.",
    fit: "ONLY for a guy who can already start conversations but they die after a line or two. Never for a guy who can't get the first word out.",
  },
  text_old_friend: {
    title: "Text one old friend",
    rep: "Text someone you used to know: \"Hey man, saw [thing] and thought of you. How've you been?\" If he answers, ask him to grab lunch or hit the gym this week.",
    doneWhen: "The message is sent.",
    fit: "For a guy whose week has few people, or whose friends are mostly online. Friends bring friends.",
  },
  pick_weekly_thing: {
    title: "Pick one thing you go to every week",
    rep: "Pick one thing that repeats every week, where you do something together, and men and women both go: a run club, rec league, church young adults group, volunteer shift, class or trivia night. Sign up or go once this week. Seeing the same people every week is how strangers become friends.",
    doneWhen: "You picked it and signed up or showed up.",
    fit: "For a guy with few places in his week. If he goes to church, a young adults group there is a natural pick.",
  },
  find_organizer: {
    title: "Talk to the person running the group",
    rep: "At a group, class or club, go a little early and find the person running it: \"Hey, first time here. Anything I should know?\" They often introduce you to others.",
    doneWhen: "You said it and learned one name.",
    fit: "For a guy who already has a group or class to go to but feels like an outsider there.",
  },
  sort_your_week: {
    title: "Sort your week by where talking is normal",
    rep: "List the places you'll be this week. Mark each one. Social places (groups, classes, church events): talk freely. Public places (coffee shop, store): a friendly comment is fine, and let it go if she doesn't keep it going. Busy moments (mid-workout, headphones in, she's working): just be polite, no flirting.",
    doneWhen: "You sorted every place you'll be this week.",
    fit: "For a guy who freezes because he worries about being creepy or bothering people.",
  },
};

export const REP_IDS = Object.keys(REPS);

// Real parts of The Late Start the AI may describe in the bridge. Nothing else. Plain words, no chapter numbers.
export const PLAN_PARTS = [
  "Day 0 (about one hour, before any reps): three short reads with fill-in pages. 1) You're not behind, you're starting: the three lies the \"behind\" voice tells you (\"I wasted my youth,\" \"She'll think something's wrong with me,\" \"If it was going to happen, it would have\") and what he controls besides looks. 2) Build your circle: pick one thing he goes to every week, text one old friend, how to join a group when you know nobody. 3) Respect first: where it's normal to talk to someone, how to tell real interest from being polite, and how to end a chat well.",
  "Week 1, warm-up reps (Days 1 to 7), one short rep a day, mostly under 5 minutes, all low stakes and with anyone, not dating: Day 1 say hi to a cashier or barista and ask one real question. Day 2 compliment something someone chose. Day 3 ask for a recommendation. Day 4 eye contact and a nod, five times. Day 5 say one thing about a shared moment, like a line. Day 6 text an old friend or meet the organizer of a group. Day 7 go get a small no on purpose. Plus a short morning warm-up walk where he says hi to people he passes. The rule for the week: say the plain, obvious thing about the moment. No clever line needed.",
  "Week 2, stay-in reps (Days 8 to 14): keep a chat going 2 to 5 minutes. A simple loop: notice something, ask an open question, then follow up on their answer. Share a little about yourself, then ask. Get their name and use it. Speak slow and listen to understand, not to plan your next line.",
  "What to do when your mind goes blank, in order (on a small card he keeps on his phone): repeat their last words as a question, go back to something they said earlier, ask them to say it again, ask about the moment, or end it kindly with their name.",
  "Week 3, real-life reps (Days 15 to 21): friendly talks with women he already sees every week (his weekly group, work, church, the gym before or after a workout), with no agenda. Learn her name, a 3-minute chat, bring back something she told him. Seeing the same people again matters more than a perfect first impression.",
  "Week 4, ask reps (Days 22 to 28): plan and practice one ask, then make it in one clear, kind sentence: what you like about talking to her, a simple plan, a specific day. \"I always have fun talking with you. Let's grab coffee Saturday.\" Then accept whatever she says.",
  "After a no: hear it the first time, leave kindly (\"No worries, have a good one\"), then a 10-minute reset the same day (move your body, log the rep, write two lines, talk to one person). A no is her answer to one question, on one day.",
  "When she says yes: a simple first date, how to talk on it, and what to say if she asks \"Have you dated much?\" (don't lead with it, be honest and brief if it comes up).",
  "The 30-Day Rep Tracker: he logs what he did, not how it went, and sees progress in real numbers.",
  "30 Rep Cards: today's rep on his phone.",
  "The AI Practice Partner: practice saying hi, keeping a chat going, and the ask, out loud, before doing it for real. For practice, never for scripts.",
];

// Belief cards (Oct 20, 2026). The ONLY place a number or study shows up on the results page.
// Every word here is fixed and shown by the page as written. The AI never writes a number.
// The AI only picks up to 2 ids that match his answers, plus one short personal line per card (no numbers).
// belief = what he tells himself, in his voice. research = what the research says (plain words). source = small line.
// gist = what the AI is told the card says (no numbers on purpose, so it has none to echo). fit = when to pick it (AI only).
export type BeliefId = "behind" | "perfect_line" | "looks" | "bother" | "not_natural" | "no_places" | "nice_guy" | "no_means";

export const BELIEFS: Record<BeliefId, { belief: string; research: string; takeaway: string; source: string; url: string; gist: string; fit: string }> = {
  behind: {
    belief: "I'm way behind everyone else.",
    research:
      "Hinge's 2024 Gen Z report surveyed more than 15,000 daters. Over half (56%) said worrying about rejection has stopped them from going after someone, and 57% said they've held back from telling someone how they felt.",
    takeaway: "You're not the only one who's been stuck. Most guys your age feel this too.",
    source: "Hinge, Gen Z D.A.T.E. Report, 2024 (a survey of Hinge users)",
    url: "https://hinge.co/press/2024-GenZ-Report",
    gist: "In a big dating app survey, lots of young daters said fear of rejection has stopped them, and lots have held back their feelings. He is not the only one.",
    fit: "He says he's behind, late, wasted his youth, or that everyone else has dated but him.",
  },
  perfect_line: {
    belief: "I'll say something stupid. I need the right line.",
    research:
      "A 2017 Harvard study (Huang and others, Journal of Personality and Social Psychology) found that people who asked more follow-up questions, meaning questions about what the other person just said, were liked more. In the speed-dating part of the study, people who asked more follow-up questions got more yeses for a second date.",
    takeaway: "You don't need a line. You need to be interested in her answer.",
    source: "Huang, Yeomans, Brooks, Minson and Gino, \"It Doesn't Hurt to Ask: Question-Asking Increases Liking,\" Journal of Personality and Social Psychology, 2017",
    url: "https://dash.harvard.edu/handle/1/42704282",
    gist: "A Harvard study found people who ask follow-up questions about what the other person just said are liked more, even on speed dates. Interest beats a clever line.",
    fit: "He scripts, plans lines, goes blank, is afraid of saying something dumb, or thinks he needs the right opener.",
  },
  looks: {
    belief: "I'm not good-looking enough.",
    research:
      "Looks do matter some, for everyone. But a speed-dating study (Eastwick and Finkel, 2008) found that the traits people said they wanted ahead of time did a poor job of predicting who they actually liked once they met in person. And in a 2016 study (Farrelly and others), women rated kind, generous men as more attractive for a long-term relationship, and kindness gave the biggest boost to men who weren't the best-looking.",
    takeaway: "Looks open a door a little. How you treat people does a lot more once you're talking.",
    source: "Eastwick and Finkel, Journal of Personality and Social Psychology, 2008; Farrelly, Clemson and Guthrie, \"Are Women's Mate Preferences for Altruism Also Influenced by Physical Attractiveness?\" Evolutionary Psychology, 2016",
    url: "https://eprints.worc.ac.uk/4109",
    gist: "Looks matter some, but a speed-dating study found what people say they want ahead of time doesn't predict who they like in person, and another study found kindness makes a man more attractive, most of all if he isn't the best-looking guy.",
    fit: "He says he's not good-looking enough, too short, too skinny, too heavy, or ugly.",
  },
  bother: {
    belief: "She doesn't want me to talk to her.",
    research:
      "In Bumble's own survey of women on its app, reported in August 2026, 66% said they'd rather the man send the first message. That's why Bumble dropped its rule that women had to message first.",
    takeaway: "Most women want the guy to start. Keep it respectful, easy to walk away from, and take a no well.",
    source: "Bumble survey of women users, reported by TechCrunch, August 11, 2026 (a company survey)",
    url: "https://techcrunch.com/2026/08/11/bumble-ditches-its-rule-that-kept-men-from-making-the-first-move/",
    gist: "In one big dating app's own survey, many women said they'd rather the man start, so the app dropped its women-first rule. Respectful and easy to walk away from is the key.",
    fit: "He's afraid of bothering her, being creepy, or interrupting, or thinks women don't want to be approached.",
  },
  not_natural: {
    belief: "I'm just not a natural. Some guys have it.",
    research:
      "A 2015 study (Murphy and others, Personality and Social Psychology Bulletin) found that people who acted overconfident seemed more confident, which helped, but also seemed more arrogant, which hurt, and the two mostly canceled out. Acting cocky or \"alpha\" doesn't make you more attractive.",
    takeaway: "Calm beats cocky. Confidence is a skill you build with practice, not something you're born with.",
    source: "Murphy, von Hippel, Dubbs and others, \"The Role of Overconfidence in Romantic Desirability and Competition,\" Personality and Social Psychology Bulletin, 2015",
    url: "https://catalog.comses.net/publications/21445",
    gist: "A study found acting overconfident makes people seem confident but also arrogant, and the two cancel out. Calm confidence is built with practice, not born.",
    fit: "He says he's not a natural, not smooth, not confident, or that some guys just have it.",
  },
  no_places: {
    belief: "There's nowhere for me to meet anyone.",
    research:
      "A 2023 national survey by the Survey Center on American Life found that half (50%) of young women who are in a relationship are dating someone they were friends with first.",
    takeaway: "A lot of couples start as friends in normal life. More people in your week means more chances.",
    source: "Survey Center on American Life (American Enterprise Institute), \"Friend Zone,\" February 2023",
    url: "https://www.americansurveycenter.org/short-reads/friend-zone/",
    gist: "A national survey found many young women in relationships were friends with their partner first. A lot of couples start in everyday life.",
    fit: "He says there's nowhere to meet anyone, his week has no new people, or he hates bars and apps.",
  },
  nice_guy: {
    belief: "Nice guys finish last.",
    research:
      "A famous study of 37 cultures around the world (Buss, 1989) found that \"kind and understanding\" ranked at or near the top of what women want in a partner, in every single culture.",
    takeaway: "Kind isn't the problem. Being passive is. Be kind and still make the first move.",
    source: "Buss, \"Sex Differences in Human Mate Preferences: Evolutionary Hypotheses Tested in 37 Cultures,\" Behavioral and Brain Sciences, 1989",
    url: "https://doi.org/10.1017/S0140525X00023992",
    gist: "A study of 37 cultures found kind and understanding ranks at or near the top of what women want. Being passive is the problem, not being kind.",
    fit: "He says nice guys finish last, women want jerks or bad boys, or being kind hasn't worked for him.",
  },
  no_means: {
    belief: "If she says no, it proves something's wrong with me.",
    research:
      "Pew Research Center found that 43% of women under 50 who have used dating apps or sites had someone keep contacting them after they said they weren't interested (survey from 2022, published 2023). So many guys handle a no badly that handling it well really stands out.",
    takeaway: "A calm \"No worries, have a good one\" makes you the safe one. A no is about one moment, not about you.",
    source: "Pew Research Center, \"From Looking for Love to Swiping the Field: Online Dating in the U.S.,\" February 2023",
    url: "https://www.pewresearch.org/internet/2023/02/02/from-looking-for-love-to-swiping-the-field-online-dating-in-the-u-s/",
    gist: "A big national survey found many women have had men keep pushing after a no. Taking a no calmly stands out and builds trust. A no is about one moment, not about him.",
    fit: "An old no or being laughed at still hurts, or he thinks a no would prove something is wrong with him.",
  },
};

export const BELIEF_IDS = Object.keys(BELIEFS) as BeliefId[];

// No two cards share a number anymore, so nothing clashes.
export const BELIEF_CLASHES: [BeliefId, BeliefId][] = [];

export const BELIEF_SECTION = {
  title: "What you've been telling yourself vs. what the research says",
  intro: "These facts are fixed. The AI didn't write them. Each one names the study it came from, with a link so you can check it yourself.",
  outro: "What you feel isn't always what's true. And confidence is something you can learn.",
};

export const OFFER = {
  name: "The Late Start: The 30-Day Plan for Guys Who've Never Dated",
  price: "$27",
};
