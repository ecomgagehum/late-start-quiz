import { TYPES, TypeId } from "./content";

// How the email reaches Kajabi. Pick with KAJABI_MODE:
//   off      : accept the email, send it nowhere (for testing).
//   form     : post to the public Kajabi opt-in form, like a visitor would (free on any plan). UNVERIFIED, see README.
//   api      : Kajabi Public API (needs API access on your plan). Submits the form, then adds the type tag.
//   webhook  : POST JSON to KAJABI_WEBHOOK_URL (for example a Zapier "Catch Hook"), Zapier does the rest.
// Answers are never sent here. Only first name, email and the type tag.

export type SubscribeInput = { firstName: string; email: string; type: TypeId | null };
export type SubscribeOutcome = { ok: boolean; mode: string; code: string; tagged: boolean };

const DEFAULT_FORM_ID = "2149754352";
const DEFAULT_SITE_ORIGIN = "https://start.confidenceofayes.com";

function tagName(type: TypeId | null): string | null {
  return type ? TYPES[type].tag : null;
}

function parseJsonEnv<T>(name: string): T | null {
  const v = process.env[name];
  if (!v) return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    console.error(`quiz_env_bad_json ${name}`);
    return null;
  }
}

async function fetchWithTimeout(url: string, init: RequestInit, ms = 10_000): Promise<Response> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctl.signal });
  } finally {
    clearTimeout(t);
  }
}

// ---------- form mode ----------
// Kajabi's hosted form page is loaded, its <form> action and hidden fields are read (no guessing of
// tokens), and the name + email are posted back with the same cookies. If the page has a captcha,
// this cannot work from a server and returns code "form_captcha".
// Tags: a plain form post cannot set a tag. Optional KAJABI_TYPE_FORM_IDS maps each type to its own
// form whose "on submit" automation adds that type's tag in Kajabi.

function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));
  return m ? (m[2] ?? m[3] ?? "") : null;
}

