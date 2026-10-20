// Click-through + phone screenshots. Needs the dev server running with QUIZ_MOCK=1.
// Run: NODE_PATH=<folder with playwright-core> node scripts/screens.cjs [baseUrl]
// Uses the preinstalled Chromium (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers). Never stores real answers.
const { chromium } = require("playwright-core");
const path = require("path");
const fs = require("fs");

const BASE = process.argv[2] || "http://localhost:3100";
const OUT = path.join(__dirname, "..", "screens");
const EXE = process.env.CHROME_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

// Same as MARCUS_ANSWERS in lib/mock.ts (Gage's test persona, made up).
const SAMPLE = [
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

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: EXE });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  const shot = async (name, full = false) => {
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(OUT, name + ".png"), fullPage: full });
    console.log("saved", name);
  };

  // Happy path
  await page.goto(BASE);
  await shot("01-intro");
  await page.getByRole("button", { name: "Start" }).click();
  await shot("02-tap-age");
  await page.getByRole("button", { name: "22 to 25" }).click();
  await shot("03-tap-dating");
  await page.getByRole("button", { name: "I've talked to girls, but never asked one out." }).click();
  await page.getByRole("button", { name: "1 or 2" }).click();
  await shot("04-tap-want");
  await page.getByRole("button", { name: "Stay calm when it's time to talk" }).click();
  for (let i = 0; i < 10; i++) {
    if (i === 3) await shot("06-question-4-empty-skip");
    await page.locator("textarea").fill(SAMPLE[i]);
    if (i === 0) await shot("05-question-1-voice-tip");
    if (i === 2) await shot("07-question-3-filled");
    await page.getByRole("button", { name: i < 9 ? "Next" : "Almost done" }).click();
  }
  await shot("08-email");
  await page.getByRole("button", { name: "Show my results" }).click();
  await shot("09-email-errors");
  await page.getByLabel("First name").fill("Marcus");
  await page.getByLabel("Email").fill("marcus@gmial.con");
  await shot("09b-email-typo-hint");
  await page.getByRole("button", { name: "marcus@gmail.com" }).click();
  console.log("typo fixed:", (await page.getByLabel("Email").inputValue()) === "marcus@gmail.com");
  await page.getByLabel("Email").fill("marcus@example.com");
  await page.getByRole("button", { name: "Show my results" }).click();
  await page.waitForSelector(".loadline");
  await shot("10-loading");
  await page.waitForSelector(".typecard", { timeout: 60000 });
  await shot("11-results-top");
  await shot("12-results-full", true);

  // Retake in the same visit: the request must say alreadySaved (no second signup)
  let lastBody = null;
  page.on("request", (r) => { if (r.url().endsWith("/api/results")) lastBody = JSON.parse(r.postData() || "{}"); });
  await page.getByRole("button", { name: "Retake the quiz" }).click();
  await page.getByRole("button", { name: "Start" }).click();
  await page.getByRole("button", { name: "22 to 25" }).click();
  await page.getByRole("button", { name: "I've talked to girls, but never asked one out." }).click();
  await page.getByRole("button", { name: "1 or 2" }).click();
  await page.getByRole("button", { name: "Stay calm when it's time to talk" }).click();
  for (let i = 0; i < 10; i++) {
    await page.locator("textarea").fill(SAMPLE[i]);
    await page.getByRole("button", { name: i < 9 ? "Next" : "Almost done" }).click();
  }
  await page.getByRole("button", { name: "Show my results" }).click();
  await page.waitForSelector(".typecard", { timeout: 60000 });
  console.log("retake sends alreadySaved:", lastBody && lastBody.alreadySaved === true, "| has email:", !!(lastBody && lastBody.email), "| honeypot field:", lastBody && "hp_7c" in lastBody);

  // Phone back button: browser back on question 3 goes to question 2 and keeps the answer
  await page.goto(BASE);
  await page.getByRole("button", { name: "Start" }).click();
  await page.getByRole("button", { name: "22 to 25" }).click();
  await page.getByRole("button", { name: "I've talked to girls, but never asked one out." }).click();
  await page.getByRole("button", { name: "1 or 2" }).click();
  await page.getByRole("button", { name: "Stay calm when it's time to talk" }).click();
  await page.locator("textarea").fill("answer one");
  await page.getByRole("button", { name: "Next" }).click();
  await page.locator("textarea").fill("answer two");
  await page.getByRole("button", { name: "Next" }).click();
  await page.goBack();
  await page.waitForTimeout(300);
  const onQ2 = await page.getByText("Question 2 of 10").isVisible();
  const kept = (await page.locator("textarea").inputValue()) === "answer two";
  await page.goBack();
  await page.waitForTimeout(300);
  const onQ1 = await page.getByText("Question 1 of 10").isVisible();
  console.log("history back -> Q2:", onQ2, "| answer kept:", kept, "| back again -> Q1:", onQ1, "| still on site:", page.url().startsWith(BASE));

  // Back button check
  await page.goto(BASE);
  await page.getByRole("button", { name: "Start" }).click();
  await page.getByRole("button", { name: "26 to 29" }).click();
  await page.getByRole("button", { name: "Go back" }).click();
  const backOk = await page.getByRole("button", { name: "26 to 29" }).getAttribute("aria-pressed");
  console.log("back keeps choice:", backOk === "true");

  // Under 18
  await page.goto(BASE);
  await page.getByRole("button", { name: "Start" }).click();
  await page.getByRole("button", { name: "Under 18" }).click();
  await shot("13-under-18");

  // Crisis (server keyword check) and harm + low info (mock switches)
  async function path2(firstAnswer, name) {
    await page.goto(BASE);
    await page.getByRole("button", { name: "Start" }).click();
    await page.getByRole("button", { name: "18 to 21" }).click();
    await page.getByRole("button", { name: "I've been on a date or two." }).click();
    await page.getByRole("button", { name: "None" }).click();
    await page.getByRole("button", { name: "Make more friends" }).click();
    for (let i = 0; i < 10; i++) {
      await page.locator("textarea").fill(i === 0 ? firstAnswer : "idk");
      await page.getByRole("button", { name: i < 9 ? "Next" : "Almost done" }).click();
    }
    await page.getByLabel("First name").fill("Test");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByRole("button", { name: "Show my results" }).click();
    await page.waitForSelector(".loading", { state: "detached", timeout: 30000 });
    await shot(name, true);
  }
  await path2("honestly some days I want to die", "14-crisis");
  await path2("mockharm", "15-harm-others");
  await path2("mockjunk", "16-low-info-result");

  // Error screen (API forced to fail)
  await page.route("**/api/results", (r) => r.fulfill({ status: 502, contentType: "application/json", body: '{"error":"ai_failed"}' }));
  await path2("anything", "17-error");
  await page.unroute("**/api/results");

  const ls = await page.evaluate(() => JSON.stringify({ local: Object.keys(localStorage), session: Object.keys(sessionStorage), cookie: document.cookie }));
  console.log("browser storage:", ls);
  console.log("page errors:", errors.length ? errors : "none");
  await browser.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
