import type { CSSProperties, ReactNode } from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"

const SECTION_GAP = 64
const CARD_GAP = 24
const CARD_PAD = 24

const shell: CSSProperties = {
  maxWidth: 680,
  margin: "0 auto",
  padding: "24px 16px 48px",
  color: "var(--color-white)",
  fontFamily: "var(--font-body)",
}

const sectionLabelFive: CSSProperties = {
  margin: `0 0 18px`,
  paddingLeft: 12,
  borderLeft: "4px solid var(--color-accent)",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.2em",
  color: "var(--color-muted)",
}

function Reveal({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.unobserve(entry.target)
        }
      },
      { rootMargin: "0px 0px -48px 0px", threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={visible ? "animate-fade-up" : undefined}
      style={
        visible
          ? style
          : {
              opacity: 0,
              transform: "translateY(14px)",
              ...style,
            }
      }
    >
      {children}
    </div>
  )
}

const btnAccent: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "14px 22px",
  borderRadius: 10,
  background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-deep))",
  color: "var(--color-white)",
  fontWeight: 700,
  fontSize: 15,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "var(--font-body)",
  boxShadow: "0 2px 8px color-mix(in srgb, var(--color-accent) 35%, transparent)",
}

const INDICATOR_IDS = ["guide-bb", "guide-macd", "guide-rsi", "guide-vol", "guide-htf"] as const
const INDICATOR_LABELS = ["BB", "MACD", "RSI", "Vol", "HTF"] as const
const INDICATOR_COLORS = [
  "var(--color-accent)",
  "var(--color-accent)",
  "#9c27b0",
  "var(--color-green)",
  "var(--color-gold)",
] as const

