import { config } from "dotenv"
import express from "express"
import { getUserIdFromAuthHeader } from "./auth"
import { analyzeChartImage } from "./anthropic"

config({ path: ".env.local" })
config({ path: ".env" })

const app = express()
app.use(express.json({ limit: "25mb" }))

app.post("/api/analyze", async (req, res) => {
  try {
    const userId = await getUserIdFromAuthHeader(req.headers.authorization)
    if (!userId) {
      res.status(401).json({ error: "Sign in required" })
      return
    }

    const { imageBase64, mediaType, notes } = req.body as {
      imageBase64?: unknown
      mediaType?: unknown
      notes?: unknown
    }

    if (!imageBase64 || typeof imageBase64 !== "string") {
      res.status(400).json({ error: "imageBase64 is required" })
      return
    }

    const mt =
      typeof mediaType === "string" && mediaType.length > 0 ? mediaType : "image/png"

    const text = await analyzeChartImage({
      imageBase64,
      mediaType: mt,
      notes: typeof notes === "string" && notes.trim() ? notes : undefined,
    })

    res.json({ text })
  } catch (e) {
    console.error("[api/analyze]", e)
    res.status(500).json({
      error: e instanceof Error ? e.message : "Analysis failed",
    })
  }
})

const port = Number(process.env.PORT ?? 8787)
app.listen(port, () => {
  console.log(`[chartsense] API listening on http://localhost:${port}`)
})
