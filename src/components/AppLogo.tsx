/** Minimal wordmark + mark — no emoji; reads as a small product brand. */
export default function AppLogo({ size = 22 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }} aria-hidden>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect x="2" y="2" width="28" height="28" rx="6" fill="var(--color-card)" stroke="var(--color-divider)" strokeWidth="1" />
        <path
          d="M8 22 L12 14 L16 18 L20 10 L24 14"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </span>
  )
}
