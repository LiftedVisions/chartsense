import type { CSSProperties, ReactNode } from "react"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"

const shell: CSSProperties = {
  maxWidth: 680,
  margin: "0 auto",
  padding: "24px 16px 48px",
  color: "var(--color-white)",
  fontFamily: "var(--font-body)",
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

const tableBase: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontSize: 12,
  marginTop: 12,
}

const thTd: CSSProperties = {
  padding: "8px 10px",
  textAlign: "left" as const,
  borderBottom: "1px solid var(--color-divider)",
  verticalAlign: "top" as const,
}

export default function Guide() {
  return (
    <div style={shell}>
      {/* 1. HERO */}
      <Reveal>
        <section style={{ marginBottom: 40 }}>
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
              fontSize: "clamp(1.85rem, 5vw, 2.35rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Less Is More
          </h1>
          <p style={{ margin: "0 0 20px", fontSize: 16, lineHeight: 1.55, color: "var(--color-muted)" }}>
            Five indicators. One process. No junk.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["BB", "MACD", "RSI", "Volume", "HTF Bias"].map((label) => (
              <span
                key={label}
                style={{
                  padding: "5px 12px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--color-accent)",
                  background: "var(--color-card)",
                  border: "1px solid var(--color-divider)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </section>
      </Reveal>

      {/* 2. PHILOSOPHY */}
      <Reveal>
        <section style={{ marginBottom: 40 }}>
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
        <section style={{ marginBottom: 28 }}>
          <h2
            style={{
              margin: "0 0 18px",
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--color-muted)",
            }}
          >
            The five indicators
          </h2>

          <IndicatorCard borderColor="var(--color-accent)" title="Bollinger Bands">
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

          <IndicatorCard borderColor="var(--color-accent)" title="MACD">
            <p className="mono" style={{ margin: "0 0 14px", fontSize: 12, color: "var(--color-accent)", lineHeight: 1.5 }}>
              Setting: 8 / 21 / 5 · Type: Momentum + Trend Direction
            </p>
            <SignalTable
              rows={[
                ["Bullish crossover", "Momentum turning up — watch for entry"],
                ["Bearish crossover", "Momentum turning down — watch for exit"],
                ["Histogram growing", "Momentum accelerating — trade is working"],
                ["Histogram shrinking", "Momentum fading — tighten stop"],
                ["Divergence", "Highest probability reversal signal"],
              ]}
            />
            <p style={{ margin: "14px 0 0", fontSize: 12, lineHeight: 1.55, color: "var(--color-muted)", fontStyle: "italic" }}>
              Standard 12/26/9 was designed for daily charts. On intraday it lags. Always use 8/21/5 for day trading.
            </p>
          </IndicatorCard>

          <IndicatorCard borderColor="var(--color-rsi-purple)" title="RSI">
            <p className="mono" style={{ margin: "0 0 14px", fontSize: 12, color: "var(--color-rsi-purple)", lineHeight: 1.5 }}>
              Setting: RSI(9) · Levels: 60 overbought / 40 oversold
            </p>
            <SignalTable
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

          <IndicatorCard borderColor="var(--color-green)" title="Volume">
            <p className="mono" style={{ margin: "0 0 12px", fontSize: 12, color: "var(--color-green)", lineHeight: 1.5 }}>
              Setting: 20-period MA · Type: Participation Confirmation
            </p>
            <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.6, color: "var(--color-muted)" }}>
              <strong style={{ color: "var(--color-white)" }}>Why it&apos;s different:</strong> Every other indicator is
              derived from price. Volume is independent. It tells you if real money is behind the move.
            </p>
            <SignalTable
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

          <IndicatorCard borderColor="var(--color-gold)" title="Higher Timeframe Bias">
            <p className="mono" style={{ margin: "0 0 12px", fontSize: 12, color: "var(--color-gold)", lineHeight: 1.5 }}>
              Setting: Check 1H before trading 15m · Type: Trend Context Filter
            </p>
            <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.6, color: "var(--color-muted)" }}>
              <strong style={{ color: "var(--color-white)" }}>The concept:</strong> Every signal on your trading chart
              exists inside a larger trend. A perfect-looking 15m long setup inside a 1H downtrend has a fraction of the
              probability.
            </p>
            <table style={tableBase}>
              <thead>
                <tr>
                  <th style={{ ...thTd, color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    Your TF
                  </th>
                  <th style={{ ...thTd, color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    Check this HTF
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["5m", "15m–1H"],
                  ["15m", "1H"],
                  ["1H", "4H"],
                  ["4H", "Daily"],
                ].map(([a, b]) => (
                  <tr key={a}>
                    <td style={{ ...thTd, color: "var(--color-white)" }}>{a}</td>
                    <td style={{ ...thTd, color: "var(--color-muted)" }}>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ margin: "14px 0 0", fontSize: 13, lineHeight: 1.55, color: "var(--color-muted)" }}>
              <strong style={{ color: "var(--color-gold)" }}>Rule:</strong> If 2 of 3 indicators on the HTF say bearish
              — only take short signals on your trading timeframe. Ignore all long signals.
            </p>
          </IndicatorCard>
        </section>
      </Reveal>

      {/* 4. PRE-TRADE PROCESS */}
      <Reveal>
        <section style={{ marginBottom: 40 }}>
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
          <ol style={{ margin: 0, paddingLeft: 22, color: "var(--color-muted)", fontSize: 14, lineHeight: 1.75 }}>
            <li style={{ marginBottom: 8 }}>
              <span style={{ color: "var(--color-white)", fontWeight: 600 }}>Check the higher timeframe bias</span> (10
              seconds)
            </li>
            <li style={{ marginBottom: 8 }}>
              <span style={{ color: "var(--color-white)", fontWeight: 600 }}>Identify key support/resistance levels</span>
            </li>
            <li style={{ marginBottom: 8 }}>
              <span style={{ color: "var(--color-white)", fontWeight: 600 }}>Note the BB state</span> — trending or
              squeezing?
            </li>
            <li style={{ marginBottom: 8 }}>
              <span style={{ color: "var(--color-white)", fontWeight: 600 }}>Check for major news</span> in the next 15
              minutes
            </li>
            <li style={{ marginBottom: 8 }}>
              <span style={{ color: "var(--color-white)", fontWeight: 600 }}>Wait for a signal candle to CLOSE</span> —
              never trade mid-candle
            </li>
            <li>
              <span style={{ color: "var(--color-white)", fontWeight: 600 }}>Run the vote</span> — need 2 of 5
              indicators to agree minimum
            </li>
          </ol>
          <div
            style={{
              marginTop: 20,
              padding: "14px 16px",
              borderRadius: 10,
              background: "var(--color-panel)",
              border: "1px solid var(--color-gold)",
              fontSize: 13,
              lineHeight: 1.55,
              color: "var(--color-muted)",
            }}
          >
            <span style={{ color: "var(--color-gold)", fontWeight: 700 }}>Execution: </span>
            Set your stop loss BEFORE you enter. Target 1 is always the middle BB band. Take 50% off there. Move stop to
            breakeven. Let the rest run.
          </div>
        </section>
      </Reveal>

      {/* 5. WHAT TO IGNORE */}
      <Reveal>
        <section style={{ marginBottom: 40 }}>
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
          <p style={{ margin: "0 0 16px", fontSize: 14, lineHeight: 1.6, color: "var(--color-muted)" }}>
            The most valuable skill is knowing what to remove.
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
                  padding: "12px 14px",
                  borderRadius: 8,
                  background: "var(--color-card)",
                  border: "1px solid var(--color-divider)",
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
  borderColor,
  title,
  children,
}: {
  borderColor: string
  title: string
  children: ReactNode
}) {
  return (
    <article
      style={{
        marginBottom: 16,
        padding: "16px 16px 18px",
        borderRadius: 10,
        background: "var(--color-panel)",
        border: "1px solid var(--color-divider)",
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      <h3
        style={{
          margin: "0 0 12px",
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: "0.1em",
          color: "var(--color-white)",
          textTransform: "uppercase",
        }}
      >
        {title}
      </h3>
      {children}
    </article>
  )
}

function SignalTable({ rows }: { rows: [string, string][] }) {
  return (
    <table style={tableBase}>
      <thead>
        <tr>
          <th style={{ ...thTd, color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: 11, width: "42%" }}>
            Signal
          </th>
          <th style={{ ...thTd, color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: 11 }}>Meaning</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([sig, mean]) => (
          <tr key={sig}>
            <td style={{ ...thTd, color: "var(--color-white)", fontWeight: 600 }}>{sig}</td>
            <td style={{ ...thTd, color: "var(--color-muted)" }}>{mean}</td>
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
        background: "color-mix(in srgb, var(--color-accent2) 14%, var(--color-panel))",
        border: "1px solid color-mix(in srgb, var(--color-accent2) 55%, transparent)",
        fontSize: 12,
        lineHeight: 1.5,
        color: "var(--color-muted)",
      }}
    >
      <span style={{ color: "var(--color-accent2)", fontWeight: 700 }}>Warning: </span>
      {children}
    </div>
  )
}

function CalloutGreen({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        marginTop: 14,
        padding: "12px 14px",
        borderRadius: 8,
        background: "color-mix(in srgb, var(--color-green) 12%, var(--color-panel))",
        border: "1px solid color-mix(in srgb, var(--color-green) 45%, transparent)",
        fontSize: 12,
        lineHeight: 1.5,
        color: "var(--color-muted)",
      }}
    >
      <span style={{ color: "var(--color-green)", fontWeight: 700 }}>Rule: </span>
      {children}
    </div>
  )
}
