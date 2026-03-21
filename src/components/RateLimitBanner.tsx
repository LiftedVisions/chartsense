import { FREE_LIMIT } from "@/lib/constants"

interface RateLimitBannerProps {
  remaining: number
  isLimited: boolean
  onUpgradeClick: () => void
}

export default function RateLimitBanner({ remaining, isLimited, onUpgradeClick }: RateLimitBannerProps) {
  if (isLimited) {
    return (
      <div
        className="animate-fade-in"
        style={{
          background: "var(--color-panel)",
          border: "1px solid var(--color-gold)",
          borderRadius: 10,
          padding: "16px",
          marginBottom: 14,
        }}
      >
        <div style={{ fontWeight: 700, color: "var(--color-gold)", marginBottom: 6, fontSize: 14 }}>
          Daily limit reached
        </div>
        <div style={{ color: "var(--color-muted)", fontSize: 13, marginBottom: 14 }}>
          You've used your {FREE_LIMIT} free analyses for today. Upgrade to Pro for unlimited access.
        </div>
        <button
          onClick={onUpgradeClick}
          style={{
            width: "100%",
            padding: "12px",
            background: "linear-gradient(135deg, var(--color-accent), #3a7bd5)",
            border: "none",
            borderRadius: 8,
            color: "white",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          Upgrade to Pro — $8/month
        </button>
        <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: "var(--color-muted)" }}>
          Limit resets at midnight
        </div>
      </div>
    )
  }

  if (remaining === FREE_LIMIT) return null // Full count — don't show until they've used one

  const pct = (remaining / FREE_LIMIT) * 100

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 11,
        color: "var(--color-muted)",
        marginBottom: 4,
      }}>
        <span>{remaining} of {FREE_LIMIT} free analyses remaining today</span>
        <span>Resets at midnight</span>
      </div>
      <div style={{
        width: "100%",
        height: 3,
        background: "var(--color-divider)",
        borderRadius: 2,
        overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`,
          height: "100%",
          background: remaining === 1
            ? "var(--color-red)"
            : "var(--color-accent)",
          borderRadius: 2,
          transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  )
}
