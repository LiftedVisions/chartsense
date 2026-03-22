import type { CSSProperties } from "react"
import { Link, NavLink } from "react-router-dom"

const linkBase: CSSProperties = {
  color: "var(--color-muted)",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 600,
  padding: "8px 12px",
  borderRadius: 8,
  whiteSpace: "nowrap",
}

export default function Navbar() {
  return (
    <header
      style={{
        background: "var(--color-panel)",
        borderBottom: "1px solid var(--color-divider)",
        padding: "10px 16px",
      }}
    >
      <nav
        style={{
          maxWidth: 680,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          rowGap: 10,
        }}
      >
        <Link
          to="/"
          style={{
            color: "var(--color-white)",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: "-0.02em",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span aria-hidden>📈</span>
          <span>ChartSense</span>
        </Link>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 8,
            justifyContent: "flex-end",
            flex: "1 1 auto",
            minWidth: 0,
          }}
        >
          <NavLink
            to="/guide"
            style={({ isActive }) => ({
              ...linkBase,
              color: isActive ? "var(--color-white)" : "var(--color-muted)",
              background: isActive ? "var(--color-card)" : "transparent",
            })}
          >
            Guide
          </NavLink>
          <Link
            to="/analyze"
            style={{
              ...linkBase,
              background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-deep))",
              color: "#fff",
              border: "none",
              boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            Analyze
          </Link>
        </div>
      </nav>
    </header>
  )
}
