# ChartSense

> AI-powered chart analysis for day traders. Less Is More.

Upload a chart screenshot. Get a structured analysis using 5 proven indicators — Bollinger Bands, MACD, RSI, Volume, and Higher Timeframe Bias. No junk. No overload.

## Stack

- Vite + React + TypeScript
- Tailwind v4 + shadcn/ui
- Anthropic Claude API
- PWA (installable)

## Getting Started

```bash
# Install dependencies
npm install

# Add your Anthropic API key
cp .env.example .env.local
# Edit .env.local and add your key

# Start dev server
npm run dev
```

## Environment Variables

```
VITE_ANTHROPIC_API_KEY=your_key_here
```

Get your API key at [console.anthropic.com](https://console.anthropic.com)

> ⚠️ For production, move the API call to a backend route. Never ship a client-side API key.

## Project Structure

See [CURSOR.md](./CURSOR.md) for full architecture, design system, and build instructions.

## License

Bar Book LLC — All rights reserved.
