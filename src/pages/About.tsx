import { LegalShell } from "@/pages/LegalShell"
import { Link } from "react-router-dom"

export default function About() {
  return (
    <LegalShell title="About ChartSense">
      <p style={{ marginTop: 0 }}>
        ChartSense applies the &quot;Less Is More&quot; methodology to chart screenshots: a fixed set of
        indicators and a consistent report structure so you can study setups without indicator overload.
      </p>
      <p>
        It is a <strong style={{ color: "var(--color-white)" }}>study tool</strong>, not a signal service.
        Read the{" "}
        <Link to="/guide" style={{ color: "var(--color-accent)", fontWeight: 600 }}>
          methodology guide
        </Link>{" "}
        to see how the five components are used, then try the{" "}
        <Link to="/analyze" style={{ color: "var(--color-accent)", fontWeight: 600 }}>
          analyzer
        </Link>{" "}
        on your own charts.
      </p>
      <p id="contact" style={{ marginBottom: 0 }}>
        <strong style={{ color: "var(--color-white)" }}>Contact.</strong> For product or privacy inquiries,
        use the support channel you publish for Bar Book LLC (e.g. support email). This placeholder keeps the
        page structure ready for a real address.
      </p>
    </LegalShell>
  )
}
