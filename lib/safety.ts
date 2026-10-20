// Server-side crisis check. Runs BEFORE the AI. If it hits, we skip the AI and show the support screen.
// Phrases are chosen to avoid common false alarms ("killing it at work").

const CRISIS_PATTERNS: RegExp[] = [
  /\bsuicid(e|al)\b/i,
  /\bkill\s*my\s*self\b/i,
  /\bkms\b/i,
  /\bend(ing)?\s+(my|it)\s+(own\s+)?life\b/i,
  /\bend\s+it\s+all\b/i,
  /\btake\s+my\s+(own\s+)?life\b/i,
  /\b(want|wanting)\s+to\s+die\b/i,
  /\bwanna\s+(just\s+)?die\b/i,
  /\bwish\s+i\s+(was|were)\s+dead\b/i,
  /\bwish\s+i\s+(wasn'?t|weren'?t)\s+(alive|here|born)\b/i,
  /\bwish\s+i\s*(was|were|had|'?d)\s+never\s+(been\s+)?born\b/i,
  /\bbetter\s+off\s+(dead|without\s+me)\b/i,
  /\b(not|isn'?t|aint|ain'?t)\s+worth\s+living\b/i,
  /\bno\s+(reason|point)\s+((to|in)\s+)?(live|living|being alive|going on)\b/i, // Tester v2: "no point living like this"
  /\bwhat'?s\s+the\s+point\s+(of|in)\s+(living|life|being alive)\b/i,
  /\bdon'?t\s+want\s+to\s+(live|be\s+alive|be\s+here\s+anymore|exist|wake\s+up)\b/i,
  /\bself[\s-]?harm(ing)?\b/i,
  /\b(want|wanna|wanted|urge|urges|thought about|think about|thinking about|going|gonna)\s+(to\s+)?(hurt|hurting|cut|cutting|harm|harming)\s+my\s*self\b/i,
  /\bharm(ing)?\s+my\s*self\b/i,
  /\bcutting\s+my\s*self\b(?!\s+off)/i,
  /\b(hang|hanging|shoot|shooting)\s+my\s*self\b/i,
  /\boverdos(e|ing)\b/i,
  /\bunalive\b/i,
  /\bsewer\s*slide\b/i,
];

// Common idioms that are not a crisis. Removed before the check so they can't trip it.
// "killing myself at the gym", "hurt myself lifting", "cut myself shaving" are no longer patterns at all.
const NOT_CRISIS = /\b(social|career|commercial|political|dating)\s+suicide\b/gi;

// Server-side under-18 backstop (Tester v2). Present tense only ("I'm 16", "I'm in 11th grade",
// "I'm a junior in high school"), so a memory like "In 10th grade a girl laughed at me" or "when I was 16"
// never trips it. The age number must be followed by the end of a phrase, so "I'm 16 months into lifting"
// doesn't trip it either. The AI's under18 flag stays as the second layer for anything this misses.
const I_AM = String.raw`\b(?:i'?m|i\s+am|im)\s+(?:only\s+|just\s+|still\s+|currently\s+)?`;
const UNDER18_PATTERNS: RegExp[] = [
  new RegExp(I_AM + String.raw`(1[0-7])(?:\s*(?:years?|yrs?)\s*old|\s*y\/?o)?(?=\s*(?:$|[.,!?;)]|and\b|but\b|so\b|lol\b|rn\b|right now\b|turning\b))`, "i"),
  new RegExp(I_AM + String.raw`(?:in\s+)?(?:the\s+)?(?:7th|8th|9th|10th|11th|12th|seventh|eighth|ninth|tenth|eleventh|twelfth)\s+grade\b`, "i"),
  new RegExp(I_AM + String.raw`(?:in\s+)?(?:high\s*school|middle\s*school|junior\s*high)\b`, "i"),
  new RegExp(I_AM + String.raw`(?:a\s+)?(?:high\s*school|hs)\s+(?:freshman|sophomore|junior|senior|student|kid)\b`, "i"),
  new RegExp(I_AM + String.raw`(?:a\s+)?(?:freshman|sophomore|junior|senior)\s+(?:in|at)\s+(?:high\s*school|hs)\b`, "i"),
  /\bmy\s+(?:mom|mum|dad|parents?)\s+(?:won'?t|don'?t|doesn'?t|wont|dont|doesnt)\s+let\s+me\s+date\b/i,
];

export function under18Hit(texts: string[]): boolean {
  return texts.some((t) => UNDER18_PATTERNS.some((re) => re.test(t)));
}

export function crisisHit(texts: string[]): boolean {
  return texts.some((t) => {
    const clean = t.replace(NOT_CRISIS, " ");
    return CRISIS_PATTERNS.some((re) => re.test(clean));
  });
}
