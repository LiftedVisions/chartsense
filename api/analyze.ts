import type { VercelRequest, VercelResponse } from "@vercel/node"
import { getUserIdFromAuthHeader } from "../server/auth"
import { analyzeChartImage } from "../server/anthropic"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  try {
    const userId = await getUserIdFromAuthHeader(req.headers.authorization)
    if (!userId) {
      res.status(401).json({ error: "Sign in required" })
      return
    }

    const body =
      typeof req.body === "string" ? (JSON.parse(req.body) as unknown) : req.body

    const { imageBase64, mediaType, notes } = body as {
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

    res.status(200).json({ text })
  } catch (e) {
    console.error("[api/analyze]", e)
    res.status(500).json({
      error: e instanceof Error ? e.message : "Analysis failed",
    })
  }
}
