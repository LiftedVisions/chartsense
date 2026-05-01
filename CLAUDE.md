# ChartSense — CLAUDE.md

## What This Is

ChartSense is an AI-powered trading chart analyzer PWA built on the **"Less Is More" methodology**.
Users upload a chart screenshot and receive a structured 7-section analysis using exactly five
indicators: Bollinger Bands, MACD, RSI, Volume, and Higher Timeframe Bias.

**Positioning:** A discipline enforcer, not a signal service. It helps traders stay consistent
with a rules-based process — which is exactly what prop firms evaluate candidates on.

**Entity:** Bar Book LLC — Knoxville, Tennessee
**Domain:** chartsense.app (target)

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite + React 18 + TypeScript |
| Styling | Tailwind CSS v4 + CSS variables |
| UI | shadcn/ui + Radix UI |
| Routing | React Router DOM v6 |
| Auth | Supabase magic link (passwordless JWT) |
| AI | Anthropic Claude API — claude-sonnet-4-20250514 |
| Backend (dev) | Express on port 8787 (server/) |
| Backend (prod) | Vercel Serverless Functions (api/) |
| PWA | vite-plugin-pwa (auto-updating service worker) |
| Fonts | DM Sans + Space Mono (Google Fonts) |

---

## Project Structure

```
chartsense/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── icon-192.png           # PWA home screen icon
│   └── icon-512.png           # PWA splash screen icon
├── src/
│   ├── pages/
│   │   ├── Landing.tsx        # Homepage (hero, problem, solution, pricing, footer)
│   │   ├── Analyzer.tsx       # Core feature — upload, notes, analyze, results
│   │   ├── Guide.tsx          # Methodology deep-dive with sticky nav
│   │   ├── GetFunded.tsx      # Prop firm comparison + affiliate CTAs (monetization)
│   │   ├── About.tsx          # About ChartSense and Bar Book LLC
│   │   ├── Privacy.tsx        # Privacy policy
│   │   ├── Terms.tsx          # Terms of use
│   │   └── LegalShell.tsx     # Reusable layout for legal pages
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives (button, badge, card, etc.)
│   │   ├── Navbar.tsx         # Header — logo, nav links, analyze button
│   │   ├── AuthPanel.tsx      # Magic link sign-in / session display
│   │   ├── UploadZone.tsx     # Drag/drop/paste/click image upload
│   │   ├── AnalysisResult.tsx # 7-section AI response renderer + post-analysis CTA
│   │   ├── RateLimitBanner.tsx# Free tier usage tracker
│   │   ├── FundedCTA.tsx      # Reusable subtle prop firm CTA card
│   │   └── AppLogo.tsx        # Inline SVG chart icon
│   ├── contexts/
│   │   └── AuthContext.tsx    # Session + user state (JWT-based)
│   ├── hooks/
│   │   └── useRateLimit.ts    # localStorage-based daily rate limiting
│   └── lib/
│       ├── constants.ts       # MODEL, MAX_TOKENS, SYSTEM_PROMPT, rate limit keys
│       ├── supabase.ts        # Supabase client initialization
│       └── utils.ts           # cn() utility (clsx + twMerge)
├── server/
│   ├── index.ts               # Express dev server — POST /api/analyze
│   ├── anthropic.ts           # analyzeChartImage() — Claude API call
│   └── auth.ts                # getUserIdFromAuthHeader() — JWT validation
├── api/
│   └── analyze.ts             # Vercel Function handler (wraps server logic, 60s timeout)
├── vite.config.ts
├── vercel.json                # { functions: { api/analyze.ts: { maxDuration: 60 } } }
└── index.html                 # PWA meta, Google Fonts, OG tags
```

---

## Design System

All colors are CSS variables in `src/index.css`. **Never hardcode hex values in components.**

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

**Typography:** Body = DM Sans · Mono = Space Mono · Never Arial, Inter, or Roboto.

**Aesthetic:** Dark, data-focused, trading terminal. Bloomberg meets modern SaaS.
Max-width 680px centered. Mobile-first. Large tap targets.

---

## Key Constants (`src/lib/constants.ts`)

```ts
MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS = 1500
FREE_LIMIT = 3                        // free analyses per day
RATE_LIMIT_KEY = "chartsense_daily_count"
RATE_LIMIT_DATE_KEY = "chartsense_last_date"
```

---

## The System Prompt

Instructs Claude to analyze charts using Less Is More — enforces this exact 7-section output:

1. `## INDICATOR READINGS` — BB, MACD, RSI, Volume, HTF each with individual signal vote
2. `## INDICATOR VOTE` — count bullish/bearish/neutral, give overall bias
3. `## CURRENT SITUATION` — 2–3 sentences on what chart is doing right now
4. `## ENTRY ASSESSMENT` — early/on time/late, what confirmation is missing
5. `## TRADE LEVELS` — entry zone, stop loss, TP1 (middle BB), TP2, R:R
6. `## PRE-TRADE CHECKLIST` — HTF checked, candle closed, 2+ agree, volume, stop, HTF align
7. `## BOTTOM LINE` — one direct sentence, what to do right now

