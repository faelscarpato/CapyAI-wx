import { streamText } from "ai"
import { google } from "@ai-sdk/google"

process.env.GOOGLE_GENERATIVE_AI_API_KEY = "AIzaSyAKfpmTF2lfCCM1t-TeGshnq6YDJjy1KMk"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const result = await streamText({
      model: google("gemini-2.0-flash"),
      messages,
      system:
        "You are a helpful AI assistant similar to Google Gemini. Provide clear, accurate, and helpful responses.",
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
