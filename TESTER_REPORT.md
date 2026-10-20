# Tester Report: The Late Start AI Quiz (Oct 19, 2026)

**Verdict:** Solid build. It is honest, the safety screens work, and privacy holds up in the code. I found 2 real bugs a user would hit, plus a few safety-list gaps, and fixed them. Before launch: fix #7 (how the email reaches Kajabi), #8 (phone back button), and #9 (Privacy Policy section). Nothing was deployed or pushed. Kajabi, Notion and the Project were not touched.

## How I tested
- `npm run build`: passes, before and after my fixes. `tsc --noEmit` is clean.
- Secrets: grepped `.next/static` for `ANTHROPIC`, `sk-ant` and `KAJABI_CLIENT`, and found 0 hits. The system prompt is not in the client bundle.
- Phone click-through: mock mode (`QUIZ_MOCK=1`), Playwright Chromium at 390x844, 320x568 (iPhone SE), 844x390 (landscape) and 390x420 (keyboard open). I tested empty and whitespace answers, a 3,000-character paste, voice-style rambles with no punctuation, Back, skips, refresh, browser back, 6 bad emails, double-tap submit, a 4-second slow network, offline then retry, retake, and every safety path. Screenshots are in `tester_shots/`.
- API: curl with bad origin, non-JSON, missing or bad taps, 11 answers, 3 skips, number answers, honeypot, `__proto__`, and a null body.
- Crisis regex: 22 real phrases and 12 idioms, run against `crisisHit()`.
- Facts: checked against `sales_letter_v2.md` and workbook parts 1 to 3. All 13 reps, the 5 When You Freeze steps, the chapter names, the $27 price, the 51 pages, the 90-day "email the word refund" guarantee and the sales link all match.
- Not tested: real Anthropic output (no key here), and all Kajabi modes against real Kajabi.

---

## Must fix

**1. FIXED. Long answers get rejected at the very end.** `lib/content.ts:6` had `totalMaxChars: 12000`, but the counter allows 1,500 per answer x 10 = 15,000. A guy who rambles (which the quiz tells him to do) filled every box, tapped "Show my results," and got "One of your answers is too long." That's false: it was the total, and he can't tell which answer to cut. Screenshot: `t05-total-too-long.png`.
Fix: total raised to 15,000, and the body-size cap in `app/api/results/route.ts:29` raised from 40,000 to 80,000 bytes. Cost: about 4k input tokens at most, which is still cheap on Haiku. Retested: it now shows results (`t05-after-fix-15000-chars.png`).

**2. FIXED. The crisis keyword list missed common phrases and caught harmless gym talk.** In `lib/safety.ts`:
- Missed: **"i wanna die"** (the pattern needed "to" after "wanna"), "everyone would be better off without me", "i wish i was never born", "whats the point of living", "i dont want to wake up", "killmyself", "hang myself", "sewer slide".
- Wrongly flagged (he gets the crisis screen, with no results and no way back): "social suicide", "career suicide", "I hurt myself lifting", "killing myself at the gym", "cut myself shaving", "cut myself off from people". This audience says these things.
- Fix: rewrote the list. Self-hurt words now need an intent word in front ("want to / thought about / gonna hurt myself"), "killing myself" is left to the AI, and "X suicide" idioms are stripped out first. Result: 22 of 22 real phrases caught, 0 of 12 idioms flagged. "This is killing me" and "I'd die of embarrassment" never tripped it.
- Decision: the server list catches clear statements only. The AI flag handles context. I think that's the right split.

**3. FIXED. The AI crisis flag was told to over-fire.** `lib/prompt.ts` said "When in doubt, set true. Dark jokes about dying count." With no guidance on idioms, a nervous guy writing "I'd die of embarrassment" could lose his results and never be emailed. I added: common idioms alone do NOT count ("this is killing me," "I'd die of embarrassment," "I wanted to die when she looked at me," "social suicide," "killing myself at the gym"), but if an idiom sits next to real hopelessness, still set true.

