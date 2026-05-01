import { FREE_LIMIT } from "@/lib/constants"

interface RateLimitBannerProps {
  remaining: number
  isLimited: boolean
}

export default function RateLimitBanner({ remaining, isLimited }: RateLimitBannerProps) {
  if (isLimited) {
    return (
      <div
        className="animate-fade-in"
        style={{
          background: "var(--color-panel)",
          border: "1px solid var(--color-divider)",
          borderRadius: 10,
          padding: "16px",
          marginBottom: 14,
        }}
      >
        <div style={{ fontWeight: 600, color: "var(--color-white)", marginBottom: 8, fontSize: 14 }}>
          Daily limit reached
        </div>
        <div style={{ color: "var(--color-muted)", fontSize: 13, lineHeight: 1.5 }}>
          You&apos;ve used your {FREE_LIMIT} free analyses for today. The limit resets at midnight (local time).
          Thanks for using ChartSense — a paid tier with higher limits is planned for later.
        </div>
      </div>
    )
  }

  if (remaining === FREE_LIMIT) return null

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
