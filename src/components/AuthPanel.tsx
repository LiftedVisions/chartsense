import { useState, type CSSProperties } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"

export default function AuthPanel() {
  const { user, loading } = useAuth()
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const panelStyle: CSSProperties = {
    background: "var(--color-panel)",
    border: "1px solid var(--color-divider)",
    borderRadius: 10,
    padding: "14px 16px",
    marginBottom: 20,
    fontFamily: "var(--font-body)",
  }

  const inputStyle: CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    background: "var(--color-card)",
    border: "1px solid var(--color-divider)",
    borderRadius: 8,
    color: "var(--color-white)",
    padding: "10px 12px",
    fontSize: 14,
    marginBottom: 10,
    outline: "none",
    fontFamily: "var(--font-body)",
  }

  const btnPrimary: CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 10,
    border: "none",
    background: "var(--color-accent)",
    color: "var(--color-white)",
    fontSize: 14,
    fontWeight: 700,
    cursor: busy ? "not-allowed" : "pointer",
    fontFamily: "var(--font-body)",
    opacity: busy ? 0.75 : 1,
  }

  if (loading) {
    return (
      <div style={{ ...panelStyle, color: "var(--color-muted)", fontSize: 13 }}>
        Loading session…
      </div>
    )
  }

  if (user) {
    const label = user.email ?? user.id
    return (
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          fontSize: 12,
          color: "var(--color-muted)",
          fontFamily: "var(--font-body)",
        }}
      >
        <span
          title={label}
          style={{
            minWidth: 0,
            flex: "1 1 auto",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "100%",
          }}
        >
          {label}
        </span>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            color: "var(--color-accent)",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            flexShrink: 0,
            textDecoration: "underline",
            textUnderlineOffset: 2,
          }}
        >
          Sign out
        </button>
      </div>
    )
  }

  if (sent) {
    return (
      <div style={panelStyle}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--color-white)" }}>
          ✉️ Check your email — click the link to sign in
        </p>
        <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--color-muted)" }}>
          No password needed. Ever.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false)
            setError(null)
          }}
          style={{
            marginTop: 14,
            background: "none",
            border: "none",
            padding: 0,
            color: "var(--color-accent)",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            textDecoration: "underline",
            textUnderlineOffset: 2,
          }}
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <div style={panelStyle}>
      <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--color-muted)", lineHeight: 1.45 }}>
        Sign in with email — we&apos;ll send you a magic link. No password stored.{" "}
        <Link to="/privacy" style={{ color: "var(--color-accent)", fontWeight: 600, textDecoration: "none" }}>
          Privacy
        </Link>
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const trimmed = email.trim()
          if (!trimmed || busy) return
          setBusy(true)
          setError(null)
          const { error: err } = await supabase.auth.signInWithOtp({
            email: trimmed,
            options: { emailRedirectTo: `${window.location.origin}/analyze` },
          })
          setBusy(false)
          if (err) {
            setError(err.message)
            return
          }
          setSent(true)
        }}
      >
        <input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          disabled={busy}
          required
        />
        {error && (
          <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--color-red)" }}>{error}</p>
        )}
        <button type="submit" style={btnPrimary} disabled={busy || !email.trim()}>
          {busy ? "Sending..." : "Send Magic Link"}
        </button>
      </form>
    </div>
  )
}
