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
  padding: "14px 20px",
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

const btnOutline: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "14px 20px",
  borderRadius: 10,
  background: "transparent",
  color: "var(--color-white)",
  fontWeight: 600,
  fontSize: 15,
  textDecoration: "none",
  border: "1px solid var(--color-divider)",
  cursor: "pointer",
  fontFamily: "var(--font-body)",
}

export default function Landing() {
  return (
    <div style={shell}>
      {/* 1. HERO */}
      <Reveal>
        <section style={{ marginBottom: 48 }}>
          <h1
            style={{
              margin: "0 0 16px",
              fontSize: "clamp(1.75rem, 5vw, 2.25rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              color: "var(--color-white)",
            }}
          >
            Stop Guessing. Start Reading.
          </h1>
          <p
            style={{
              margin: "0 0 28px",
              fontSize: 16,
              lineHeight: 1.55,
              color: "var(--color-muted)",
              maxWidth: 560,
            }}
          >
            AI-powered chart analysis using the Less Is More methodology — 5 proven indicators,
            structured results, every time.
          </p>
          <div className="landing-hero-actions" style={{ marginBottom: 20 }}>
            <Link to="/analyze" style={btnAccent}>
              Analyze a Chart →
            </Link>
            <Link to="/guide" style={btnOutline}>
              Learn the Method
            </Link>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "var(--color-muted)",
              letterSpacing: "0.02em",
            }}
          >
            Used by traders who trade less and win more
          </p>
        </section>
      </Reveal>

      {/* 2. THE PROBLEM */}
      <Reveal>
        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              margin: "0 0 20px",
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--color-muted)",
            }}
          >
            The problem
          </h2>
          <div className="landing-problem-grid">
            <ProblemCard
              icon="📊"
              title="Too Many Indicators"
              body="Most traders use 10+ indicators that contradict each other. Analysis paralysis kills accounts."
            />
            <ProblemCard
              icon="🎲"
              title="No Structure"
              body="Without a repeatable process, every trade is a guess. Emotion fills the gap where process should be."
            />
            <ProblemCard
              icon="🔍"
              title="Missing Context"
              body="Trading a 15m signal against a 1H downtrend. The most common and most expensive mistake."
            />
          </div>
        </section>
      </Reveal>

      {/* 3. THE SOLUTION */}
      <Reveal>
        <section style={{ marginBottom: 48 }}>
          <div
            style={{
              borderLeft: "3px solid var(--color-accent)",
              paddingLeft: 14,
              marginBottom: 20,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(1.25rem, 3.5vw, 1.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--color-white)",
              }}
            >
              The Less Is More Methodology
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <IndicatorRow
              dotColor="var(--color-accent)"
              name="Bollinger Bands"
              setting="BB(15,2)"
              desc="Volatility + dynamic S/R"
            />
            <IndicatorRow
              dotColor="var(--color-accent)"
              name="MACD"
              setting="8/21/5"
              desc="Momentum direction + divergence"
            />
            <IndicatorRow
              dotColor="var(--color-purple)"
              name="RSI"
              setting="RSI(9) 60/40"
              desc="Speed of momentum"
            />
            <IndicatorRow
              dotColor="var(--color-green)"
              name="Volume"
              setting="20-period MA"
              desc="Confirms or kills every signal"
            />
            <IndicatorRow
              dotColor="var(--color-gold)"
              name="HTF Bias"
              setting="1H check"
              desc="Filters 80% of losing setups"
            />
          </div>

          <div
            style={{
              marginTop: 20,
              padding: "14px 16px",
              borderRadius: 10,
              background: "var(--color-panel)",
              border: "1px solid var(--color-divider)",
              fontSize: 13,
              color: "var(--color-muted)",
              fontFamily: "var(--font-mono)",
              lineHeight: 1.5,
            }}
          >
            Nothing else. Every other indicator is redundant.
          </div>
        </section>
      </Reveal>

      {/* 4. HOW IT WORKS */}
      <Reveal>
        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              margin: "0 0 8px",
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--color-muted)",
            }}
          >
            How it works
          </h2>
          <p
            style={{
              margin: "0 0 22px",
              fontSize: "clamp(1.15rem, 3vw, 1.35rem)",
              fontWeight: 800,
              color: "var(--color-white)",
            }}
          >
            3 steps
          </p>
          <ol style={{ margin: 0, paddingLeft: 22, color: "var(--color-muted)", fontSize: 15, lineHeight: 1.65 }}>
            <li style={{ marginBottom: 10 }}>
              <span style={{ color: "var(--color-white)", fontWeight: 600 }}>Screenshot your chart</span> — any pair,
              any timeframe
            </li>
            <li style={{ marginBottom: 10 }}>
              <span style={{ color: "var(--color-white)", fontWeight: 600 }}>Drop it into ChartSense</span> with
              optional notes
            </li>
            <li>
              <span style={{ color: "var(--color-white)", fontWeight: 600 }}>Get a structured 7-section analysis</span>{" "}
              in seconds
            </li>
          </ol>
          <div style={{ marginTop: 24 }}>
            <Link to="/analyze" style={btnAccent}>
              Try It Free →
            </Link>
          </div>
        </section>
      </Reveal>

      {/* 5. WHAT YOU GET */}
      <Reveal>
        <section style={{ marginBottom: 48 }}>
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
            What you get
          </h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {[
              "Indicator Readings",
              "Indicator Vote",
              "Current Situation",
              "Entry Assessment",
              "Trade Levels",
              "Pre-Trade Checklist",
              "Bottom Line",
            ].map((label) => (
              <span
                key={label}
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
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
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--color-muted)" }}>
            Every analysis follows the same structure. No vague commentary. No hedging. A direct verdict every time.
          </p>
        </section>
      </Reveal>

      {/* 6. PRICING */}
      <Reveal>
        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              margin: "0 0 20px",
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--color-muted)",
            }}
          >
            Pricing
          </h2>
          <div className="landing-pricing-grid">
            <div
              style={{
                padding: 20,
                borderRadius: 12,
                background: "var(--color-panel)",
                border: "1px solid var(--color-divider)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: "var(--color-white)" }}>
                $0
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  color: "var(--color-muted)",
                  fontSize: 13,
                  lineHeight: 1.7,
                  flex: 1,
                }}
              >
                <li>3 analyses/day</li>
                <li>Full 7-section analysis</li>
                <li>Less Is More methodology</li>
              </ul>
              <Link to="/analyze" style={{ ...btnOutline, width: "100%", boxSizing: "border-box" }}>
                Get Started Free
              </Link>
            </div>

            <div
              style={{
                padding: 20,
                borderRadius: 12,
                background: "var(--color-card)",
                border: "1px solid var(--color-accent)",
                boxShadow: "0 0 0 1px color-mix(in srgb, var(--color-accent) 18%, transparent)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--color-white)",
                }}
              >
                $8<span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-muted)" }}>/month</span>
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  color: "var(--color-muted)",
                  fontSize: 13,
                  lineHeight: 1.7,
                  flex: 1,
                }}
              >
                <li>Unlimited analyses</li>
                <li>Everything in Free</li>
                <li>Analysis history</li>
                <li>Priority support</li>
              </ul>
              <button type="button" style={{ ...btnAccent, width: "100%", boxSizing: "border-box" }}>
                Upgrade to Pro
              </button>
            </div>
          </div>
          <p
            style={{
              margin: "14px 0 0",
              fontSize: 11,
              color: "var(--color-muted)",
              textAlign: "center",
            }}
          >
            No credit card required for free tier
          </p>
        </section>
      </Reveal>

      {/* 7. FOOTER */}
      <Reveal>
        <footer
          style={{
            paddingTop: 24,
            borderTop: "1px solid var(--color-divider)",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "var(--color-white)" }}>
            ChartSense — Less Is More Trading
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <Link
              to="/analyze"
              style={{ color: "var(--color-accent)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
            >
              Analyze
            </Link>
            <Link
              to="/guide"
              style={{ color: "var(--color-accent)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
            >
              Guide
            </Link>
          </div>
          <p style={{ margin: "0 0 8px", fontSize: 11, color: "var(--color-muted)", lineHeight: 1.5 }}>
            For educational purposes only · Not financial advice · Bar Book LLC
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "var(--color-muted)" }}>© 2026 ChartSense</p>
        </footer>
      </Reveal>

    </div>
  )
}

function ProblemCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 10,
        background: "var(--color-panel)",
        border: "1px solid var(--color-divider)",
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 8 }} aria-hidden>
        {icon}
      </div>
      <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "var(--color-white)" }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.55, color: "var(--color-muted)" }}>{body}</p>
    </div>
  )
}

function IndicatorRow({
  dotColor,
  name,
  setting,
  desc,
}: {
  dotColor: string
  name: string
  setting: string
  desc: string
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "12px 14px",
        borderRadius: 10,
        background: "var(--color-panel)",
        border: "1px solid var(--color-divider)",
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: dotColor,
          marginTop: 5,
          flexShrink: 0,
          border: "1px solid color-mix(in srgb, var(--color-white) 22%, transparent)",
        }}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--color-white)" }}>{name}</span>
          <span
            className="mono"
            style={{
              fontSize: 12,
              color: "var(--color-accent)",
            }}
          >
            {setting}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-muted)", lineHeight: 1.45 }}>{desc}</p>
      </div>
    </div>
  )
}
