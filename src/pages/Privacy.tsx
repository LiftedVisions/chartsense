import { LegalShell } from "@/pages/LegalShell"

export default function Privacy() {
  return (
    <LegalShell title="Privacy">
      <p style={{ marginTop: 0 }}>
        ChartSense is operated with the goal of collecting only what is needed to run the service.
      </p>
      <p>
        <strong style={{ color: "var(--color-white)" }}>Account.</strong> If you sign in, we use your email
        address via our authentication provider (Supabase) to send magic links. We do not store passwords for
        magic-link sign-in.
      </p>
      <p>
        <strong style={{ color: "var(--color-white)" }}>Chart images.</strong> When you run an analysis, your
        chart screenshot is sent to our servers and then to an AI provider to generate text. Treat uploads as
        non-confidential; avoid sharing account or personal information in screenshots or notes.
      </p>
      <p>
        <strong style={{ color: "var(--color-white)" }}>Retention.</strong> We do not guarantee indefinite
        storage of uploads or generated text unless we advertise a specific feature (e.g. history for paid
        plans). This policy may be updated when those features launch.
      </p>
      <p>
        <strong style={{ color: "var(--color-white)" }}>Contact.</strong> For privacy questions, reach out
        through the contact channel listed on the About page (or your hosting provider’s abuse contact if
        applicable).
      </p>
      <p style={{ marginBottom: 0, fontSize: 13 }}>
        Last updated: March 2026. This page is informational and not legal advice.
      </p>
    </LegalShell>
  )
}