function decodeHtml(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

export function parseKajabiForm(html: string, pageUrl: string) {
  const formMatch = html.match(/<form\b[^>]*>[\s\S]*?<\/form>/i);
  if (!formMatch) return null;
  const formHtml = formMatch[0];
  const openTag = formHtml.match(/<form\b[^>]*>/i)![0];
  const actionRaw = attr(openTag, "action");
  if (!actionRaw) return null;
  const action = new URL(decodeHtml(actionRaw), pageUrl).toString();
  const method = (attr(openTag, "method") || "post").toLowerCase();
  const hidden: Record<string, string> = {};
  let emailField: string | null = null;
  let nameField: string | null = null;
  for (const m of formHtml.matchAll(/<input\b[^>]*>/gi)) {
    const tag = m[0];
    const name = attr(tag, "name");
    if (!name) continue;
    const type = (attr(tag, "type") || "text").toLowerCase();
    if (type === "hidden") hidden[name] = decodeHtml(attr(tag, "value") || "");
    else if (type === "email" || /\[email\]$|^email$/i.test(name)) emailField = name;
    else if (/\[name\]$|^name$|first_name/i.test(name)) nameField = nameField ?? name;
  }
  const captcha = /g-recaptcha|grecaptcha|recaptcha\/api|h-captcha|hcaptcha|cf-turnstile/i.test(formHtml + html);
  return { action, method, hidden, emailField, nameField, captcha };
}

async function viaForm(input: SubscribeInput): Promise<SubscribeOutcome> {
  const origin = (process.env.KAJABI_SITE_ORIGIN || DEFAULT_SITE_ORIGIN).replace(/\/$/, "");
  const typeForms = parseJsonEnv<Partial<Record<TypeId, string>>>("KAJABI_TYPE_FORM_IDS");
  const typeFormId = input.type && typeForms ? typeForms[input.type] : undefined;
  const formId = typeFormId || process.env.KAJABI_FORM_ID || DEFAULT_FORM_ID;
  const pageUrl = `${origin}/forms/${formId}`;
  const ua = "Mozilla/5.0 (compatible; LateStartQuiz/1.0)";

  const page = await fetchWithTimeout(pageUrl, { headers: { "User-Agent": ua, Accept: "text/html" }, redirect: "follow" });
  if (!page.ok) return { ok: false, mode: "form", code: `form_page_${page.status}`, tagged: false };
  const cookies = (page.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
  const form = parseKajabiForm(await page.text(), pageUrl);
  if (!form) return { ok: false, mode: "form", code: "form_not_found", tagged: false };
  if (form.captcha) return { ok: false, mode: "form", code: "form_captcha", tagged: false };
  if (!form.emailField) return { ok: false, mode: "form", code: "form_no_email_field", tagged: false };

  const body = new URLSearchParams(form.hidden);
  body.set(form.emailField, input.email);
  if (form.nameField) body.set(form.nameField, input.firstName);
  const res = await fetchWithTimeout(form.action, {
    method: "POST",
    headers: {
      "User-Agent": ua,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "text/html,application/json",
      Origin: origin,
      Referer: pageUrl,
      ...(cookies ? { Cookie: cookies } : {}),
    },
    body: body.toString(),
    redirect: "manual",
  });
  // Kajabi usually answers a good post with a redirect (thank-you page) or 200.
  const ok = res.status >= 200 && res.status < 400;
  return { ok, mode: "form", code: ok ? `form_sent_${res.status}` : `form_post_${res.status}`, tagged: ok && !!typeFormId };
}

// ---------- api mode ----------
// Docs: POST https://api.kajabi.com/v1/oauth/token (client_credentials),
//       POST /v1/forms/{id}/submit (JSON:API, name + email),
//       GET  /v1/contacts?filter[site_id]=..&filter[email_contains]=..,
//       POST /v1/contacts/{id}/relationships/tags  { data: [{ type: "contact_tags", id }] }.

const API = "https://api.kajabi.com";
let tokenCache: { token: string; exp: number } | null = null;

async function apiToken(): Promise<string | null> {
  if (process.env.KAJABI_API_KEY) return process.env.KAJABI_API_KEY; // a ready Bearer token, if you have one
  if (tokenCache && tokenCache.exp > Date.now() + 30_000) return tokenCache.token;
  const id = process.env.KAJABI_CLIENT_ID;
  const secret = process.env.KAJABI_CLIENT_SECRET;
  if (!id || !secret) return null;
  const res = await fetchWithTimeout(`${API}/v1/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret }).toString(),
  });
  if (!res.ok) {
    console.error(`quiz_subscribe api_token_status=${res.status}`);
    return null;
  }
  const j = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!j.access_token) return null;
  tokenCache = { token: j.access_token, exp: Date.now() + (j.expires_in ?? 3600) * 1000 };
  return j.access_token;
}

async function viaApi(input: SubscribeInput): Promise<SubscribeOutcome> {
  const token = await apiToken();
  if (!token) return { ok: false, mode: "api", code: "api_no_token", tagged: false };
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/vnd.api+json", Accept: "application/vnd.api+json" };
  // Submit the per-type form when there is one (KAJABI_TYPE_FORM_IDS): its Kajabi automation adds the type tag,
  // so no tag ids or tag scopes are needed. Otherwise the main quiz form.
  const typeForms = parseJsonEnv<Partial<Record<TypeId, string>>>("KAJABI_TYPE_FORM_IDS");
  const typeFormId = input.type && typeForms ? typeForms[input.type] : undefined;
  const formId = typeFormId || process.env.KAJABI_FORM_ID || DEFAULT_FORM_ID;
  const sub = await fetchWithTimeout(`${API}/v1/forms/${formId}/submit`, {
    method: "POST",
    headers,
    body: JSON.stringify({ data: { type: "form_submissions", attributes: { name: input.firstName, email: input.email } } }),
  });
  if (!sub.ok) return { ok: false, mode: "api", code: `api_submit_${sub.status}`, tagged: false };
  if (typeFormId) return { ok: true, mode: "api", code: "api_submitted_type_form", tagged: true };

  // Tag: needs tag ids (Kajabi tag ids, not names) in KAJABI_TAG_IDS, for example
  // {"freezer":"111","no_places":"222","burned_before":"333","never_started":"444"}
  const tagIds = parseJsonEnv<Partial<Record<TypeId, string>>>("KAJABI_TAG_IDS");
  const tagId = input.type && tagIds ? tagIds[input.type] : undefined;
  if (!tagId) return { ok: true, mode: "api", code: "api_submitted_no_tag", tagged: false };

  const siteId = process.env.KAJABI_SITE_ID || "2148936666";
  const q = new URLSearchParams({ "filter[site_id]": siteId, "filter[email_contains]": input.email, "page[size]": "10" });
  const look = await fetchWithTimeout(`${API}/v1/contacts?${q}`, { headers });
  if (!look.ok) return { ok: true, mode: "api", code: `api_lookup_${look.status}`, tagged: false };
  const list = (await look.json()) as { data?: { id: string; attributes?: { email?: string } }[] };
  const contact = (list.data || []).find((c) => (c.attributes?.email || "").toLowerCase() === input.email.toLowerCase());
  if (!contact) return { ok: true, mode: "api", code: "api_contact_not_found", tagged: false };
  const tag = await fetchWithTimeout(`${API}/v1/contacts/${contact.id}/relationships/tags`, {
    method: "POST",
    headers,
    body: JSON.stringify({ data: [{ type: "contact_tags", id: String(tagId) }] }),
  });
  return { ok: true, mode: "api", code: tag.ok ? "api_tagged" : `api_tag_${tag.status}`, tagged: tag.ok };
}

// ---------- webhook mode ----------
async function viaWebhook(input: SubscribeInput): Promise<SubscribeOutcome> {
  const url = process.env.KAJABI_WEBHOOK_URL;
  if (!url) return { ok: false, mode: "webhook", code: "webhook_no_url", tagged: false };
  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.KAJABI_WEBHOOK_SECRET ? { "X-Quiz-Secret": process.env.KAJABI_WEBHOOK_SECRET } : {}),
    },
    body: JSON.stringify({
      first_name: input.firstName,
      email: input.email,
      type: input.type,
      tag: tagName(input.type),
      source: "AI Quiz",
    }),
  });
  return { ok: res.ok, mode: "webhook", code: `webhook_${res.status}`, tagged: res.ok && !!input.type };
}

export async function subscribe(input: SubscribeInput): Promise<SubscribeOutcome> {
  const mode = (process.env.KAJABI_MODE || "off").toLowerCase();
  try {
    if (mode === "form") return await viaForm(input);
    if (mode === "api") return await viaApi(input);
    if (mode === "webhook") return await viaWebhook(input);
    return { ok: true, mode: "off", code: "off", tagged: false };
  } catch (e) {
    const name = e instanceof Error ? e.name : "error";
    return { ok: false, mode, code: `exception_${name}`, tagged: false };
  }
}