export default function Guide() {
  const heroRef = useRef<HTMLElement>(null)
  const [showStickyNav, setShowStickyNav] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)

  const updateScrollState = useCallback(() => {
    const hero = heroRef.current
    if (hero) {
      const heroRect = hero.getBoundingClientRect()
      setShowStickyNav(heroRect.bottom < 0)
    }
    const marker = window.scrollY + window.innerHeight * 0.32
    let idx = 0
    for (let i = 0; i < INDICATOR_IDS.length; i++) {
      const el = document.getElementById(INDICATOR_IDS[i])
      if (!el) continue
      const top = el.getBoundingClientRect().top + window.scrollY
      if (top <= marker) idx = i
    }
    setActiveIdx(idx)
  }, [])

  useEffect(() => {
    updateScrollState()
    window.addEventListener("scroll", updateScrollState, { passive: true })
    window.addEventListener("resize", updateScrollState)
    return () => {
      window.removeEventListener("scroll", updateScrollState)
      window.removeEventListener("resize", updateScrollState)
    }
  }, [updateScrollState])

  const scrollToIndicator = useCallback((i: number) => {
    const id = INDICATOR_IDS[i]
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  return (
    <div style={shell}>
      <nav
        className={`guide-sticky-progress${showStickyNav ? " guide-sticky-progress--visible" : ""}`}
        aria-hidden={!showStickyNav}
      >
        <div className="guide-sticky-progress__track">
          <div className="guide-sticky-progress__line" aria-hidden />
          {INDICATOR_LABELS.map((label, i) => {
            const color = INDICATOR_COLORS[i]
            const active = i === activeIdx
            return (
              <button
                key={label}
                type="button"
                className="guide-sticky-progress__step"
                onClick={() => scrollToIndicator(i)}
                title={`Go to ${label}`}
              >
                <span
                  className="guide-sticky-progress__dot"
                  style={{
                    borderColor: color,
                    background: active ? color : "transparent",
                    boxShadow: active ? `0 0 0 2px color-mix(in srgb, ${color} 35%, transparent)` : undefined,
                  }}
                />
                <span className="guide-sticky-progress__label" style={{ color: active ? "var(--color-white)" : "var(--color-muted)" }}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* 1. HERO */}
      <Reveal>
        <section ref={heroRef} style={{ marginBottom: SECTION_GAP }}>
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "var(--color-accent)",
              textTransform: "uppercase",
            }}
          >
            The methodology
          </p>
          <h1
            style={{
              margin: "0 0 12px",
              fontSize: "clamp(2rem, 8vw, 56px)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
            }}
          >
            Less Is More
          </h1>
          <p style={{ margin: "0 0 20px", fontSize: 16, lineHeight: 1.55, color: "var(--color-muted)" }}>
            Five indicators. One process. No junk.
          </p>
          <div className="guide-hero-tags" role="navigation" aria-label="Jump to indicator sections">
            {(["BB", "MACD", "RSI", "Volume", "HTF Bias"] as const).map((label, i) => (
              <button
                key={label}
                type="button"
                className="guide-hero-tag"
                onClick={() => scrollToIndicator(i)}
                aria-label={`Go to ${label} section`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>
      </Reveal>

      {/* 2. PHILOSOPHY */}
      <Reveal>
        <section style={{ marginBottom: SECTION_GAP }}>
          <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.65, color: "var(--color-muted)" }}>
            Most traders lose not because they lack indicators — but because they have too many. Every indicator added
            beyond these five is redundant data wearing a different costume.
          </p>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: "var(--color-white)", fontWeight: 600 }}>
            This guide covers exactly what you need. Nothing more.
          </p>
        </section>
      </Reveal>

      {/* 3. FIVE INDICATORS */}
      <Reveal>
        <section style={{ marginBottom: SECTION_GAP }}>
          <h2 style={sectionLabelFive}>The five indicators</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: CARD_GAP }}>
            <div id="guide-bb">
              <IndicatorCard accentColor="var(--color-accent)" title="Bollinger Bands">
                <p className="mono" style={{ margin: "0 0 12px", fontSize: 12, color: "var(--color-accent)", lineHeight: 1.5 }}>
                  Setting: BB(15, 2) · Type: Volatility + Support/Resistance
                </p>
                <p style={{ margin: "0 0 6px", fontSize: 13, lineHeight: 1.6, color: "var(--color-muted)" }}>
                  Middle band is a 20-period moving average — your rolling mean and first profit target.
                </p>
                <p style={{ margin: "0 0 6px", fontSize: 13, lineHeight: 1.6, color: "var(--color-muted)" }}>
                  Upper and lower bands expand and contract with volatility — a squeeze warns that a large move is coming.
                </p>
                <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.6, color: "var(--color-muted)" }}>
                  Price position relative to the bands shows whether price is stretched for a snap-back or riding a trend.
                </p>
                <SignalTable
                  dotColor="var(--color-accent)"
                  rows={[
                    ["BB Squeeze", "Volatility about to explode — prepare"],
                    ["Price at lower band", "Potential long — wait for confirmation"],
                    ["Price at upper band", "Potential short — wait for rejection"],
                    ["Band walkdown", "Strong downtrend — do NOT buy"],
                    ["Middle band", "Always your first profit target (TP1)"],
                  ]}
                />
                <CalloutAmber>
                  Never buy just because price touches the lower band. Wait for a candle to close back inside.
                </CalloutAmber>
              </IndicatorCard>
            </div>

            <div id="guide-macd">
              <IndicatorCard accentColor="var(--color-accent)" title="MACD">
                <p className="mono" style={{ margin: "0 0 14px", fontSize: 12, color: "var(--color-accent)", lineHeight: 1.5 }}>
                  Setting: 8 / 21 / 5 · Type: Momentum + Trend Direction
                </p>
                <SignalTable
                  dotColor="var(--color-accent)"
                  rows={[
                    ["Bullish crossover", "Momentum turning up — watch for entry"],
                    ["Bearish crossover", "Momentum turning down — watch for exit"],
                    ["Histogram growing", "Momentum accelerating — trade is working"],
                    ["Histogram shrinking", "Momentum fading — tighten stop"],
                    ["Divergence", "Highest probability reversal signal"],
                  ]}
                />
                <CalloutInfo>
                  Standard 12/26/9 was designed for daily charts. On intraday it lags. Always use 8/21/5 for day trading.
                </CalloutInfo>
              </IndicatorCard>
            </div>

            <div id="guide-rsi">
              <IndicatorCard accentColor="#9c27b0" title="RSI">
                <p className="mono" style={{ margin: "0 0 14px", fontSize: 12, color: "var(--color-rsi-purple)", lineHeight: 1.5 }}>
                  Setting: RSI(9) · Levels: 60 overbought / 40 oversold
                </p>
                <SignalTable
                  dotColor="#9c27b0"
                  rows={[
                    ["Below 40 curling up", "Potential long — confirm with BB + MACD"],
                    ["Above 60 curling down", "Potential short — confirm with BB + MACD"],
                    ["Crosses 50 upward", "Bullish trend confirmation"],
                    ["Crosses 50 downward", "Bearish trend confirmation"],
                    ["Divergence", "Strong reversal signal — combine with MACD div"],
                  ]}
                />
                <CalloutAmber>
                  RSI can stay above 60 for a long time in a strong trend. Overbought does not mean sell.
                </CalloutAmber>
              </IndicatorCard>
            </div>

            <div id="guide-vol">
              <IndicatorCard accentColor="var(--color-green)" title="Volume">
                <p className="mono" style={{ margin: "0 0 12px", fontSize: 12, color: "var(--color-green)", lineHeight: 1.5 }}>
                  Setting: 20-period MA · Type: Participation Confirmation
                </p>
                <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.6, color: "var(--color-muted)" }}>
                  <strong style={{ color: "var(--color-white)" }}>Why it&apos;s different:</strong> Every other indicator is
                  derived from price. Volume is independent. It tells you if real money is behind the move.
                </p>
                <SignalTable
                  dotColor="var(--color-green)"
                  rows={[
                    ["Above average on signal candle", "Signal is valid — real conviction"],
                    ["Below average on signal candle", "Signal is suspect — reduce size"],
                    ["High volume at BB band touch", "Strong reversal — good entry"],
                    ["Declining volume on rally", "Weak move — tighten stop"],
                  ]}
                />
                <CalloutGreen>
                  Before any entry — is volume confirming? If not, cut size in half or skip entirely.
                </CalloutGreen>
              </IndicatorCard>
            </div>

            <div id="guide-htf">
              <IndicatorCard accentColor="var(--color-gold)" title="Higher Timeframe Bias">
                <p className="mono" style={{ margin: "0 0 12px", fontSize: 12, color: "var(--color-gold)", lineHeight: 1.5 }}>
                  Setting: Check 1H before trading 15m · Type: Trend Context Filter
                </p>
                <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.6, color: "var(--color-muted)" }}>
                  <strong style={{ color: "var(--color-white)" }}>The concept:</strong> Every signal on your trading chart
                  exists inside a larger trend. A perfect-looking 15m long setup inside a 1H downtrend has a fraction of the
                  probability.
                </p>
                <HtfTable dotColor="var(--color-gold)" />
                <p style={{ margin: "14px 0 0", fontSize: 13, lineHeight: 1.55, color: "var(--color-muted)" }}>
                  <strong style={{ color: "var(--color-gold)" }}>Rule:</strong> If 2 of 3 indicators on the HTF say bearish
                  — only take short signals on your trading timeframe. Ignore all long signals.
                </p>
              </IndicatorCard>
            </div>
          </div>
        </section>
      </Reveal>

      {/* 4. PRE-TRADE PROCESS */}
      <Reveal>
        <section style={{ marginBottom: SECTION_GAP }}>
          <h2
            style={{
              margin: "0 0 16px",
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--color-muted)",
            }}
          >
            The pre-trade process
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              <>
                <span style={{ color: "var(--color-white)", fontWeight: 600 }}>Check the higher timeframe bias</span> (10
                seconds)
              </>,
              <>
                <span style={{ color: "var(--color-white)", fontWeight: 600 }}>Identify key support/resistance levels</span>
              </>,
              <>
                <span style={{ color: "var(--color-white)", fontWeight: 600 }}>Note the BB state</span> — trending or
                squeezing?
              </>,
              <>
                <span style={{ color: "var(--color-white)", fontWeight: 600 }}>Check for major news</span> in the next 15
                minutes
              </>,
              <>
                <span style={{ color: "var(--color-white)", fontWeight: 600 }}>Wait for a signal candle to CLOSE</span> —
                never trade mid-candle
              </>,
              <>
                <span style={{ color: "var(--color-white)", fontWeight: 600 }}>Run the vote</span> — need 2 of 5
                indicators to agree minimum
              </>,
            ].map((content, i, arr) => (
              <PreTradeStep key={i} step={i + 1} isLast={i === arr.length - 1}>
                {content}
              </PreTradeStep>
            ))}
          </div>
          <CalloutGreen style={{ marginTop: 20 }}>
            <span style={{ color: "var(--color-green)", fontWeight: 700 }}>Execution: </span>
            Set your stop loss BEFORE you enter. Target 1 is always the middle BB band. Take 50% off there. Move stop to
            breakeven. Let the rest run.
          </CalloutGreen>
        </section>
      </Reveal>

      {/* 5. WHAT TO IGNORE */}
      <Reveal>
        <section style={{ marginBottom: SECTION_GAP }}>
          <h2
            style={{
              margin: "0 0 8px",
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--color-red)",
            }}
          >
            What to ignore
          </h2>
          <p style={{ margin: "0 0 16px", fontSize: 14, lineHeight: 1.65, color: "var(--color-muted)" }}>
            The most valuable skill is knowing what to remove. What others try to sell you on is often just static and
            noise — not necessary for this methodology. (These tools can still be helpful to others with different
            systems.)
          </p>
          <div className="guide-ignore-grid" style={{ marginBottom: 16 }}>
            {[
              ["Stochastic", "Redundant with RSI — same vote twice"],
              ["CCI", "Another momentum oscillator — already covered"],
              ["Parabolic SAR", "Lags badly — BB bands do this better"],
              ["Multiple EMAs", "Middle BB is already a moving average"],
              ["Fibonacci", "Subjective — everyone draws different levels"],
              ["Ichimoku", "Powerful but conflicts with this system"],
            ].map(([name, why]) => (
              <div
                key={name}
                style={{
                  padding: "14px 16px",
                  borderRadius: 8,
                  background: "color-mix(in srgb, var(--color-red) 5%, var(--color-card))",
                  border: "1px solid var(--color-divider)",
                  borderLeft: "3px solid var(--color-red)",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--color-white)", marginBottom: 4 }}>{name}</div>
                <div style={{ fontSize: 12, lineHeight: 1.45, color: "var(--color-muted)" }}>{why}</div>
              </div>
            ))}
          </div>
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 10,
              background: "color-mix(in srgb, var(--color-red) 12%, var(--color-panel))",
              border: "1px solid color-mix(in srgb, var(--color-red) 45%, transparent)",
              fontSize: 13,
              lineHeight: 1.55,
              color: "var(--color-muted)",
            }}
          >
            If a new indicator falls into Trend, Momentum, Volatility, or Volume — it&apos;s redundant. All four
            categories are already covered.
          </div>
        </section>
      </Reveal>

      {/* 6. CTA */}
      <Reveal>
        <section style={{ textAlign: "center", paddingTop: 8 }}>
          <h2
            style={{
              margin: "0 0 18px",
              fontSize: "clamp(1.15rem, 3vw, 1.35rem)",
              fontWeight: 800,
              color: "var(--color-white)",
            }}
          >
            Ready to put it into practice?
          </h2>
          <Link to="/analyze" style={btnAccent}>
            Analyze a Chart →
          </Link>
        </section>
      </Reveal>
    </div>
  )
}

