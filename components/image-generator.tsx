"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImageIcon, Download, Copy, Wand2 } from "lucide-react"

interface ImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void
}

export function ImageGenerator({ onImageGenerated }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<
    Array<{
      imageUrl: string
      prompt: string
      originalPrompt: string
      timestamp: Date
    }>
  >([])

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate image")
      }

      const data = await response.json()
      const imageData = {
        imageUrl: data.imageUrl,
        prompt: data.prompt,
        originalPrompt: data.originalPrompt,
        timestamp: new Date(),
      }

      setGeneratedImages((prev) => [imageData, ...prev])
      onImageGenerated(data.imageUrl)
      setPrompt("")
    } catch (error) {
      console.error("Image generation error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Input Section */}
      <div className="border-b border-border p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">AI Image Generator</h2>
            <p className="text-muted-foreground">Describe the image you want to create and I'll generate it for you</p>
          </div>

          <div className="space-y-3">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your image in detail... (e.g., 'A futuristic city at sunset with flying cars')"
              className="min-h-[100px] resize-none"
              disabled={isGenerating}
            />

            <div className="flex gap-2">
              <Button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating} className="flex-1">
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Images */}
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {generatedImages.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No images generated yet</h3>
              <p className="text-muted-foreground">Enter a prompt above to generate your first AI image</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedImages.map((image, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={image.imageUrl || "/placeholder.svg"}
                      alt={`Generated: ${image.originalPrompt}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="mb-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">{image.originalPrompt}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">AI Generated</Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
