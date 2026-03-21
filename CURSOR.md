# ChartSense — CURSOR.md

## What This Is

ChartSense is an AI-powered trading chart analyzer PWA built on the "Less Is More" methodology.
Users upload a chart screenshot and receive a structured 7-section analysis using exactly five
components: Bollinger Bands, MACD, RSI, Volume, and Higher Timeframe Bias.

No indicator overload. No junk. Proven methodology for beginner day traders.

## Stack

- **Framework:** Vite + React 18 + TypeScript
- **Styling:** Tailwind v4 + CSS variables (see Design System below)
- **Components:** shadcn/ui + Radix UI (all deps in package.json)
- **AI:** Anthropic Claude API — claude-sonnet-4-20250514
- **PWA:** vite-plugin-pwa (to be installed)
- **Icons:** lucide-react
- **Hosting target:** Vercel

## Project Structure

```
chartsense/
├── public/
│   ├── manifest.json          # PWA manifest — app named ChartSense
│   ├── icon-192.png           # TODO: add real icons
│   └── icon-512.png           # TODO: add real icons
├── src/
│   ├── components/
│   │   ├── ui/                # shadcn/ui base components
│   │   ├── UploadZone.tsx     # Drag/drop/paste image input
│   │   ├── AnalysisResult.tsx # 7-section AI response renderer
│   │   └── RateLimitBanner.tsx# Free tier usage tracker UI
│   ├── hooks/
│   │   └── useRateLimit.ts    # localStorage-based rate limiting
│   ├── pages/
│   │   └── Analyzer.tsx       # Main page — wires everything together
│   ├── lib/
│   │   ├── constants.ts       # SYSTEM_PROMPT, model config, rate limit keys
│   │   └── utils.ts           # cn() utility (clsx + twMerge)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css              # Tailwind import + CSS variables
├── .env.example               # VITE_ANTHROPIC_API_KEY=
├── vite.config.ts
├── postcss.config.mjs
├── package.json
├── tsconfig.json
└── index.html
```

## Design System

All colors are defined as CSS variables in src/index.css. Always use var(--color-*) or the
Tailwind arbitrary value bracket syntax. Never hardcode hex values in components.

```css
--color-dark:    #0f1117   /* page background */
--color-panel:   #1a1d27   /* card/section background */
--color-card:    #22263a   /* inner card background */
--color-accent:  #4f8ef7   /* primary blue — buttons, links, highlights */
--color-accent2: #f7a34f   /* amber — secondary highlights, labels */
--color-green:   #26a69a   /* bullish signals, success states */
--color-red:     #ef5350   /* bearish signals, error states */
--color-gold:    #ffd700   /* vote counts, bottom line, warnings */
--color-white:   #e8eaf0   /* primary text */
--color-muted:   #8a8fa8   /* secondary text, placeholders */
--color-divider: #2e3250   /* borders, separators */
```

**Typography:**
- Body font: DM Sans (Google Fonts)
- Mono font: Space Mono (Google Fonts)
- Import both in index.css

**Aesthetic direction:**
Dark, data-focused, trading terminal feel. Sharp. Not playful. Not corporate.
Think Bloomberg terminal meets modern SaaS. Every element should feel intentional.

## Key Constants (src/lib/constants.ts)

```ts
MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS = 1500
FREE_LIMIT = 3                        // free analyses per day
RATE_LIMIT_KEY = "chartsense_daily_count"
RATE_LIMIT_DATE_KEY = "chartsense_last_date"
```

## The System Prompt (SYSTEM_PROMPT in constants.ts)

The system prompt instructs Claude to analyze trading charts using the Less Is More methodology.
It must enforce this exact 7-section output structure:

1. ## INDICATOR READINGS — BB, MACD, RSI, Volume, HTF each with individual signal vote
2. ## INDICATOR VOTE — count bullish/bearish/neutral, give overall bias
3. ## CURRENT SITUATION — 2-3 sentences on what chart is doing right now
4. ## ENTRY ASSESSMENT — early/on time/late, what confirmation is missing
5. ## TRADE LEVELS — entry zone, stop loss, TP1 (middle BB), TP2, R:R
6. ## PRE-TRADE CHECKLIST — HTF checked, candle closed, 2+ agree, volume, stop, HTF align
7. ## BOTTOM LINE — one direct sentence, what to do right now

Tone: direct, honest, no sugarcoating. If setup is weak or invalid, say so clearly.

Signal settings: BB(15,2) · MACD(8/21/5) · RSI(9) levels 60/40 · Volume 20-period MA

## Anthropic API Call Structure

```ts
fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "anthropic-dangerous-direct-browser-access": "true"  // required for browser calls
  },
  body: JSON.stringify({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: "image/png", data: b64 } },
        { type: "text", text: `Analyze this trading chart.${notes ? " Trader notes: " + notes : ""}` }
      ]
    }]
  })
})
```

API key comes from: `import.meta.env.VITE_ANTHROPIC_API_KEY`

## Rate Limiting (useRateLimit hook)

