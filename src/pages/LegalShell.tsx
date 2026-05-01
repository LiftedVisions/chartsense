import type { CSSProperties, ReactNode } from "react"
import { Link } from "react-router-dom"

const shell: CSSProperties = {
  maxWidth: 680,
  margin: "0 auto",
  padding: "24px 16px 48px",
  color: "var(--color-white)",
  fontFamily: "var(--font-body)",
}

export function LegalShell({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div style={shell}>
      <p style={{ margin: "0 0 20px" }}>
        <Link
          to="/"
          style={{ color: "var(--color-muted)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
        >
          ← Back to home
        </Link>
      </p>
      <h1
        style={{
          margin: "0 0 20px",
          fontSize: "clamp(1.35rem, 4vw, 1.75rem)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>
      <div
        style={{
          fontSize: 15,
          lineHeight: 1.65,
          color: "var(--color-muted)",
        }}
      >
        {children}
      </div>
    </div>
  )
}
