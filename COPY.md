# The Late Start Quiz: Every Word He Sees (draft v2, Oct 20, 2026)

> v2 changes: tap 4 options reworded; new type names (hidden pattern, same Kajabi tags); longer loading copy; results page rebuilt (deeper read, his "why," steps in his places, "first week" bridge); new "took longer than usual" error.

In order, screen by screen. The code uses these exact words (`components/Quiz.tsx` and `lib/content.ts`). Change them here, then the Builder copies the change into the code.

Every screen has the brand line at the top: **THE CONFIDENCE OF A YES**

---

## 1. Intro

**What's really holding you back with women?**

Answer a few honest questions. Get a plain-words read on where you are, and 3 small steps for this week. About 10 minutes.

- Talk instead of type if you want. Rambling is good.
- Your answers are private. Gage never sees them.
- Free. For guys 18 and up.

Button: **Start**

Small: Your results are written by AI, using the methods in Gage's 30-day plan. Not therapy.

---

## 2. Quick taps (4)

Every tap screen has: **← Back**, a progress bar, and the small line "Quick taps first. 1 of 4" (2 of 4, and so on). Tapping an answer moves to the next screen.

**1. How old are you?**
Under 18 · 18 to 21 · 22 to 25 · 26 to 29 · 30 or older
(Under 18 goes straight to the Under-18 screen. No email box, no AI.)

**2. How has dating gone so far?**
I've never been on a date. · I've talked to girls, but never asked one out. · I've been on a date or two. · I've dated some, but I feel stuck now.

**3. In a normal week, how many new people do you talk to?**
None · 1 or 2 · 3 to 5 · More than 5

**4. What do you want most right now?**
Stay calm when it's time to talk · Meet more people · Feel sure of myself · Ask a girl out · Make more friends

(v2: no option repeats a type name word for word. Option ids are unchanged.)

---

## 3. The 10 open questions

Each screen: **← Back**, progress bar, "Question N of 10", the question, a helper line, a big text box (placeholder: "Type or talk here..."), a counter "0 / 1,500", and the button **Next** (on question 10: **Almost done**). Next stays gray until he writes something.

Under the button, when the box is empty: **Skip this one** (he gets 2 skips). After 2 skips, the link goes away and this shows: "You've used your 2 skips."

The voice tip shows once, on question 1: **Tip: tap the mic on your keyboard and just talk. Rambling is good.**

