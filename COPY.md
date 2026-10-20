# The Late Start Quiz: Every Word He Sees (draft v1, Oct 19, 2026)

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
Stop freezing up · Meet more people · Feel more confident · Ask a girl out · Make more friends

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
| 10 | What's one small step you'd be willing to take this week to get more comfortable talking to women? What might stop you? | Small is good. Like saying hi to the barista you see every week, or asking a coworker how their weekend was. |

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

Three pulsing dots. One line at a time, a new one every 3.5 seconds (stops on the last):

1. Reading what you wrote...
2. Picking out what matters most...
3. Finding the steps that fit your week...
4. Writing it in plain words...
5. Almost there. Thanks for being honest.

Small: This takes about 10 to 25 seconds. Please keep this page open.

(No percent, no fake progress bar.)

---

## 6. Results page (template)

**Hey [first name]. Here's what I heard.** (the page fills the name, not the AI)
Small: Written by AI from your answers, using the methods in Gage's 30-day plan.

If his answers were thin (AI flag `low_info`), a yellow note:
> Your answers were pretty short, so this is a rough read. Retake with a little more detail and it gets a lot more personal.

If the AI failed twice and we used the backup result:
> We couldn't write your full results this time, so this one is based on your quick taps. You can retake the quiz any time for a fuller read.

| Section | Heading on the page | How it's filled |
|---|---|---|
| Type card (navy) | YOUR TYPE / [The Freezer, The No-Places Guy, Burned Before, or Never Started] | Name is fixed by the page. One line why (AI, `type_reason`). |
| 1 | Where you are | AI, 2 to 3 sentences, with 1 or 2 short exact quotes from his answers. |
| 2 | Where you want to be | AI, 2 sentences, from questions 6 and 7. |
| 3 | What's holding you back | AI, 2 or 3 items (short title + 1 to 2 sentences), each tied to a real workbook idea. |
| 4 | Your 3 steps this week | AI picks 3 reps ONLY from the fixed list below and writes one "how" line fitted to his week. The page shows OUR rep title and "Done when:" line. Under the steps: "A step counts when you do it, not when it goes well." |
| 5 | If nothing changes | AI, 2 to 3 calm sentences. No fear tactics. |
| 6 | How the 30-day plan fits what you said | AI: one bridge line + 3 bullets ("You said ___. [real part of the plan] ___."). Then the fixed offer box below. |

Fixed offer box (the AI never writes price, guarantee or link):
> **The Late Start: The 30-Day Plan for Guys Who've Never Dated**
> **$27, one payment.** A 51-page workbook with one small rep a day, plus the 30-Day Rep Tracker, 30 Rep Cards, the When You Freeze card and the AI Practice Partner.
> 90 days to decide. If it's not worth it, email the word "refund" to support@confidenceofayes.com and get your money back.
> No plan can honestly promise you a date or a girlfriend. This one gives you a clear step for every day.
> Button: **See the 30-day plan ($27)** → https://start.confidenceofayes.com/the-late-start

Save box:
> **Save this page.** We don't keep your answers or these results. Take a screenshot, or copy them to your notes.
> Button: **Copy my results** (after tap: "Copied. Paste it in your notes." If the phone blocks it: "Your phone blocked copying. Take a screenshot instead.")
> Link: **Retake the quiz**

Bottom line: Not therapy. If you feel hopeless or think about hurting yourself, call or text 988 (U.S.). If you are in danger right now, call 911.

### The fixed rep list (the only steps the AI can give)

| Rep | Done when |
|---|---|
| Warm up your social battery | You said hi to a few people on your walk. |
| Hi + one question | You asked and listened. |
| Notice something they chose | You said it out loud. |
| Ask for a recommendation | You asked and said thanks. |
| Eye contact + nod, five times | You hit five. |
| The waiting-room chat | You said it, whatever they said back. |
| Text one old friend | The message is sent. |
| Go get a "no" | You asked. Bonus if you heard "no." Notice how fast the sting fades. |
| Pick your one weekly thing | You picked it and signed up or showed up. |
| Find the organizer | You said it and learned one name. |
| Learn one name and use it | You learned a name and used it. |
| Practice the Parrot | You used it once. |
| Sort your week: green, yellow, red | You sorted every place you'll be this week. |

All are from the workbook: Week 1 Days 1 to 7, Chapter 2 (weekly thing, old friend, organizer), Chapter 3 (green, yellow, red), Chapter 5 and the When You Freeze card (name, Parrot), and the morning social battery.

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
Your type, Where you are, Where you want to be, What's holding you back, Your 3 steps this week (with Done when), If nothing changes, and the 30-day plan link.

---

## Notes for Gage

- **Privacy Policy needs a new section** before launch (Architect section 6): what's kept (name, email, type tag), answers go to Anthropic only to write results and are not stored by us, Anthropic has its own terms, not for under 18. The email screen links to it.
- **Terms and Disclaimer:** add "quiz results are written by AI and may be wrong; not therapy; 18+."
- **"Answers are never saved"** in the footer is true for us (no database, no logs). It does not make claims about what Anthropic does.