function IndicatorCard({
  accentColor,
  title,
  children,
}: {
  accentColor: string
  title: string
  children: ReactNode
}) {
  const headerBg = `color-mix(in srgb, ${accentColor} 8%, transparent)`
  return (
    <article
      style={{
        padding: 0,
        borderRadius: 10,
        background: "var(--color-panel)",
        border: "1px solid var(--color-divider)",
        borderLeft: `4px solid ${accentColor}`,
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "14px 24px", background: headerBg, borderBottom: "1px solid var(--color-divider)" }}>
        <h3
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "0.08em",
            color: "var(--color-white)",
            textTransform: "uppercase",
          }}
        >
          {title}
        </h3>
      </div>
      <div style={{ padding: CARD_PAD }}>{children}</div>
    </article>
  )
}

const signalTableBase: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontSize: 12,
  marginTop: 12,
}

const cellBase: CSSProperties = {
  padding: "10px 12px",
  textAlign: "left" as const,
  verticalAlign: "top" as const,
  borderBottom: "1px solid var(--color-divider)",
}

const thStyle: CSSProperties = {
  ...cellBase,
  background: "var(--color-card)",
  color: "var(--color-muted)",
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontFamily: "var(--font-body)",
  borderBottom: "1px solid var(--color-divider)",
}

