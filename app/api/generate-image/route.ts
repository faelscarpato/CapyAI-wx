import { GoogleGenerativeAI } from "@google/generative-ai"

process.env.GOOGLE_GENERATIVE_AI_API_KEY = "AIzaSyAKfpmTF2lfCCM1t-TeGshnq6YDJjy1KMk"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: ["Text", "Image"],
      },
    })

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Generate a high-quality image based on this description: ${prompt}. Also provide a detailed description of what you created.`,
            },
          ],
        },
      ],
    })

    const response = result.response

    let imageUrl = `/placeholder.svg?height=512&width=512&query=${encodeURIComponent(prompt)}`
    let description = `Generated image for: ${prompt}`

    if (response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0]

      // Extract text description
      const textPart = candidate.content.parts.find((part) => part.text)
      if (textPart) {
        description = textPart.text
      }

      // Extract image data if available
      const imagePart = candidate.content.parts.find((part) => part.inlineData)
      if (imagePart && imagePart.inlineData) {
        const base64Data = imagePart.inlineData.data
        imageUrl = `data:${imagePart.inlineData.mimeType};base64,${base64Data}`
      }
    }

    return Response.json({
      imageUrl,
      prompt: description,
      originalPrompt: prompt,
    })
  } catch (error) {
    console.error("Image generation error:", error)

    try {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

      const fallbackResult = await fallbackModel.generateContent(
        `Create a detailed, creative description for generating an image based on this prompt: ${prompt}. Include artistic style, colors, composition, and mood.`,
      )

      const enhancedPrompt = fallbackResult.response.text() || `Enhanced prompt for: ${prompt}`
      const imageUrl = `/placeholder.svg?height=512&width=512&query=${encodeURIComponent(prompt)}`

      return Response.json({
        imageUrl,
        prompt: enhancedPrompt,
        originalPrompt: prompt,
      })
    } catch (fallbackError) {
      console.error("Fallback error:", fallbackError)
      return new Response("Internal Server Error", { status: 500 })
    }
  }
}
