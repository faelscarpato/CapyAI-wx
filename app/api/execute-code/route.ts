import { generateText } from "ai"
import { google } from "@ai-sdk/google"

process.env.GOOGLE_GENERATIVE_AI_API_KEY = "AIzaSyAKfpmTF2lfCCM1t-TeGshnq6YDJjy1KMk"

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json()

    const result = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: `Analyze this ${language} code and provide a realistic simulation of its execution:

Code:
\`\`\`${language}
${code}
\`\`\`

Respond with a JSON object containing:
- "output": the expected console output or result
- "error": any potential errors (null if none)
- "explanation": brief explanation of what the code does

Format your response as valid JSON only.`,
    })

    let parsedResult
    try {
      parsedResult = JSON.parse(result.text)
    } catch {
      parsedResult = {
        output: result.text,
        error: null,
        explanation: "Code analysis completed",
      }
    }

    return Response.json(parsedResult)
  } catch (error) {
    console.error("Code execution error:", error)
    return Response.json(
      {
        output: "",
        error: "Failed to execute code",
        explanation: "An error occurred during code execution",
      },
      { status: 500 },
    )
  }
}
