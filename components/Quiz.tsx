"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LIMITS, LINKS, OFFER, QUESTIONS, TAPS, VOICE_TIP } from "@/lib/content";
import type { QuizResult } from "@/lib/result";

// Answers live only in this component's memory. Nothing is written to localStorage, cookies or the URL.

type Screen =
  | { s: "intro" }
  | { s: "tap"; i: number }
  | { s: "q"; i: number }
  | { s: "email" }
  | { s: "loading" }
  | { s: "done"; result: QuizResult }
  | { s: "error"; code: string };

const TOTAL_STEPS = TAPS.length + QUESTIONS.length + 1;
const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i;

const LOADING_LINES = [
  "Reading what you wrote...",
  "Picking out what matters most...",
  "Finding the steps that fit your week...",
  "Writing it in plain words...",
  "Almost there. Thanks for being honest.",
];

// Soft "did you mean" for common email typos. A hint only, never a block.
const DOMAIN_FIX: Record<string, string> = {
  "gmial.com": "gmail.com", "gmal.com": "gmail.com", "gnail.com": "gmail.com", "gmai.com": "gmail.com",
  "gamil.com": "gmail.com", "gmaill.com": "gmail.com", "gmsil.com": "gmail.com", "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com", "gmail.om": "gmail.com", "yaho.com": "yahoo.com", "yahooo.com": "yahoo.com",
  "yahoo.co": "yahoo.com", "hotmial.com": "hotmail.com", "hotmal.com": "hotmail.com", "hotmail.co": "hotmail.com",
  "outlok.com": "outlook.com", "outloo.com": "outlook.com", "outlook.co": "outlook.com",
  "iclod.com": "icloud.com", "icoud.com": "icloud.com", "icloud.co": "icloud.com",
};

export function suggestEmail(raw: string): string | null {
  const m = raw.trim().toLowerCase();
  const at = m.lastIndexOf("@");
  if (at < 1) return null;
  let domain = m.slice(at + 1).replace(/\.(con|cmo|comm|vom|xom|cpm|coom)$/, ".com");
  domain = DOMAIN_FIX[domain] || domain;
  const fixed = m.slice(0, at + 1) + domain;
  return fixed !== m ? fixed : null;
}

const ERRORS: Record<string, { title: string; body: string; retry: boolean; backTo?: "email" }> = {
  rate_limited: {
    title: "Let's take a short break",
    body: "A lot of quizzes came from your internet connection this hour. Please try again in an hour.",
    retry: false,
  },
  busy: {
    title: "We're very busy right now",
    body: "Too many people are taking the quiz at once. Your answers are still here. Please try again in a few minutes.",
    retry: true,
  },
  network: {
    title: "Looks like you lost connection",
    body: "Your answers are still here on this screen. Check your signal, then tap Try again.",
    retry: true,
  },
  too_long: {
    title: "That's a lot of words",
    body: "One of your answers is too long for us to read. Tap Back to my answers and trim it a little.",
    retry: false,
  },
  too_many_skips: {
    title: "A couple more answers, please",
    body: "You can skip up to 2 questions. Tap Back to my answers and fill in one more.",
    retry: false,
  },
  bad_request: {
    title: "Something didn't come through right",
    body: "Your answers are still here. Tap Back to my answers, check them, and try again.",
    retry: false,
  },
  bad_email: {
    title: "Let's fix your email",
    body: "That email doesn't look right. Tap Back to fix it.",
    retry: false,
    backTo: "email",
  },
  default: {
    title: "Something went wrong on our end",
    body: "It's not you. Your answers are still here on this screen. Tap Try again.",
    retry: true,
  },
};

