interface Section {
  title: string
  color: string
  lines: string[]
}

function getSectionColor(title: string): string {
  if (title.includes("INDICATOR READINGS")) return "#4f8ef7"
  if (title.includes("INDICATOR VOTE"))     return "var(--color-gold)"
  if (title.includes("CURRENT SITUATION"))  return "#00bcd4"
  if (title.includes("ENTRY ASSESSMENT"))   return "#f7a34f"
  if (title.includes("TRADE LEVELS"))       return "#26a69a"
  if (title.includes("PRE-TRADE"))          return "#8bc34a"
  if (title.includes("BOTTOM LINE"))        return "var(--color-gold)"
  return "#4f8ef7"
}

function parseSections(text: string): Section[] {
  const sections: Section[] = []
  let current: Section | null = null
  for (const line of text.split("\n")) {
    const t = line.trim()
    if (t.startsWith("## ")) {
      if (current) sections.push(current)
      const title = t.replace("## ", "")
      current = { title, color: getSectionColor(title), lines: [] }
    } else if (current && t && t !== "---") {
      current.lines.push(t)
    }
  }
  if (current) sections.push(current)
  return sections
}

function LineItem({ text }: { text: string }) {
  let color = "#e8eaf0"
  let fontWeight: "normal" | "bold" = "normal"
  const indent = text.startsWith("- ") || text.startsWith("* ") || text.startsWith("•")

  if (text.includes("BULLISH") && !text.includes("NOT BULLISH")) { color = "#26a69a"; fontWeight = "bold" }
  else if (text.includes("BEARISH"))                              { color = "#ef5350"; fontWeight = "bold" }
  else if (text.includes("NO TRADE") || text.includes("MIXED"))  { color = "var(--color-gold-soft)"; fontWeight = "bold" }
  else if (text.includes("CONFIRMS") && !text.includes("NOT"))   { color = "#26a69a" }
  else if (text.includes("DOES NOT CONFIRM"))                     { color = "#ef5350" }
  else if (text.includes("[x]") || text.includes("[X]"))          { color = "#26a69a" }
  else if (text.includes("[ ]"))                                  { color = "#ef5350" }

  // Bold label pattern: **Label:** rest
  const boldMatch = text.match(/^\*\*(.*?)\*\*(.*)/)
  if (boldMatch) {
    return (
      <div style={{ marginBottom: 4, paddingLeft: indent ? 12 : 0, fontSize: 13, lineHeight: 1.6 }}>
        <span style={{ color: "#f7a34f", fontWeight: "bold" }}>{boldMatch[1]}</span>
        <span style={{ color: "#e8eaf0" }}>{boldMatch[2]}</span>
      </div>
    )
  }

  const clean = text.replace(/\*\*/g, "").replace(/^[-*•] /, "• ")
  return (
    <div style={{
      marginBottom: 4,
      paddingLeft: indent ? 12 : 0,
      color, fontWeight,
      fontSize: 13,
      lineHeight: 1.6,
    }}>
      {clean}
    </div>
  )
}

interface AnalysisResultProps {
  text: string
}

export default function AnalysisResult({ text }: AnalysisResultProps) {
  const sections = parseSections(text)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p
        style={{
          margin: 0,
          fontSize: 12,
          lineHeight: 1.5,
          color: "var(--color-muted)",
          padding: "10px 12px",
          borderRadius: 8,
          background: "var(--color-card)",
          border: "1px solid var(--color-divider)",
        }}
      >
        AI-generated — verify levels and bias on your chart before acting. Not financial advice.
      </p>
      {sections.map((sec, i) => (
        <div
          key={i}
          className="animate-fade-up"
          style={{
            background: "var(--color-panel)",
            borderRadius: 10,
            border: "1px solid var(--color-divider)",
            overflow: "hidden",
            animationDelay: `${i * 60}ms`,
            opacity: 0,
          }}
        >
          <div style={{
            background: "var(--color-card)",
            borderLeft: `4px solid ${sec.color}`,
            padding: "9px 14px",
            fontWeight: 700,
            fontSize: 13,
            color: sec.color,
            fontFamily: "var(--font-body)",
          }}>
            {sec.title}
          </div>
          <div style={{ padding: "12px 14px" }}>
            {sec.lines.map((line, j) => (
              <LineItem key={j} text={line} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