**4. FIXED. `/api/subscribe` let fake type values through.** `app/api/subscribe/route.ts:29` used `b.type in TYPES`, so `"toString"` and `"__proto__"` passed (I confirmed with curl). In api mode that sends a function as a Kajabi tag ID. It now uses `Object.hasOwn(TYPES, b.type)`.

**5. FIXED. AI timeouts could outlast Vercel's 60-second limit.** `lib/ai.ts:36` used `timeout: 45_000, maxRetries: 1` inside a 2-try loop, so the worst case was about 180 seconds against `maxDuration = 60`. Vercel would cut it off and he'd get a generic error after a long wait. It's now `timeout: 25_000, maxRetries: 0`, so 2 tries take at most 50 seconds. A 429/529 still shows the "busy, try again" screen.

**6. FIXED, NO CODE CHANGE NEEDED. Privacy check: the "we don't save your answers" line is literally true.** Every `console.*` call logs a short code only (`quiz_ai_error status=`, `quiz_ai_bad_json`, `quiz_subscribe mode= code=`). Nothing logs the request body, the answers, the email or a raw SDK error. There are no analytics, no localStorage and no URL state. The email never goes to Anthropic, and the answers never go to Kajabi. Crisis, under-18 and harm results never call subscribe (verified: subscribe count 0 on all three).
**Keep it true:** never set `ANTHROPIC_LOG=debug` in Vercel (the SDK would then log request bodies), and never add Vercel Web Analytics session replay or any analytics script. Add this warning to the README.

**7. NOT FIXED (Builder). Fix before turning any KAJABI_MODE on. Anyone can add any email to the list.** `/api/subscribe` takes any name and email from anyone who sets an `Origin` header (curl can fake it). Nothing ties it to a finished quiz, so a bot can sign strangers up for Gage's emails. That brings spam complaints and hurts Kajabi sending. The email is also only sent by the browser after results load (`Quiz.tsx:136`, fire-and-forget), so a guy who closes the tab fast can be lost.
Fix: send `firstName` and `email` along with the `/api/results` request. After a normal result (`kind === "result"`), call `subscribe()` on the server with the type, then return the result. The email still never goes into the AI prompt and is never logged. Delete the `/api/subscribe` route. If saving fails, still return the results. That matches the rule "email required, but a failed save never loses the user," which the current code already follows.

**8. NOT FIXED (Builder). The phone back button and swipe-back lose everything.** The quiz uses no browser history, so Android's back button or iPhone's swipe-back on question 7 leaves the site. iOS Safari ignores `beforeunload`, so there is no warning at all. Desktop Chrome did warn in my test. For a guy who just rambled through 7 answers, this is the most likely way he drops out.
Fix: on each `go()`, call `history.pushState`, and on `popstate`, run the in-app `back()`. For refresh: I recommend accepting the loss (no saving to his device). That keeps the privacy promise simple. Gage decides.

**9. NOT FIXED (Gage/Builder). The Privacy Policy section must go live before launch.** The email screen links to it and promises what it will say. Use Architect section 6. Also add "AI-written, may be wrong, 18+, not therapy" to the Terms and Disclaimer.

## Should fix

**10. Email typos are accepted.** `jake@gmial.con` passes. Each one is a lost lead. Add a soft "Did you mean jake@gmail.com?" hint for gmail, yahoo, icloud, hotmail and outlook, and for .con/.cmo. Keep it a hint, not a block.

**11. Retake signs him up again.** `Quiz.tsx:135`: each retake fires subscribe again (I confirmed the name and email stay filled in). Depending on the Kajabi automation, that could restart E1. Subscribe once per page visit (a ref flag), or handle it on the server per #7.

**12. The rate limit may block real people on phone carriers.** `lib/guard.ts:53` defaults to 5 per IP per hour. Phone carriers and campus Wi-Fi put many people behind one IP, and "Try again" and retakes use up the count. Raise the default to 10 to 15. The $20 Anthropic spend limit is the real backstop, and the in-memory count is per server instance anyway.

**13. Questions 1 and 2 overlap.** Q1 asks what his "days look like," and Q2 asks him to "walk me through a normal week." Rambling guys will say the same thing twice, and 10 open questions is a lot on a phone. Suggest merging them: "Walk me through a normal week. What do you do, where do you go, and who do you talk to?" That makes 9 questions, and the intro's "About 8 minutes" becomes more honest. If all 10 stay, change the intro to "About 10 minutes."

