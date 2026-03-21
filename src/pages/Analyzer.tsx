import { useState, useCallback } from "react"
import AuthPanel from "@/components/AuthPanel"
import UploadZone from "@/components/UploadZone"
import AnalysisResult from "@/components/AnalysisResult"
import RateLimitBanner from "@/components/RateLimitBanner"
import { useAuth } from "@/contexts/AuthContext"
import { useRateLimit } from "@/hooks/useRateLimit"

const PILLS = ["BB(15,2)", "MACD(8/21/5)", "RSI(9)", "Volume", "HTF"]

export default function Analyzer() {
  const [image, setImage] = useState<string | null>(null)
  const [b64, setB64]       = useState<string | null>(null)
  const [mediaType, setMediaType] = useState("image/png")
  const [notes, setNotes] = useState("")
  const [loading, setLoading]         = useState(false)
  const [analysisText, setAnalysisText] = useState("")
  const [error, setError]             = useState<string | null>(null)
  const [dragging, setDragging]       = useState(false)

  const { remaining, isLimited, increment } = useRateLimit()
  const { session, loading: authLoading } = useAuth()

  const handleImageLoad = useCallback((base64: string, dataUrl: string) => {
    const mt = dataUrl.match(/^data:([^;]+);/)?.[1] ?? "image/png"
    setMediaType(mt)
    setB64(base64)
    setImage(dataUrl)
    setAnalysisText("")
    setError(null)
  }, [])

  const handleClear = useCallback(() => {
    setImage(null)
    setB64(null)
    setMediaType("image/png")
    setAnalysisText("")
    setError(null)
    setNotes("")
  }, [])

  const analyze = async () => {
    if (!b64 || isLimited) return
    const token = session?.access_token
    if (!token) {
      setError("Sign in to analyze charts.")
      return
    }
    setLoading(true)
    setError(null)
    setAnalysisText("")

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageBase64: b64,
          mediaType,
          notes: notes.trim() ? notes : undefined,
        }),
      })

      const data = (await res.json()) as { error?: string; text?: string }
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`)
      if (!data.text) throw new Error("Empty response from server")
      setAnalysisText(data.text)
      increment()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    handleClear()
    setAnalysisText("")
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-dark)",
      color: "var(--color-white)",
      fontFamily: "var(--font-body)",
      padding: "20px 16px 40px",
      maxWidth: 680,
      margin: "0 auto",
    }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 40, marginBottom: 4 }}>📈</div>
        <h1 style={{
          margin: "0 0 4px",
          fontSize: 22,
          fontWeight: 800,
          color: "var(--color-white)",
          letterSpacing: "-0.02em",
        }}>
          ChartSense
        </h1>
        <p style={{ margin: "0 0 12px", color: "var(--color-muted)", fontSize: 12 }}>
          BB · MACD · RSI · Volume · HTF Bias — structured analysis every time
        </p>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
          {PILLS.map(pill => (
            <span key={pill} style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-divider)",
              borderRadius: 20,
              padding: "2px 10px",
              fontSize: 11,
              color: "var(--color-accent)",
            }}>
              {pill}
            </span>
          ))}
        </div>
      </div>

      <AuthPanel />

      {/* Rate limit banner */}
      <RateLimitBanner
        remaining={remaining}
        isLimited={isLimited}
        onUpgradeClick={() => console.log("upgrade clicked — wire Stripe here")}
      />

      {/* Upload zone */}
      <div style={{ marginBottom: 12 }}>
        <UploadZone
          onImageLoad={handleImageLoad}
          image={image}
          onClear={handleClear}
          dragging={dragging}
          setDragging={setDragging}
        />
      </div>

      {/* Notes + analyze button */}
      {image && !analysisText && (
        <>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Optional: add context — e.g. 'ADA/USDT 15m, looking long' or 'bought at 0.265'"
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "var(--color-panel)",
              border: "1px solid var(--color-divider)",
              borderRadius: 8,
              color: "var(--color-white)",
              padding: "10px 12px",
              fontSize: 13,
              resize: "vertical",
              minHeight: 56,
              marginBottom: 12,
              outline: "none",
              fontFamily: "var(--font-body)",
            }}
          />
          <button
            onClick={analyze}
            disabled={loading || isLimited || !session || authLoading}
            style={{
              width: "100%",
              padding: 14,
              background: loading || isLimited || !session || authLoading
                ? "var(--color-card)"
                : "linear-gradient(135deg, var(--color-accent), #3a7bd5)",
              border: "none",
              borderRadius: 10,
              color: loading || isLimited || !session || authLoading ? "var(--color-muted)" : "white",
              fontSize: 15,
              fontWeight: 700,
              cursor: loading || isLimited || !session || authLoading ? "not-allowed" : "pointer",
              fontFamily: "var(--font-body)",
              transition: "all 0.2s",
            }}
          >
            {loading
              ? "⏳  Analyzing..."
              : !session
                ? "🔒  Sign in to analyze"
                : "🔍  Analyze Chart"}
          </button>
        </>
      )}

      {/* Loading pulse */}
      {loading && (
        <div style={{
          textAlign: "center",
          color: "var(--color-muted)",
          fontSize: 13,
          marginTop: 12,
          padding: "8px 0",
        }}
          className="animate-pulse-subtle"
        >
          Reading indicators...
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: "#2a1a1a",
          border: "1px solid var(--color-red)",
          borderRadius: 8,
          padding: "10px 14px",
          color: "var(--color-red)",
          fontSize: 13,
          marginTop: 12,
        }}>
          {error}
        </div>
      )}

      {/* Analysis output */}
      {analysisText && (
        <div style={{ marginTop: 16 }}>
          <AnalysisResult text={analysisText} />
          <button
            onClick={reset}
            style={{
              width: "100%",
              padding: 12,
              background: "var(--color-card)",
              border: "1px solid var(--color-divider)",
              borderRadius: 10,
              color: "var(--color-muted)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              marginTop: 12,
              fontFamily: "var(--font-body)",
            }}
          >
            📷  Analyze Another Chart
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={{
        textAlign: "center",
        marginTop: 24,
        color: "var(--color-muted)",
        fontSize: 11,
      }}>
        For educational purposes only · Not financial advice · Bar Book LLC
      </div>
    </div>
  )
}