export default function Quiz() {
  const [screen, setScreen] = useState<Screen>({ s: "intro" });
  const [taps, setTaps] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<string[]>(() => QUESTIONS.map(() => ""));
  const [skipped, setSkipped] = useState<boolean[]>(() => QUESTIONS.map(() => false));
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [nameErr, setNameErr] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // The email we already saved this visit, so a retake doesn't sign him up twice.
  const savedEmailRef = useRef<string | null>(null);
  // Browser history: one extra entry while he's in the quiz, so the phone back button / swipe-back
  // goes to the previous question instead of leaving the site.
  const screenRef = useRef(screen);
  screenRef.current = screen;
  const guardPushed = useRef(false);

  const inProgress = screen.s === "tap" || screen.s === "q" || screen.s === "email" || screen.s === "loading" || screen.s === "error";

  // Warn before leaving mid-quiz: answers would be lost.
  useEffect(() => {
    if (!inProgress) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [inProgress]);

  useEffect(() => {
    const inQuiz = screen.s === "tap" || screen.s === "q" || screen.s === "email";
    if (inQuiz && !guardPushed.current) {
      window.history.pushState({ quiz: true }, "");
      guardPushed.current = true;
    }
  }, [screen]);

  useEffect(() => {
    const onPop = () => {
      guardPushed.current = false; // the browser just used up our extra entry
      const cur = screenRef.current;
      if (cur.s === "tap" || cur.s === "q" || cur.s === "email") {
        setScreen(prevScreen(cur)); // the effect above pushes a new entry if still in the quiz
      } else if (cur.s === "loading") {
        window.history.pushState({ quiz: true }, ""); // stay put while results are being written
        guardPushed.current = true;
      } else if (cur.s === "error") {
        setScreen({ s: "q", i: QUESTIONS.length - 1 });
      }
      // intro or results: let the next back press leave the site as normal.
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // New screen: go to top and move focus to the heading (for screen readers).
  useEffect(() => {
    window.scrollTo(0, 0);
    headingRef.current?.focus({ preventScroll: true });
  }, [screen]);

  const skipsUsed = skipped.filter(Boolean).length;

  const go = (s: Screen) => setScreen(s);

  const back = () => go(prevScreen(screen));

  const pickTap = (i: number, optionId: string) => {
    const tap = TAPS[i];
    setTaps((t) => ({ ...t, [tap.id]: optionId }));
    if (tap.id === "age" && optionId === "under18") {
      go({ s: "done", result: { kind: "under18" } });
      return;
    }
    go(i + 1 < TAPS.length ? { s: "tap", i: i + 1 } : { s: "q", i: 0 });
  };

  const nextQ = (i: number) => go(i + 1 < QUESTIONS.length ? { s: "q", i: i + 1 } : { s: "email" });

  const submit = useCallback(async () => {
    go({ s: "loading" });
    const started = Date.now();
    let result: QuizResult | null = null;
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taps,
          answers: answers.map((a, i) => (skipped[i] || !a.trim() ? null : a)),
          firstName: firstName.trim(),
          email: email.trim(),
          alreadySaved: savedEmailRef.current === email.trim().toLowerCase(),
          hp_7c: honeypot,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.result) {
        go({ s: "error", code: typeof j.error === "string" ? j.error : "default" });
        return;
      }
      result = j.result as QuizResult;
    } catch {
      go({ s: "error", code: "network" });
      return;
    }
    // The server saves the email itself, only for a normal result. Remember it so a retake doesn't repeat it.
    if (result.kind === "result") savedEmailRef.current = email.trim().toLowerCase();
    // Keep the calm loading screen up for at least a moment so it doesn't flash.
    const wait = Math.max(0, 1500 - (Date.now() - started));
    setTimeout(() => go({ s: "done", result: result! }), wait);
  }, [taps, answers, skipped, honeypot, firstName, email]);

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const n = firstName.trim();
    const m = email.trim();
    const nErr = n ? null : "Please add your first name.";
    const mErr = EMAIL_RE.test(m) && m.length <= LIMITS.emailMax ? null : "That email doesn't look right. Mind checking it?";
    setNameErr(nErr);
    setEmailErr(mErr);
    if (nErr || mErr) return;
    submit();
  };

  const restart = () => {
    setTaps({});
    setAnswers(QUESTIONS.map(() => ""));
    setSkipped(QUESTIONS.map(() => false));
    go({ s: "intro" });
  };

  // ---------- screens ----------

  if (screen.s === "intro") {
    return (
      <Shell>
        <h1 ref={headingRef} tabIndex={-1}>What&apos;s really holding you back with women?</h1>
        <p className="lead">Answer a few honest questions. Get a plain-words read on where you are, and 3 small steps for this week. About 10 minutes.</p>
        <ul className="checks">
          <li>Talk instead of type if you want. Rambling is good.</li>
          <li>Your answers are private. Gage never sees them.</li>
          <li>Free. For guys 18 and up.</li>
        </ul>
        <button className="btn" onClick={() => go({ s: "tap", i: 0 })}>Start</button>
        <p className="small muted" style={{ marginTop: 14 }}>Your results are written by AI, using the methods in Gage&apos;s 30-day plan. Not therapy.</p>
      </Shell>
    );
  }

  if (screen.s === "tap") {
    const tap = TAPS[screen.i];
    const step = screen.i + 1;
    return (
      <Shell>
        <TopBar onBack={back} step={step} />
        <p className="small muted" style={{ marginBottom: 6 }}>Quick taps first. {screen.i + 1} of {TAPS.length}</p>
        <h2 ref={headingRef} tabIndex={-1}>{tap.question}</h2>
        <div className="opts" role="group" aria-label={tap.question}>
          {tap.options.map((o) => (
            <button key={o.id} className="opt" aria-pressed={taps[tap.id] === o.id} onClick={() => pickTap(screen.i, o.id)}>
              {o.label}
            </button>
          ))}
        </div>
      </Shell>
    );
  }

  if (screen.s === "q") {
    const i = screen.i;
    const q = QUESTIONS[i];
    const val = answers[i];
    const left = LIMITS.answerMaxChars - val.length;
    const canSkip = skipped[i] || skipsUsed < LIMITS.maxSkips;
    return (
      <Shell>
        <TopBar onBack={back} step={TAPS.length + i + 1} />
        <p className="small muted" style={{ marginBottom: 6 }}>Question {i + 1} of {QUESTIONS.length}</p>
        <h2 ref={headingRef} tabIndex={-1} id={`qh-${i}`}>{q.text}</h2>
        <p className="helper" id={`qhelp-${i}`}>{q.helper}</p>
        {i === 0 && <p className="tip">{VOICE_TIP}</p>}
        <textarea
          key={q.id}
          aria-labelledby={`qh-${i}`}
          aria-describedby={`qhelp-${i}`}
          value={val}
          maxLength={LIMITS.answerMaxChars}
          placeholder="Type or talk here..."
          autoCapitalize="sentences"
          spellCheck
          onChange={(e) => {
            const v = e.target.value.slice(0, LIMITS.answerMaxChars);
            setAnswers((a) => a.map((x, j) => (j === i ? v : x)));
            if (v.trim()) setSkipped((s) => s.map((x, j) => (j === i ? false : x)));
          }}
        />
        <div className="charrow">
          <span>{skipsUsed >= LIMITS.maxSkips && !skipped[i] ? "You've used your 2 skips." : ""}</span>
          <span className={left < 150 ? "near" : ""}>{val.length.toLocaleString()} / {LIMITS.answerMaxChars.toLocaleString()}</span>
        </div>
        <div className="spacer" />
        <div className="stick">
          <button className="btn" disabled={!val.trim()} onClick={() => nextQ(i)}>
            {i + 1 < QUESTIONS.length ? "Next" : "Almost done"}
          </button>
          {canSkip && !val.trim() && (
            <p style={{ textAlign: "center", margin: "8px 0 0" }}>
              <button
                className="link-btn"
                onClick={() => {
                  setSkipped((s) => s.map((x, j) => (j === i ? true : x)));
                  nextQ(i);
                }}
              >
                Skip this one
              </button>
            </p>
          )}
        </div>
      </Shell>
    );
  }

  if (screen.s === "email") {
    const suggestion = suggestEmail(email);
    return (
      <Shell>
        <TopBar onBack={back} step={TOTAL_STEPS} />
        <h2 ref={headingRef} tabIndex={-1}>Last step. What&apos;s your first name and email?</h2>
        <p>Your results show on the next screen, right after this. You&apos;ll also get short emails from Gage. Unsubscribe anytime.</p>
        <form onSubmit={submitEmail} noValidate>
          <label htmlFor="fn">First name</label>
          <input id="fn" type="text" autoComplete="given-name" maxLength={LIMITS.firstNameMax} value={firstName}
            aria-invalid={!!nameErr} aria-describedby={nameErr ? "fn-err" : undefined}
            onChange={(e) => { setFirstName(e.target.value); setNameErr(null); }} />
          {nameErr && <p className="err" id="fn-err">{nameErr}</p>}
          <label htmlFor="em">Email</label>
          <input id="em" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false}
            maxLength={LIMITS.emailMax} value={email} aria-invalid={!!emailErr} aria-describedby={emailErr ? "em-err" : undefined}
            onChange={(e) => { setEmail(e.target.value); setEmailErr(null); }} />
          {emailErr && <p className="err" id="em-err">{emailErr}</p>}
          {suggestion && (
            <p className="hint" aria-live="polite">
              Did you mean{" "}
              <button type="button" className="link-btn" onClick={() => { setEmail(suggestion); setEmailErr(null); }}>
                {suggestion}
              </button>
              ?
            </p>
          )}
          <div className="hp" aria-hidden="true">
            <label htmlFor="hp_7c">Leave this empty</label>
            <input id="hp_7c" name="hp_7c" type="text" tabIndex={-1} autoComplete="new-password" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          </div>
          <p className="small" style={{ margin: "18px 0 0" }}>Your answers are private. Gage never sees them.</p>
          <div style={{ marginTop: 10 }}>
            <button className="btn" type="submit">Show my results</button>
          </div>
        </form>
        <div className="privacy">
          <p style={{ margin: 0 }}>
            <strong>Your answers are private.</strong> They go to our AI provider (Anthropic) only to write your results. We don&apos;t save them, and Gage never sees them. Your email is never sent to the AI. We keep your first name, email and your result type to send you emails.{" "}
            <a href={LINKS.privacy} target="_blank" rel="noopener">Privacy Policy</a>
          </p>
        </div>
      </Shell>
    );
  }

  if (screen.s === "loading") {
    return (
      <Shell footer={false}>
        <Loading headingRef={headingRef} />
      </Shell>
    );
  }

  if (screen.s === "error") {
    const e = ERRORS[screen.code] || ERRORS.default;
    return (
      <Shell>
        <h2 ref={headingRef} tabIndex={-1}>{e.title}</h2>
        <p>{e.body}</p>
        {e.retry && <button className="btn" onClick={submit}>Try again</button>}
        {e.backTo === "email"
          ? <button className="btn secondary" onClick={() => go({ s: "email" })}>Back</button>
          : <button className="btn secondary" onClick={() => go({ s: "q", i: QUESTIONS.length - 1 })}>Back to my answers</button>}
        <p className="small muted" style={{ marginTop: 16 }}>Still stuck? Email {LINKS.support}.</p>
      </Shell>
    );
  }

  // done
  const r = screen.result;
  if (r.kind === "crisis") return <Shell><Crisis headingRef={headingRef} /></Shell>;
  if (r.kind === "under18") return <Shell><Under18 headingRef={headingRef} /></Shell>;
  if (r.kind === "harm_others") return <Shell><Harm headingRef={headingRef} onRetake={restart} /></Shell>;
  return (
    <Shell>
      <Results result={r} firstName={firstName.trim()} headingRef={headingRef} onRetake={restart} />
    </Shell>
  );
}

