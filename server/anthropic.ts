import { SYSTEM_PROMPT, MODEL, MAX_TOKENS } from "../src/lib/constants"

export interface AnalyzeChartInput {
  imageBase64: string
  mediaType: string
  notes?: string
}

function getApiKey(): string {
  const key =
    process.env.ANTHROPIC_API_KEY?.trim() ??
    process.env.VITE_ANTHROPIC_API_KEY?.trim()
  if (!key) {
    throw new Error(
      "ANTHROPIC_API_KEY is not configured (set it in .env.local for dev, or in the host env for production)"
    )
  }
  return key
}

export async function analyzeChartImage(input: AnalyzeChartInput): Promise<string> {
  const apiKey = getApiKey()

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: input.mediaType,
                data: input.imageBase64,
              },
            },
            {
              type: "text",
              text: `Analyze this trading chart.${input.notes ? ` Trader notes: ${input.notes}` : ""}`,
            },
          ],
        },
      ],
    }),
  })

  const data = (await res.json()) as {
    error?: { message?: string }
    content?: Array<{ type: string; text?: string }>
  }

  if (!res.ok) {
    throw new Error(data.error?.message ?? `Anthropic API error (${res.status})`)
  }

  return data.content?.map((b) => b.text ?? "").join("\n") ?? ""
}
