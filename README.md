# The Late Start Quiz (draft)

A free quiz for guys 18 and up. He taps 4 quick answers, writes or talks through 10 questions, gives his name and email, and gets a short results page written by AI. The results end with a link to The Late Start ($27).

This is a draft. Nothing is live yet.

## What it keeps and what it doesn't

- His answers stay in the open browser tab. They go to Anthropic (the AI) once, to write his results. We don't save them anywhere. You never see them.
- His email is never sent to the AI.
- Only his first name, email and type tag (like "Quiz - Freezer") go to Kajabi.
- There is no open "sign up" endpoint. The server saves the email only after it has written a real result for a finished quiz (so bots can't just add strangers' emails), and only once per visit (a retake doesn't sign him up again). If the save fails, he still sees his results, and the log line has no email in it.
- Crisis, under 18, and "harm to others" results: no pitch, no tag, and the email is not sent to Kajabi at all.

## Never turn on debug logging

**Do not add `ANTHROPIC_LOG` (or `DEBUG`, `NODE_DEBUG`, or any "debug" / "verbose" logging setting) in Vercel.** Debug logging can write his full quiz answers into Vercel's logs, and then "we don't save your answers" stops being true. Also don't add Vercel Web Analytics session replay or any other tracking script to the quiz.

## Settings to add in Vercel

Go to Vercel, open the quiz project, then **Settings > Environment Variables**. Add each one, click Save, then **redeploy** (Deployments > the three dots > Redeploy). Settings only work after a redeploy.

The full list with notes is in `.env.example`.

**To start (testing):**

| Name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your new quiz-only key from console.anthropic.com (API Keys > Create Key). Paste it only into Vercel. |
| `KAJABI_MODE` | `off` |

Also, in console.anthropic.com, find the spend limits page in Settings and set a monthly limit (start at $20). That's the real safety net.

**To test without the AI:** add `QUIZ_MOCK` = `1`. Every quiz shows the same sample result. Remove it before going live.

**When you're ready for emails to reach Kajabi**, pick ONE way:

1. **Free form way (`KAJABI_MODE` = `form`).** No extra cost on Basic. The quiz posts the name and email into your Kajabi form 2149754352, the same way a visitor would. **We could not test this from here** (our tools couldn't reach your Kajabi site). Before you trust it: in Kajabi, open that form and make sure reCAPTCHA is off for it (Kajabi says single opt-in turns it off) and that the form's automation adds the tag "Lead - AI Quiz" and starts your email sequence. Then take the quiz once with your own email and check that you show up in Kajabi Contacts. In Vercel logs, a working save shows `quiz_subscribe mode=form code=form_sent_302` (or 200). A 200 can also mean Kajabi showed the form again with an error, so always confirm the contact is really in Kajabi. If it says `form_captcha`, this way can't work; use 2 or 3.
   - **Type tags with the form way:** a plain form can't add a tag by itself. To get per-type tags, make 4 more forms in Kajabi (one per type), give each one an automation "add tag Quiz - Freezer" (and so on), and put their form IDs in `KAJABI_TYPE_FORM_IDS`. Without that, everyone gets only the main form's tag.
2. **Zapier way (`KAJABI_MODE` = `webhook`).** In Zapier: trigger "Webhooks by Zapier, Catch Hook", copy its URL into `KAJABI_WEBHOOK_URL`. Action: Kajabi "Submit Form" (or "Grant Offer"), then "Add Tag to Contact" using the `tag` field. Zapier gets: `first_name`, `email`, `type`, `tag`, `source`.
3. **Kajabi API way (`KAJABI_MODE` = `api`).** Only if your plan has API access (Pro or the API add-on). In Kajabi: Settings > User API Keys, copy the client ID and secret into `KAJABI_CLIENT_ID` and `KAJABI_CLIENT_SECRET`. For tags, put the 4 tag ID numbers in `KAJABI_TAG_IDS`. Not tested from here either.

If the email save fails, he still sees his results. Only a short code goes in the logs, never his email or answers.

## Other settings (optional)

- `QUIZ_MODEL`: which Claude model writes results. Default `claude-sonnet-5-5` (v2: the longer, deeper result needs it; about 20 to 45 seconds). Set `claude-haiku-5-5` to save cost, but results get shallower.
- `RATE_LIMIT_PER_HOUR` (default 12 per person) and `DAILY_LIMIT` (default 300 for everyone). These counts reset when Vercel restarts, so they're a speed bump, not a wall. The Anthropic spend limit is the wall.
- `ALLOWED_ORIGINS`: leave empty. The quiz's own address always works.

## Plan note

Vercel's free Hobby plan is for non-commercial use. A sales quiz is commercial, so plan on Vercel Pro before bio links point here.

## For the dev team

- `npm install`, then `npm run build` (passes) or `npm run dev`.
- Words: `COPY.md`. AI prompt and output format: `lib/prompt.ts`. Fixed lists (questions, reps, types, plan parts): `lib/content.ts`.
- `QUIZ_MOCK=1`: typing `mockharm`, `mockunder18`, `mockcrisis` or `mockjunk` in any answer shows that screen. Real crisis words (like "want to die") trip the server check in any mode.
- Kajabi sync lives in `app/api/results/route.ts` (`syncEmail`, run with Next's `after()` once the result is sent). There is no `/api/subscribe` route anymore.
- Click-through + phone screenshots: `scripts/screens.cjs` (needs `playwright-core` and the dev server on port 3100). Shots are in `screens/`.
- `AGENTS.md` is written by `next dev` itself. It's safe to ignore or delete.