// ---------- pieces ----------

function prevScreen(cur: Screen): Screen {
  if (cur.s === "tap") return cur.i === 0 ? { s: "intro" } : { s: "tap", i: cur.i - 1 };
  if (cur.s === "q") return cur.i === 0 ? { s: "tap", i: TAPS.length - 1 } : { s: "q", i: cur.i - 1 };
  if (cur.s === "email") return { s: "q", i: QUESTIONS.length - 1 };
  return cur;
}

function Shell({ children, footer = true }: { children: React.ReactNode; footer?: boolean }) {
  return (
    <main className="wrap">
      <div className="brand">The Confidence of a Yes</div>
      {children}
      {footer && <Footer />}
    </main>
  );
}

function TopBar({ onBack, step }: { onBack: () => void; step: number }) {
  const pct = Math.round((step / TOTAL_STEPS) * 100);
  return (
    <div className="topbar">
      <button className="back" onClick={onBack} aria-label="Go back">&larr; Back</button>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Quiz progress">
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Loading({ headingRef }: { headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((x) => Math.min(x + 1, LOADING_LINES.length - 1)), 3500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="loading" aria-live="polite">
      <div className="dots" aria-hidden="true"><span /><span /><span /></div>
      <h2 ref={headingRef} tabIndex={-1} className="loadline">{LOADING_LINES[n]}</h2>
      <p className="small muted">This takes about 10 to 25 seconds. Please keep this page open.</p>
    </div>
  );
}

function Crisis({ headingRef }: { headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <div>
      <h1 ref={headingRef} tabIndex={-1}>You matter.</h1>
      <div className="support">
        <p className="big">What you wrote sounds heavy, and you deserve real support, not a dating plan.</p>
        <p>In the U.S., call or text <strong>988</strong> any time. It&apos;s free, and someone will listen.</p>
        <p><strong>If you are in danger right now, call 911.</strong></p>
        <a className="btn" href="tel:988">Call 988</a>
        <a className="btn secondary" href="sms:988">Text 988</a>
        <p className="small" style={{ marginTop: 14 }}>You can also chat at <a href={LINKS.lifelineChat} target="_blank" rel="noopener">988lifeline.org</a>. Outside the U.S., call your local emergency number.</p>
      </div>
      <p style={{ marginTop: 18 }}>Talking to a doctor, a counselor, a pastor or someone you trust is a strong move, not a weak one.</p>
      <p className="small muted">We didn&apos;t save your answers, and we didn&apos;t send your email anywhere.</p>
    </div>
  );
}

function Under18({ headingRef }: { headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <div>
      <h1 ref={headingRef} tabIndex={-1}>Thanks for being honest.</h1>
      <p>This quiz is built for guys 18 and up, so we can&apos;t show you results here.</p>
      <p>That&apos;s not a knock on you. You&apos;re already thinking about this, and that&apos;s a good sign. You&apos;ve got time.</p>
      <div className="card">
        <p style={{ marginBottom: 8 }}><strong>For now, three good moves:</strong></p>
        <ul className="checks" style={{ margin: 0 }}>
          <li>Be kind to people and say hi first.</li>
          <li>Build real friendships. Join a team, a club or a youth group.</li>
          <li>If something is weighing on you, talk to a parent, a coach, a pastor or a school counselor you trust.</li>
        </ul>
      </div>
      <p className="small muted">If you ever feel hopeless or think about hurting yourself, call or text 988 (U.S.). If you are in danger right now, call 911.</p>
    </div>
  );
}

function Harm({ headingRef, onRetake }: { headingRef: React.RefObject<HTMLHeadingElement | null>; onRetake: () => void }) {
  return (
    <div>
      <h1 ref={headingRef} tabIndex={-1}>Before anything else</h1>
      <p>Some of what you wrote is about pushing past what someone wants, or hurting someone. We can&apos;t help with that.</p>
      <p>Respect comes first. A no is a no, the first time. Nobody owes anyone a yes.</p>
      <p>If anger or urges to hurt someone are getting big, please talk to a counselor or someone you trust. That&apos;s a strong move.</p>
      <p className="small muted">If we read you wrong, you can retake the quiz.</p>
      <button className="btn secondary" onClick={onRetake}>Retake the quiz</button>
    </div>
  );
}

function resultsText(r: Extract<QuizResult, { kind: "result" }>, firstName: string): string {
  return [
    `My quiz results (The Confidence of a Yes)`,
    ``,
    `Your type: ${r.typeName}`,
    r.typeReason,
    ``,
    `Where you are`,
    r.whereYouAre,
    ``,
    `Where you want to be`,
    r.whereYouWant,
    ``,
    `What's holding you back`,
    ...r.holdingBack.map((h) => `- ${h.title}: ${h.text}`),
    ``,
    `Your 3 steps this week`,
    ...r.steps.map((s, i) => `${i + 1}. ${s.title}. ${s.how} Done when: ${s.doneWhen}`),
    ``,
    `If nothing changes`,
    r.ifNothingChanges,
    ``,
    `The 30-day plan: ${LINKS.salesPage}`,
  ].join("\n").replace(/^/, firstName ? `For ${firstName}\n` : "");
}

function Results({
  result: r, firstName, headingRef, onRetake,
}: {
  result: Extract<QuizResult, { kind: "result" }>;
  firstName: string;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onRetake: () => void;
}) {
  const [copied, setCopied] = useState<"" | "ok" | "fail">("");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(resultsText(r, firstName));
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
  };
  return (
    <article>
      <h1 ref={headingRef} tabIndex={-1}>Hey {firstName || "there"}. Here&apos;s what I heard.</h1>
      <p className="byline">Written by AI from your answers, using the methods in Gage&apos;s 30-day plan.</p>
      {r.fallback && <p className="note">We couldn&apos;t write your full results this time, so this one is based on your quick taps. You can retake the quiz any time for a fuller read.</p>}
      {r.lowInfo && !r.fallback && <p className="note">Your answers were pretty short, so this is a rough read. Retake with a little more detail and it gets a lot more personal.</p>}

      <div className="typecard">
        <div className="eyebrow">Your type</div>
        <h2>{r.typeName}</h2>
        <p>{r.typeReason}</p>
      </div>

      <section className="section">
        <h3>Where you are</h3>
        <p>{r.whereYouAre}</p>
      </section>

      <section className="section">
        <h3>Where you want to be</h3>
        <p>{r.whereYouWant}</p>
      </section>

      <section className="section">
        <h3>What&apos;s holding you back</h3>
        <ul className="hb">
          {r.holdingBack.map((h, i) => (
            <li key={i}><strong>{h.title}</strong>{h.text}</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h3>Your 3 steps this week</h3>
        <ol className="steps">
          {r.steps.map((s) => (
            <li key={s.repId}>
              <strong>{s.title}</strong>
              {s.how}
              <p className="done">Done when: {s.doneWhen}</p>
            </li>
          ))}
        </ol>
        <p className="small muted">A step counts when you do it, not when it goes well.</p>
      </section>

      <section className="section">
        <h3>If nothing changes</h3>
        <p className="quiet">{r.ifNothingChanges}</p>
      </section>

      <section className="section">
        <h3>How the 30-day plan fits what you said</h3>
        <p>{r.bridgeIntro}</p>
        <div className="offer">
          <ul>
            {r.planFit.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
          <p className="price">{OFFER.name}</p>
          <p><strong>{OFFER.price}, one payment.</strong> A 51-page workbook with one small rep a day, plus the 30-Day Rep Tracker, 30 Rep Cards, the When You Freeze card and the AI Practice Partner.</p>
          <p className="small">90 days to decide. If it&apos;s not worth it, email the word &quot;refund&quot; to {LINKS.support} and get your money back.</p>
          <p className="small muted">No plan can honestly promise you a date or a girlfriend. This one gives you a clear step for every day.</p>
          <a className="btn gold" href={LINKS.salesPage}>See the 30-day plan ({OFFER.price})</a>
        </div>
      </section>

      <div className="save">
        <p style={{ marginBottom: 10 }}><strong>Save this page.</strong> We don&apos;t keep your answers or these results. Take a screenshot, or copy them to your notes.</p>
        <button className="btn secondary" onClick={copy}>{copied === "ok" ? "Copied. Paste it in your notes." : "Copy my results"}</button>
        {copied === "fail" && <p className="small" style={{ marginTop: 8 }}>Your phone blocked copying. Take a screenshot instead.</p>}
        <p style={{ textAlign: "center", margin: "10px 0 0" }}>
          <button className="link-btn" onClick={onRetake}>Retake the quiz</button>
        </p>
      </div>

      <p className="small muted" style={{ marginTop: 22 }}>
        Not therapy. If you feel hopeless or think about hurting yourself, call or text 988 (U.S.). If you are in danger right now, call 911.
      </p>
    </article>
  );
}

function Footer() {
  return (
    <footer>
      <p>Answers are never saved. Not therapy. For ages 18 and up.</p>
      <p>The Confidence of a Yes, a brand of AItelligent Solutions. Questions? <a href={`mailto:${LINKS.support}`}>{LINKS.support}</a></p>
      <p className="links">
        <a href={LINKS.privacy} target="_blank" rel="noopener">Privacy Policy</a>
        <a href={LINKS.terms} target="_blank" rel="noopener">Terms</a>
        <a href={LINKS.disclaimer} target="_blank" rel="noopener">Disclaimer</a>
      </p>
    </footer>
  );
}