Signal settings: BB(15,2) · MACD(8/21/5) · RSI(9) levels 60/40 · Volume 20-period MA

Tone: direct, honest, no sugarcoating. Weak setups get called out clearly.

---

## Auth Flow

1. User enters email → `supabase.auth.signInWithOtp()` → magic link sent
2. User clicks link → Supabase exchanges token → session established
3. `onAuthStateChange` fires `SIGNED_IN` → redirect to `/analyze`
4. JWT stored in `AuthContext` via `useAuth()` hook
5. JWT passed as `Authorization: Bearer <token>` on every API call
6. Backend validates via `supabase.auth.getUser(jwt)` in `server/auth.ts`

---

## API Architecture

**Dual-entry pattern — same logic, two runtimes:**

- **Dev:** Express `server/index.ts` on port 8787; Vite proxies `/api` → `localhost:8787`
- **Prod:** `api/analyze.ts` as a Vercel Function (60s timeout)
- **Shared:** `server/anthropic.ts` (Claude call) + `server/auth.ts` (JWT validation)

```
POST /api/analyze
  Body: { imageBase64, mediaType, notes? }
  Auth: Bearer <supabase-jwt>
  → validate JWT
  → call Claude with system prompt + image + notes
  → return { text: analysisText }
```

**Security:** `ANTHROPIC_API_KEY` is server-side only. Never use `VITE_ANTHROPIC_API_KEY`.

---

## Rate Limiting

- Client-side only (v1) — localStorage keys: `chartsense_daily_count` + `chartsense_last_date`
- 3 free analyses/day — resets at midnight local time
- `isLimited` gates the analyze button and triggers `FundedCTA` (see Monetization)
- Future: move to Supabase for paid tier enforcement

---

## AnalysisResult Parsing

Split AI text on newlines. Lines starting with `## ` are section headers. Color rules:

- BULLISH (not "NOT BULLISH") → green + bold
- BEARISH → red + bold
- NO TRADE / MIXED → gold + bold
- CONFIRMS (not "NOT") → green
- DOES NOT CONFIRM → red
- `[x]` / `[X]` → green · `[ ]` → red
- `**Label:**` pattern → amber label + white rest

---

## Monetization Strategy

**Primary (v1): Prop firm affiliate marketing — subtle, educational, never promotional.**

### Why Prop Firms Fit Naturally

ChartSense trains the exact behaviors prop firms evaluate: rules-based entries, defined stops,
consistent process over gut feeling. The affiliate placement is a logical next step, not an ad.

### FundedCTA Component

A reusable card placed in two high-intent locations:

1. **Post-analysis** — appears below results in `AnalysisResult.tsx` after every completed run
2. **Rate limit reached** — shown in `RateLimitBanner.tsx` when `isLimited === true`

Tone: "Ready to trade setups like this with real capital?" — never "click here to buy."

### `/get-funded` Page

Frame as: *"How to turn consistent analysis into a funded account."*
Content: what prop firms look for, how ChartSense methodology aligns, comparison table.
Each firm links via affiliate. This page also targets SEO: "how to get funded trading."

**Target affiliate programs:**

| Firm | Niche | Split | Notes |
|------|-------|-------|-------|
| Apex Trader Funding | Futures | 90% | Most beginner-friendly |
| TopstepTrader | Futures | 90% | Legacy brand, trusted |
| Earn2Trade | Futures | 80% | Strong educational angle |
| FTMO | Forex/CFDs | 80–90% | Premium brand, global |
| The Funded Trader | Multi-asset | 80% | Flexible rules |

Commission: typically $50–$200 per funded account activation.

### Secondary (v2): Paid Tier

$8–12/month via Stripe — unlimited analyses + history (Supabase storage).
Upgrade CTA replaces affiliate CTA when user is authenticated. Build after affiliate revenue validates demand.

---

## Growth Roadmap

### Days 1–30 — Foundation

- [ ] Add `GetFunded.tsx` page + route + footer link
- [ ] Add `FundedCTA` component to `AnalysisResult.tsx` (post-analysis)
- [ ] Add `FundedCTA` to `RateLimitBanner.tsx` when `isLimited`
- [ ] Sign up for Apex, TopstepTrader, FTMO affiliate programs
- [ ] Add "Get Funded" link to Navbar and Landing footer
- [ ] Post 3x/week short-form video: live chart walkthrough with ChartSense output
- [ ] Write 2 SEO blog posts (or `/learn` page sections): methodology + prop firm prep

### Days 31–60 — Distribution

