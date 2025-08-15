"use client"

import type React from "react"
import { Download } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, Code, Settings, Moon, Sun, Menu, Sparkles, Bot } from "lucide-react"
import { useTheme } from "next-themes"
import { ChatInterface } from "@/components/chat-interface"
import { Sidebar } from "@/components/sidebar"
import { ImageGenerator } from "@/components/image-generator"
import { CodeExecutor } from "@/components/code-executor"
import { ExportManager } from "@/components/export-manager"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  metadata?: {
    imageUrl?: string
    codeLanguage?: string
    codeOutput?: string
  }
}

export default function GeminiClone() {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [displayMessages, setDisplayMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hello! I'm your advanced AI assistant powered by Groq. I can help you with text conversations, generate images, and execute code. What would you like to do today?",
      timestamp: new Date(),
    },
  ])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const { theme, setTheme } = useTheme()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [displayMessages])

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setDisplayMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...displayMessages.map((msg) => ({
              role: msg.type === "user" ? "user" : "assistant",
              content: msg.content,
            })),
            {
              role: "user",
              content: input.trim(),
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response body")
      }

      let aiResponse = ""
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "",
        timestamp: new Date(),
      }

      setDisplayMessages((prev) => [...prev, aiMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const data = JSON.parse(line.slice(2))
              if (data.type === "text-delta" && data.textDelta) {
                aiResponse += data.textDelta
                setDisplayMessages((prev) =>
                  prev.map((msg) => (msg.id === aiMessage.id ? { ...msg, content: aiResponse } : msg)),
                )
              }
            } catch (e) {
              // Ignore parsing errors for malformed chunks
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setDisplayMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={[]}
        onNewConversation={() => {
          setDisplayMessages([
            {
              id: "1",
              type: "ai",
              content:
                "Hello! I'm your advanced AI assistant powered by Groq. I can help you with text conversations, generate images, and execute code. What would you like to do today?",
              timestamp: new Date(),
            },
          ])
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Gemini AI Clone
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ExportManager
                conversations={[]}
                currentMessages={displayMessages}
                trigger={
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                }
              />
              <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Interface */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b border-border">
              <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="image" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Images
                </TabsTrigger>
                <TabsTrigger value="code" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Code
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 flex flex-col m-0">
              <ChatInterface
                messages={displayMessages}
                isLoading={isLoading}
                inputValue={input}
                onInputChange={handleInputChange}
                onSendMessage={handleSendMessage}
                onKeyPress={handleKeyPress}
              />
            </TabsContent>

            <TabsContent value="image" className="flex-1 m-0">
              <ImageGenerator
                onImageGenerated={(imageUrl) => {
                  const imageMessage: Message = {
                    id: Date.now().toString(),
                    type: "ai",
                    content: "Generated image:",
                    timestamp: new Date(),
                    metadata: { imageUrl },
                  }
                  setDisplayMessages((prev) => [...prev, imageMessage])
                }}
              />
            </TabsContent>

            <TabsContent value="code" className="flex-1 m-0">
              <CodeExecutor
                onCodeExecuted={(language, output) => {
                  const codeMessage: Message = {
                    id: Date.now().toString(),
                    type: "ai",
                    content: `Code executed successfully in ${language}:`,
                    timestamp: new Date(),
                    metadata: { codeLanguage: language, codeOutput: output },
                  }
                  setDisplayMessages((prev) => [...prev, codeMessage])
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