- Stored in localStorage — no backend required for v1
- Keys: RATE_LIMIT_KEY (count), RATE_LIMIT_DATE_KEY (YYYY-MM-DD)
- On mount: if stored date !== today, reset count to 0
- increment() adds 1 and saves to localStorage
- isLimited = count >= FREE_LIMIT (3)
- Resets automatically at midnight (next mount after date change)

## AnalysisResult Parsing

Split AI response text on newlines. Lines starting with "## " are section headers.
Map section titles to colors:

```
INDICATOR READINGS -> #4f8ef7
INDICATOR VOTE     -> #ffd700
CURRENT SITUATION  -> #00bcd4
ENTRY ASSESSMENT   -> #f7a34f
TRADE LEVELS       -> #26a69a
PRE-TRADE CHECKLIST-> #8bc34a
BOTTOM LINE        -> #ffd700
```

Line color rules:
- Contains BULLISH (not "NOT BULLISH") → green + bold
- Contains BEARISH → red + bold
- Contains NO TRADE or MIXED → gold + bold
- Contains CONFIRMS (not "NOT") → green
- Contains DOES NOT CONFIRM → red
- Contains [x] or [X] → green
- Contains [ ] → red
- Starts with **bold**: → amber label + white rest
- Starts with - or * or • → indent 12px, replace prefix with bullet

## Rules — Always Follow

- Never expose VITE_ANTHROPIC_API_KEY in committed code
- Never hardcode colors — always use CSS variables
- Never use Arial, Inter, or Roboto — use DM Sans and Space Mono
- Never add indicators beyond the five in the methodology
- Always use the cn() utility from src/lib/utils for className merging
- Always TypeScript — no .js or .jsx files in src/
- Mobile-first — max-width 680px centered, large tap targets
- Use shadcn/ui components from src/components/ui/ — do not install new UI libraries
- Keep components small — if a file exceeds ~150 lines, split it

## Rules — Never Do

- Do not add Stochastic, CCI, Fibonacci, Ichimoku, or any indicator not in the five
- Do not add social features, live price feeds, or broker integrations in v1
- Do not use localStorage for anything other than rate limiting in v1
- Do not add router complexity — single page app for v1
- Do not use purple gradients on white — that is generic AI slop

## Build Order (if starting from scratch)

1. src/lib/utils.ts
2. src/index.css (Tailwind + CSS variables + Google Fonts)
3. src/lib/constants.ts (SYSTEM_PROMPT + all constants)
4. src/components/ui/ (button, badge, card, textarea, progress, separator)
5. src/components/UploadZone.tsx
6. src/hooks/useRateLimit.ts
7. src/components/RateLimitBanner.tsx
8. src/components/AnalysisResult.tsx
9. src/pages/Analyzer.tsx
10. src/App.tsx + src/main.tsx
11. index.html (meta tags, Google Fonts link, PWA manifest link)
12. vite.config.ts update (add vite-plugin-pwa)

## V1 Monetization (not yet built — context only)

- Free tier: 3 analyses/day (rate limited by localStorage)
- Pro tier: $8/month via Stripe — unlimited analyses
- Upgrade CTA: shown in RateLimitBanner when isLimited === true
- onUpgradeClick: console.log placeholder for now, wire Stripe later

## Entity

Bar Book LLC — Knoxville, Tennessee
App: ChartSense (chartsense or chartsense.app domain TBD)

## Current Status — What Is Already Built

All core files are complete and ready. Do NOT regenerate these unless asked:

- src/lib/utils.ts ✅
- src/lib/constants.ts ✅ (includes full SYSTEM_PROMPT)
- src/index.css ✅
- src/vite-env.d.ts ✅
- src/hooks/useRateLimit.ts ✅
- src/components/UploadZone.tsx ✅
- src/components/AnalysisResult.tsx ✅
- src/components/RateLimitBanner.tsx ✅
- src/pages/Analyzer.tsx ✅
- src/App.tsx ✅
- src/main.tsx ✅
- src/components/ui/button.tsx ✅
- src/components/ui/badge.tsx ✅
- src/components/ui/card.tsx ✅
- src/components/ui/textarea.tsx ✅
- src/components/ui/progress.tsx ✅
- src/components/ui/separator.tsx ✅
- vite.config.ts ✅ (includes vite-plugin-pwa)
- public/manifest.json ✅
- index.html ✅

## First Thing To Do After Cloning

Run these commands:
```bash
npm install
npm install -D vite-plugin-pwa
cp .env.example .env.local
# Add your VITE_ANTHROPIC_API_KEY to .env.local
npm run dev
```

## If Cursor Finds TypeScript Errors

Common issues to fix:
1. Missing @radix-ui/react-progress or @radix-ui/react-separator — already in package.json, just npm install
2. Sonner toast type for action — use the correct sonner action type
3. Any "cannot find module" errors — check the @ alias is resolving via tsconfig paths

## Next Features to Build (in order)

1. Backend proxy route — move Anthropic API call to /api/analyze to hide the key
2. Stripe integration — wire onUpgradeClick to a Stripe checkout session
3. Real PWA icons — generate and add icon-192.png and icon-512.png to /public
4. Deploy to Vercel — push to GitHub, import in Vercel, add env vars