- [ ] Begin Reddit engagement in `r/Daytrading`, `r/Futures`, `r/Forex` (no spam — participate first)
- [ ] Add `/learn/prop-firm-prep` SEO page or expand Guide with "From Analysis to Funded" section
- [ ] Reach out to 5 small trading YouTube channels for mentions
- [ ] Review affiliate click data; double down on highest-converting firm

### Days 61–90 — Community

- [ ] Launch free Discord: ChartSense Community — weekly "rate my setup" sessions
- [ ] Product Hunt submission (schedule Tuesday–Thursday)
- [ ] Evaluate paid tier demand from user feedback
- [ ] Begin Stripe integration if demand exists

### Content Angles (video/social)

- "I analyzed 30 trades with this tool — here's what I found"
- "5 indicators. No noise. Here's how I analyze every chart"
- "Before I take any trade, I run it through this checklist"
- "I got funded at [firm] using this exact process"
- "Why most beginners lose: they use 12 indicators"

### SEO Targets

| Keyword | Intent |
|---------|--------|
| how to analyze a trading chart for beginners | Top of funnel |
| prop firm trading rules checklist | Direct crossover |
| how to pass FTMO challenge | High-intent affiliate |
| 5 indicator trading system | Branded concept |
| bollinger bands MACD RSI strategy | Tool-specific |
| less is more trading strategy | Owned concept |

---

## Rules — Always Follow

- Never expose `ANTHROPIC_API_KEY` as a `VITE_*` variable
- Never hardcode colors — always use CSS variables
- Never use Arial, Inter, or Roboto — DM Sans and Space Mono only
- Never add indicators beyond the five in the methodology
- Always use `cn()` from `src/lib/utils` for className merging
- Always TypeScript — no `.js` or `.jsx` files in `src/`
- Mobile-first — max-width 680px centered, large tap targets
- Use shadcn/ui components from `src/components/ui/` — do not install new UI libraries
- Keep components small — split files that exceed ~150 lines
- Prop firm CTAs must feel educational, never promotional — no banner ads, no pushy copy

## Rules — Never Do

- Do not add Stochastic, CCI, Fibonacci, Ichimoku, or any non-five indicator
- Do not add social features, live price feeds, or broker integrations in v1
- Do not position ChartSense as a signal service or imply trade recommendations
- Do not use purple gradients on white — generic AI aesthetic
- Do not make prop firm affiliate links feel like ads — they must read as natural next steps

---

## Environment Variables

```bash
# Server-side only (never VITE_*)
ANTHROPIC_API_KEY=

# Client-side (Supabase)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## First Thing After Cloning

```bash
npm install
cp .env.example .env.local
# Fill in ANTHROPIC_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm run dev   # starts Vite + Express concurrently
```

## Current Build Status

```
src/lib/utils.ts              ✅
src/lib/constants.ts          ✅ (includes full SYSTEM_PROMPT)
src/lib/supabase.ts           ✅
src/index.css                 ✅
src/hooks/useRateLimit.ts     ✅
src/contexts/AuthContext.tsx   ✅
src/components/ui/*           ✅ (button, badge, card, textarea, progress, separator)
src/components/UploadZone.tsx  ✅
src/components/AnalysisResult.tsx ✅
src/components/RateLimitBanner.tsx ✅
src/components/Navbar.tsx      ✅
src/components/AuthPanel.tsx   ✅
src/components/AppLogo.tsx     ✅
src/pages/Analyzer.tsx         ✅
src/pages/Landing.tsx          ✅
src/pages/Guide.tsx            ✅
src/pages/About.tsx            ✅
src/pages/Privacy.tsx          ✅
src/pages/Terms.tsx            ✅
src/pages/LegalShell.tsx       ✅
src/App.tsx                    ✅
src/main.tsx                   ✅
server/index.ts                ✅
server/anthropic.ts            ✅
server/auth.ts                 ✅
api/analyze.ts                 ✅
vite.config.ts                 ✅
vercel.json                    ✅
public/manifest.json           ✅

src/components/FundedCTA.tsx   ❌ TODO
src/pages/GetFunded.tsx        ❌ TODO
```

## Next Features to Build (in priority order)

1. `FundedCTA.tsx` — reusable subtle prop firm card component
2. `GetFunded.tsx` — `/get-funded` page with firm comparison table + affiliate links
3. Wire `FundedCTA` into `AnalysisResult.tsx` (post-analysis) and `RateLimitBanner.tsx` (when limited)
4. Add `/get-funded` route in `App.tsx` and footer links in `Landing.tsx`
5. Add "Get Funded" to Navbar (low-prominence — text link, not button)
6. `/learn` section or Guide expansion: "From Analysis to Funded Trading"
7. Supabase usage tracking (move rate limiting server-side for paid tier prep)
8. Stripe integration for paid tier ($8–12/month, unlimited analyses + history)