**14. Q7 has nothing to point to if Q6 was skipped.** "Why does that matter to you?" needs Q6. Fix: "Why does that picture matter to you?", or hide the skip link on Q6.

**15. Q3 assumes he wanted to talk to a woman.** Guys who tapped "Make more friends" hit a question that isn't about them. Add to the Q3 helper: "Or a time you wanted to talk to anyone and didn't."

**16. The honeypot could trap a real user.** The hidden field is named `website`, and Chrome autofill often ignores `autoComplete="off"`. If it gets filled, `/api/results` returns 400 and he loops on "Something went wrong, Try again" forever. Rename it to something no browser autofills (for example `hp_7c`).

**17. Some errors offer a "Try again" that can never work.** `too_many_skips` and `bad_request` fall through to the default screen. Map them to a "Back to my answers" screen with no Try again.

**18. Form mode may report success when it failed.** `lib/kajabi.ts:118` counts any 200 to 399 response as success, but a Kajabi page that re-shows the form with an error also returns 200. When Gage tests it live, check that the contact really appears in Kajabi. Don't trust only the `form_sent_200` log line.

## Nitpicks

**19.** On landscape and short screens, the sticky Next button covers the text box until he taps into it (`t12-landscape-q1.png`). Once he taps in, the box scrolls into view fine (`t13`, `t14`). Turn off `.stick` at `@media (max-height: 500px)`.

**20.** The privacy box sits below the "Show my results" button, so many guys won't see it before they tap. Move one short line above the button: "Your answers are private. Gage never sees them."

**21.** `KAJABI_API_KEY` is read in `lib/kajabi.ts:132` but is not in `.env.example`.

**22.** There is no check on what the AI writes. A prompt injection or a bad output could put a promise or a pickup word on the page (only he sees it, so the risk is low). Optional: a server check for words like "guarantee," "you will get," "alpha," "negging" that triggers one retry.

**23.** If the AI fails twice, the fallback result shows even if the answers had crisis words the keyword list missed (#2 makes this rarer). This is acceptable. Note it only.

**24.** "Why the 30-day plan fits you" sounds a little sure of itself. Consider "How the 30-day plan fits what you said."

**25.** The crisis screen has no way back. That's right for real crisis. With #2 and #3, false hits should be rare. Leave it as is.

## What passed (no action)
- Empty and whitespace answers keep Next disabled. A 3,000-character paste is cut to 1,500. Back keeps answers. The 3rd skip is hidden. Double-tap submit sends exactly 1 request. Slow network shows the calm loading screen. Offline shows the "lost connection" screen, and Try again works. No sideways scrolling at 320px.
- Under-18 tap: kind screen, no email box, no AI call, no pitch. The AI under18, harm and crisis flags: correct screens, and subscribe is never called.
- Prompt injection: answers sit inside tags (closing tags are stripped), the tool call is forced, rule 9 is in place, and the page shows AI text as plain text. Good.
- Honesty: no stats, testimonials, scarcity or timers. No promise of dates ("No plan can honestly promise you a date or a girlfriend."). No pickup language. Nothing about Gage beyond "Gage's 30-day plan." 988, 911 and the Lifeline chat are correct. No em dashes in any copy, and AI output has them stripped.
- Psychology: the order (safe, then real moment, then cost, then hope, then story, then one small yes) is sound. Q4 lets him skip, which is good. The Q5 helper "Gage never sees your answers" sits right where he needs it. The bridge is calm, the price and guarantee are fixed by the page, and nothing in it shames him.
- The model ID `claude-haiku-5-5` is fine.

## Files I changed
- `lib/content.ts` (total cap), `app/api/results/route.ts` (body size), `app/api/subscribe/route.ts` (`Object.hasOwn`), `lib/ai.ts` (timeouts), `lib/safety.ts` (crisis list), `lib/prompt.ts` (idiom rule).
- Added `tester_shots/` (17 screenshots).
