import { useState, type CSSProperties } from "react"
import { useAuth } from "@/contexts/AuthContext"

export default function AuthPanel() {
  const { user, loading, signIn, signUp, signOut } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const panelStyle: CSSProperties = {
    background: "var(--color-panel)",
    border: "1px solid var(--color-divider)",
    borderRadius: 10,
    padding: "12px 14px",
    marginBottom: 20,
  }

  const inputStyle: CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    background: "var(--color-card)",
    border: "1px solid var(--color-divider)",
    borderRadius: 8,
    color: "var(--color-white)",
    padding: "8px 10px",
    fontSize: 13,
    marginBottom: 8,
    outline: "none",
    fontFamily: "var(--font-body)",
  }

  const btnStyle = (primary: boolean): CSSProperties => ({
    padding: "8px 14px",
    borderRadius: 8,
    border: primary ? "none" : "1px solid var(--color-divider)",
    background: primary
      ? "var(--color-accent)"
      : "transparent",
    color: primary ? "white" : "var(--color-muted)",
    fontSize: 13,
    fontWeight: 600,
    cursor: busy ? "not-allowed" : "pointer",
    fontFamily: "var(--font-body)",
    opacity: busy ? 0.6 : 1,
  })

  if (loading) {
    return (
      <div style={{ ...panelStyle, color: "var(--color-muted)", fontSize: 13 }}>
        Loading session…
      </div>
    )
  }

  if (user) {
    return (
      <div style={panelStyle}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "var(--color-muted)", fontSize: 12 }}>Signed in</span>
          <span style={{ color: "var(--color-white)", fontSize: 13, fontFamily: "var(--font-mono)" }}>
            {user.email ?? user.id.slice(0, 8) + "…"}
          </span>
          <button type="button" style={btnStyle(false)} disabled={busy} onClick={async () => {
            setBusy(true)
            await signOut()
            setBusy(false)
          }}>
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={panelStyle}>
      <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 10 }}>
        Sign in with Supabase (email + password) to run chart analysis on the server.
      </div>
      <input
        type="email"
        autoComplete="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={inputStyle}
      />
      <input
        type="password"
        autoComplete="current-password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={inputStyle}
      />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
        <button
          type="button"
          style={btnStyle(true)}
          disabled={busy || !email || !password}
          onClick={async () => {
            setBusy(true)
            setMsg(null)
            const { error } = await signIn(email, password)
            setMsg(error ? error.message : null)
            setBusy(false)
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          style={btnStyle(false)}
          disabled={busy || !email || !password}
          onClick={async () => {
            setBusy(true)
            setMsg(null)
            const { error } = await signUp(email, password)
            setMsg(
              error
                ? error.message
                : "Check your email to confirm your account, then sign in."
            )
            setBusy(false)
          }}
        >
          Create account
        </button>
      </div>
      {msg && (
        <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--color-accent2)" }}>
          {msg}
        </p>
      )}
    </div>
  )
}
