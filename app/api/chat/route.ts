import { streamText } from "ai"
import { google } from "@ai-sdk/google"

process.env.GOOGLE_GENERATIVE_AI_API_KEY = "AIzaSyAKfpmTF2lfCCM1t-TeGshnq6YDJjy1KMk"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("No messages provided", { status: 400 })
    }

    // Filter out empty messages and ensure proper formatting
    const validMessages = messages.filter(
      (msg) =>
        msg &&
        msg.content &&
        typeof msg.content === "string" &&
        msg.content.trim().length > 0 &&
        msg.role &&
        ["user", "assistant", "system"].includes(msg.role),
    )

    if (validMessages.length === 0) {
      return new Response("No valid messages provided", { status: 400 })
    }

    console.log("[v0] Processing messages:", validMessages.length)

    const result = await streamText({
      model: google("gemini-2.0-flash"),
      messages: validMessages,
      system:
        "You are a helpful AI assistant similar to Google Gemini. When users ask for code, provide complete, functional code examples. For web development, prioritize HTML, CSS, and JavaScript. Always include clear explanations and make code ready to run. Provide clear, accurate, and helpful responses.",
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    if (error.message?.includes("parts field")) {
      return new Response("Invalid message format for AI provider", { status: 400 })
    }
    return new Response("Internal Server Error", { status: 500 })
  }
}