function SignalTable({ rows, dotColor }: { rows: [string, string][]; dotColor: string }) {
  return (
    <table style={signalTableBase}>
      <thead>
        <tr>
          <th style={{ ...thStyle, width: "42%" }}>Signal</th>
          <th style={thStyle}>Meaning</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([sig, mean], rowIdx) => (
          <tr
            key={sig}
            style={{
              background: rowIdx % 2 === 0 ? "var(--color-panel)" : "var(--color-dark)",
            }}
          >
            <td style={{ ...cellBase, fontWeight: 600, color: "var(--color-white)" }}>
              <span style={{ display: "inline-flex", alignItems: "flex-start", gap: 10 }}>
                <span
                  aria-hidden
                  style={{
                    flexShrink: 0,
                    width: 8,
                    height: 8,
                    marginTop: 4,
                    borderRadius: "50%",
                    background: dotColor,
                  }}
                />
                {sig}
              </span>
            </td>
            <td style={{ ...cellBase, color: "var(--color-muted)", fontWeight: 400 }}>{mean}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function HtfTable({ dotColor }: { dotColor: string }) {
  const rows: [string, string][] = [
    ["5m", "15m–1H"],
    ["15m", "1H"],
    ["1H", "4H"],
    ["4H", "Daily"],
  ]
  return (
    <table style={signalTableBase}>
      <thead>
        <tr>
          <th style={{ ...thStyle, fontFamily: "var(--font-mono)" }}>Your TF</th>
          <th style={{ ...thStyle, fontFamily: "var(--font-mono)" }}>Check this HTF</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([a, b], rowIdx) => (
          <tr
            key={a}
            style={{
              background: rowIdx % 2 === 0 ? "var(--color-panel)" : "var(--color-dark)",
            }}
          >
            <td style={{ ...cellBase, fontWeight: 600, color: "var(--color-white)" }}>
              <span style={{ display: "inline-flex", alignItems: "flex-start", gap: 10 }}>
                <span
                  aria-hidden
                  style={{
                    flexShrink: 0,
                    width: 8,
                    height: 8,
                    marginTop: 4,
                    borderRadius: "50%",
                    background: dotColor,
                  }}
                />
                {a}
              </span>
            </td>
            <td style={{ ...cellBase, color: "var(--color-muted)" }}>{b}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function CalloutAmber({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        marginTop: 14,
        padding: "12px 14px",
        borderRadius: 8,
        background: "color-mix(in srgb, var(--color-gold) 8%, transparent)",
        borderLeft: "3px solid var(--color-gold)",
        fontSize: 12,
        lineHeight: 1.5,
        color: "var(--color-muted)",
      }}
    >
      <span aria-hidden style={{ marginRight: 8 }}>
        ⚠️
      </span>
      {children}
    </div>
  )
}

function CalloutGreen({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        marginTop: 14,
        padding: "12px 14px",
        borderRadius: 8,
        background: "color-mix(in srgb, var(--color-green) 8%, transparent)",
        borderLeft: "3px solid var(--color-green)",
        fontSize: 12,
        lineHeight: 1.5,
        color: "var(--color-muted)",
        ...style,
      }}
    >
      <span aria-hidden style={{ marginRight: 8 }}>
        ✅
      </span>
      {children}
    </div>
  )
}

function CalloutInfo({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: "14px 0 0",
        padding: "12px 14px",
        borderRadius: 8,
        background: "color-mix(in srgb, var(--color-accent) 8%, transparent)",
        borderLeft: "3px solid var(--color-accent)",
        fontSize: 12,
        lineHeight: 1.55,
        color: "var(--color-muted)",
        fontStyle: "italic",
      }}
    >
      <span aria-hidden style={{ marginRight: 8, fontStyle: "normal" }}>
        💡
      </span>
      {children}
    </p>
  )
}

function PreTradeStep({
  step,
  isLast,
  children,
}: {
  step: number
  isLast: boolean
  children: ReactNode
}) {
  return (
    <div style={{ display: "flex", gap: 16 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
          width: 44,
        }}
      >
        <span
          style={{
            fontSize: 32,
            fontWeight: 900,
            color: "var(--color-accent)",
            lineHeight: 1,
            fontFamily: "var(--font-body)",
          }}
        >
          {step}
        </span>
        {!isLast ? (
          <div
            style={{
              width: 0,
              minHeight: 28,
              marginTop: 8,
              marginBottom: 4,
              borderLeft: "2px dashed var(--color-divider)",
            }}
          />
        ) : null}
      </div>
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 20, fontSize: 14, lineHeight: 1.75, color: "var(--color-muted)" }}>
        {children}
      </div>
    </div>
  )
}