| # | Question | Helper line |
|---|---|---|
| 1 | Tell me a little about you. What are you into, and what are you good at? | Hobbies, work, sports, games, faith, anything. There are no wrong answers. |
| 2 | Walk me through a normal week. Where do you go, and who do you talk to? | Work, the gym, church, online, home. Just say how it really is. |
| 3 | Think of the last time you wanted to talk to a woman and didn't. What happened, and what went through your head? | Where were you? What did you think right before you didn't? (Or a time you wanted to talk to anyone and didn't.) |
| 4 | Has anything happened in the past that makes talking to women harder for you now? Only share what you want. | A no that stung, something someone said, a moment that stuck. Or skip it. |
| 5 | How do you feel about where you are with women and dating right now? | Lonely, frustrated, embarrassed, fine, hopeful. Say it how it really is. Gage never sees your answers. |
| 6 | A year from now, if dating and confidence were going well for you, what would your life look like? | Who are you with? What do your weekends look like? How do you feel about yourself? |
| 7 | Is getting to that life important to you? If so, why? | Give the real reason, not just the first one that pops up. (Skipped the last question? Think of the life you wish you had.) |
| 8 | What have you tried so far to get better at talking to women or dating? How did it go? | Dating apps, videos, books, asking friends, going out more. It's fine if the answer is "nothing yet." |
| 9 | What do you tell yourself is the reason you're not where you want to be with women yet? | The thought that shows up when you're by yourself. |
| 10 | Finish this sentence: "One small thing I could do this week to talk to more people is..." | Small is good. Like saying hi to the barista you see every week, or asking a coworker how their weekend was. |

Each question has its own job: Q1 who he is and what he's good at (strengths, things to talk about), Q2 where he goes and who he sees, Q3 the real moment, Q4 old hurts, Q5 the cost, Q6 the future picture, Q7 his real reason, Q8 what he tried, Q9 the story he tells himself, Q10 one small yes.

The phone back button (or swipe-back) goes to the previous question, not off the site. If he closes the tab or reloads mid-quiz, most browsers ask if he's sure (their own built-in words; we can't change them; iPhone Safari doesn't ask).

---

## 4. Email screen

**Last step. What's your first name and email?**

Your results show on the next screen, right after this. You'll also get short emails from Gage. Unsubscribe anytime.

Fields: **First name** · **Email**

Button: **Show my results**

Errors (under the field):
- Please add your first name.
- That email doesn't look right. Mind checking it?

Typo hint (a hint, not a block), for things like gmial.com, gnail.com, yahoo.co, hotmial.com, .con, .cmo:
- Did you mean [jake@gmail.com]? (tap it to fix the email)

Small line just above the button: Your answers are private. Gage never sees them.

Privacy box:
> **Your answers are private.** They go to our AI provider (Anthropic) only to write your results. We don't save them, and Gage never sees them. Your email is never sent to the AI. We keep your first name, email and your result type to send you emails. [Privacy Policy]

(Literally true: answers are only in his browser and one AI call. Nothing is logged. Only name, email and type go to Kajabi. Note: with `KAJABI_MODE=off` we keep nothing at all, which is still true to the promise's spirit but means no emails go out.)

---

## 5. Loading

Three pulsing dots. One line at a time, a new one every 5 seconds (stops on the last):

1. Reading what you wrote...
2. Looking for the thread that ties it together...
3. Connecting where you've been to where you want to go...
4. Picking 3 steps that fit your week...
5. Mapping what your first week could look like...
6. Writing it in plain words...
7. Almost there. Thanks for being honest.

Small: We're writing a full, personal read, so this takes about 20 to 45 seconds. Please keep this page open.

(No percent, no fake progress bar.)

---

## 6. Results page (template)

**Hey [first name]. Here's what I see.** (the page fills the name, not the AI)
Small: Written by AI from your answers, using the methods in Gage's 30-day plan. About a 5-minute read.

If his answers were thin (AI flag `low_info`), a yellow note:
> Your answers were pretty short, so this is a rough read. Retake with a little more detail and it gets a lot more personal.

If the AI couldn't finish and we used the backup result:
> We couldn't write your full results this time, so this one is based on your quick taps. You can retake the quiz any time for a fuller read.

The AI writes about 800 to 1,000 words in total. Full example: SAMPLE_RESULT_V2.md.

| # | Heading on the page | How it's filled |
|---|---|---|
| Type card (navy) | YOUR PATTERN / [type name] / [fixed tagline] | Name and tagline fixed by the page (below). Then 1 to 2 sentences on how it shows up in HIS life (AI, `type_reason`). |
| 1 | What's really going on | AI, 3 or 4 short paragraphs: where it started (his past), how it shows up now (the moment he described), what it protects him from and what it costs, why it's learnable. Uses his words as evidence (max 4 short quotes), then says what they mean. |
| 2 | What's actually true | AI, 2 items (3 only if new). Kindly corrects the parts of the story he tells himself (question 9) that the belief cards don't cover, using his own life as evidence. No numbers, studies or sources. |
| 3 | Why this matters to you | AI, one paragraph on his deepest reason (question 7). The emotional center. Shown larger, in a soft box. |
| 4 | The honest cost of waiting | AI, one calm paragraph. Uses his own future picture. No fear tactics, no fake numbers. |
| 5 | Your 3 steps this week | Small line: "Easiest first. Each one makes the next one easier." AI picks 3 reps ONLY from the fixed list below, and writes a short headline, "When:" (his day and place) and exactly what to say or do. The page adds OUR "Done when:" line. Under the steps: "A step counts when you do it, not when it goes well." |
| 6 | What you've been telling yourself vs. what the research says | Only shows if the AI picked at least 1 card. Small line under the heading: "These facts are fixed. The AI didn't write them, and each one names where it came from." Then 0 to 2 cards. Each card: his belief in quotes, "WHAT THE RESEARCH SAYS", the fixed finding, the fixed source line (small), then ONE line from the AI tying it to his words (10 to 20 words, max 25, no numbers; the page drops any sentence with a number or study). Closing line: "What you feel isn't always what's true. And confidence is something you can learn." |
| 7 | What your first week could look like | AI, two paragraphs: what HIS first week in the plan looks like (Day 0, then Week 1 reps in his places), and why a plan fits him given what he already tried. Only real plan parts. Then the fixed offer box. |

### The fixed belief cards (the ONLY stats on the page)

The AI picks up to 2 by id and never writes a number. It never sees the numbers: it gets a plain summary of each card. "behind" and "no_means" share a number, so the page never shows both.

| id | Belief (in his voice) | What the research says (fixed) | Source line (fixed) |
|---|---|---|---|
| behind | "I'm way behind everyone else." | In Hinge's 2024 Gen Z dating report (about 15,000 daters), 44% of Gen Z users said they have little or no dating experience. More than half (56%) said worrying about rejection has stopped them from going after someone. | Hinge Gen Z D.A.T.E. Report, 2024 (an app survey) |
| perfect_line | "I'll say something stupid. I need the right line." | In studies of real conversations and speed dates, people who asked more follow-up questions (questions about what the other person just said) were liked more. Speed daters who did it got more yeses for a second date. No line needed, just interest. | Huang and others, Harvard, 2017 |
| looks | "I'm not good-looking enough." | Looks do matter some, for everyone. But in speed-dating research, the "must-haves" people listed ahead of time did a poor job of guessing who they actually liked once they met in person. In other studies, women rated kind men as more attractive partners for the long run, and kindness helped most for men who weren't the best-looking. | Eastwick and Finkel, 2008; Farrelly and others, 2016 |
| bother | "She doesn't want me to talk to her." | In a 2024 Bumble survey of 2,267 U.S. women on the app, 66% said they'd rather the man send the first message. Most women want men to start, as long as it's respectful, easy to walk away from, and a no is taken well. | Bumble survey of U.S. women users, 2024 (an app survey) |
| not_natural | "I'm just not a natural. Some guys have it." | Calm, low-key confidence is what helps. Acting cocky or "alpha" backfires, because coming off cocky cancels out the boost confidence gives you. And opening up lands better than people expect: in Hinge's 2025 survey, 52% of daters felt ashamed after opening up, but only 19% said they feel uncomfortable when someone else opens up. Confidence is a skill you build, not something you're born with. | Murphy and others, 2015; Hinge D.A.T.E. Report, 2025 (an app survey) |
| no_places | "There's nowhere for me to meet anyone." | In a 2023 national survey, about half of women ages 18 to 29 who were in a relationship were friends with their partner before they dated. A lot of couples start in everyday life, like friend groups and shared activities. | American Enterprise Institute, Survey Center on American Life, 2023 |
| nice_guy | "Nice guys finish last." | In a study of 37 cultures around the world, "kind and understanding" ranked at or near the top of what women want in a partner, in every one. What doesn't work is being passive, not being kind. | Buss, 1989 |
| no_means | "If she says no, it proves something's wrong with me." | Lots of guys feel this way: 56% of Gen Z daters in Hinge's survey said fear of rejection stopped them. But how you handle a no is one of the biggest trust signals there is, because so many women have had men get pushy after a no (in Pew's 2023 survey, 43% of women under 50 who'd used dating apps were contacted again after saying they weren't interested). A calm "No worries, have a good one" makes you the safe one. A no is about one moment, not about you. | Hinge Gen Z D.A.T.E. Report, 2024; Pew Research Center, 2023 |

If the AI can't finish (backup result), the page shows 1 card by type with no AI line: not_natural (Over-Scripter, Someday Guy), no_places (Closed Loop), no_means (Old Rule).

Fixed type names and taglines (Kajabi tags unchanged):

| Internal id / Kajabi tag | Name on page | Tagline (fixed) |
|---|---|---|
| freezer / Quiz - Freezer | The Over-Scripter | Your brain writes the whole talk first, so nothing can go wrong. By the time the script is done, the moment is gone. |
| no_places / Quiz - No-Places Guy | The Closed Loop | Your week runs on the same few places and the same few people. You're not the problem. There's just no door for anyone new. |
| burned_before / Quiz - Burned Before | The Old Rule | One moment that stung wrote a rule: don't try, and it can't happen again. The moment is over. The rule is still running. |
| never_started / Quiz - Never Started | The Someday Guy | You're waiting to feel ready first. But ready shows up after the first steps, not before them. |

Fixed offer box (the AI never writes price, guarantee or link):
> **The Late Start: The 30-Day Plan for Guys Who've Never Dated**
> **$27, one payment.** A 51-page workbook with one small rep a day for 30 days, plus a rep tracker, a rep card for each day, a pocket card for when your mind goes blank, and an AI Practice Partner to practice with first.
> 90 days to decide. If it's not worth it, email the word "refund" to support@confidenceofayes.com and get your money back.
> No plan can honestly promise you a date or a girlfriend. This one gives you a clear step for every day.
> Button: **See the 30-day plan ($27)** → https://start.confidenceofayes.com/the-late-start

Save box:
> **Save this page.** We don't keep your answers or these results. Take a screenshot, or copy them to your notes.
> Button: **Copy my results** (after tap: "Copied. Paste it in your notes." If the phone blocks it: "Your phone blocked copying. Take a screenshot instead.")
> Link: **Retake the quiz**

Bottom line: Not therapy. If you feel hopeless or think about hurting yourself, call or text 988 (U.S.). If you are in danger right now, call 911.

### The fixed rep list (the only steps the AI can give)

The AI may only change where, when, who, and the simple words to say. Titles are plain English now (no "Parrot," no "green, yellow, red").

| Rep (plain title) | Done when | From the workbook |
|---|---|---|
| Warm up on the way | You said hi to a few people on the way. | Week 1 morning social battery |
| Eye contact and a nod, five times | You hit five. | Day 4 |
| Say hi and ask one real question | You asked and listened. | Day 1 |
| Say one thing about the moment you share | You said it, whatever they said back. | Day 5 + "say the obvious thing" |
| Compliment something they chose | You said it out loud. | Day 2 |
| Ask what they'd recommend | You asked and said thanks. | Day 3 |
| Go get a small no on purpose | You asked. Bonus if you heard "no." Notice how fast the sting fades. | Day 7 |
| Say hi to someone you see every week (NEW) | You said hi and one thing, then let it end well. | Day 15 + gym row of the Places Map + leave-well rule |
| Learn one name and use it | You learned a name and used it. | Week 2 |
| Bring back something they told you (NEW) | You made one callback. | Day 12 |
| Repeat their last words as a question | You used it once in a real chat. | When You Freeze card. Only for guys who can start chats but run dry. |
| Text one old friend | The message is sent. | Build Your Circle |
| Pick one thing you go to every week | You picked it and signed up or showed up. | Build Your Circle |
| Talk to the person running the group | You said it and learned one name. | Build Your Circle |
| Sort your week by where talking is normal | You sorted every place you'll be this week. | Respect First |

---

## 7. Under-18 screen

(Shown from the age tap, or if the AI sees he's under 18. No email box, no pitch, email not sent anywhere.)

**Thanks for being honest.**

This quiz is built for guys 18 and up, so we can't show you results here.

That's not a knock on you. You're already thinking about this, and that's a good sign. You've got time.

**For now, three good moves:**
- Be kind to people and say hi first.
- Build real friendships. Join a team, a club or a youth group.
- If something is weighing on you, talk to a parent, a coach, a pastor or a school counselor you trust.

Small: If you ever feel hopeless or think about hurting yourself, call or text 988 (U.S.). If you are in danger right now, call 911.

---

## 8. Crisis screen

(Shown if the server's keyword check OR the AI flags crisis. No type, no steps, no pitch, no tag, email not sent anywhere.)

**You matter.**

> **What you wrote sounds heavy, and you deserve real support, not a dating plan.**
> In the U.S., call or text **988** any time. It's free, and someone will listen.
> **If you are in danger right now, call 911.**
> Buttons: **Call 988** (tel:988) · **Text 988** (sms:988)
> You can also chat at 988lifeline.org. Outside the U.S., call your local emergency number.

Talking to a doctor, a counselor, a pastor or someone you trust is a strong move, not a weak one.

Small: We didn't save your answers, and we didn't send your email anywhere.

---

## 9. Harm-to-others screen

(AI flag `harm_others`. No pitch, no tag, email not sent anywhere.)

**Before anything else**

Some of what you wrote is about pushing past what someone wants, or hurting someone. We can't help with that.

Respect comes first. A no is a no, the first time. Nobody owes anyone a yes.

If anger or urges to hurt someone are getting big, please talk to a counselor or someone you trust. That's a strong move.

Small: If we read you wrong, you can retake the quiz.
Button: **Retake the quiz**

---

## 10. Error screens

Each has the buttons **Try again** (when it can help) and **Back to my answers**, plus: "Still stuck? Email support@confidenceofayes.com."

| When | Heading | Text | Try again? |
|---|---|---|---|
| Too many tries this hour | Let's take a short break | A lot of quizzes came from your internet connection this hour. Please try again in an hour. | No |
| AI took too long (v2) | That took longer than usual | Writing your results ran out of time on our end. It's not you. Your answers are still here. Tap Try again. | Yes |
| AI or daily cap busy | We're very busy right now | Too many people are taking the quiz at once. Your answers are still here. Please try again in a few minutes. | Yes |
| No internet | Looks like you lost connection | Your answers are still here on this screen. Check your signal, then tap Try again. | Yes |
| Answer too long | That's a lot of words | One of your answers is too long for us to read. Tap Back to my answers and trim it a little. | No |
| 3+ skips (shouldn't happen) | A couple more answers, please | You can skip up to 2 questions. Tap Back to my answers and fill in one more. | No |
| Bad request | Something didn't come through right | Your answers are still here. Tap Back to my answers, check them, and try again. | No |
| Bad email (server check) | Let's fix your email | That email doesn't look right. Tap Back to fix it. (Button: Back, to the email screen) | No |
| Anything else | Something went wrong on our end | It's not you. Your answers are still here on this screen. Tap Try again. | Yes |

---

## 11. Footer (every screen except loading)

Answers are never saved. Not therapy. For ages 18 and up.
The Confidence of a Yes, a brand of AItelligent Solutions. Questions? support@confidenceofayes.com
Privacy Policy (https://start.confidenceofayes.com/privacy-policy) · Terms (/terms) · Disclaimer (/disclaimer)

---

## 12. "Copy my results" text (what lands in his notes)

For [first name]
My quiz results (The Confidence of a Yes)
Your pattern (name, tagline, why), What's really going on, What's actually true, Why this matters to you, The honest cost of waiting, Your 3 steps this week (with When and Done when), the belief cards (belief, research, source, his line), What your first week could look like, and the 30-day plan link.

---

## Notes for Gage

- **Privacy Policy needs a new section** before launch (Architect section 6): what's kept (name, email, type tag), answers go to Anthropic only to write results and are not stored by us, Anthropic has its own terms, not for under 18. The email screen links to it.
- **Terms and Disclaimer:** add "quiz results are written by AI and may be wrong; not therapy; 18+."
- **"Answers are never saved"** in the footer is true for us (no database, no logs). It does not make claims about what Anthropic does.
