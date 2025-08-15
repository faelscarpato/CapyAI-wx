"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Copy, ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"

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

interface ChatInterfaceProps {
  messages: Message[]
  isLoading: boolean
  inputValue: string
  onInputChange: (value: string) => void
  onSendMessage: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
}

export function ChatInterface({
  messages,
  isLoading,
  inputValue,
  onInputChange,
  onSendMessage,
  onKeyPress,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4">
        <div className="max-w-4xl mx-auto py-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex gap-4", message.type === "user" ? "justify-end" : "justify-start")}
            >
              {message.type === "ai" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}

              <div className={cn("max-w-[80%] space-y-2", message.type === "user" ? "items-end" : "items-start")}>
                <Card
                  className={cn(
                    "p-4 shadow-sm",
                    message.type === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-card",
                  )}
                >
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="m-0 leading-relaxed">{message.content}</p>
                  </div>

                  {message.metadata?.imageUrl && (
                    <div className="mt-3">
                      <img
                        src={message.metadata.imageUrl || "/placeholder.svg"}
                        alt="Generated image"
                        className="rounded-lg max-w-full h-auto"
                      />
                    </div>
                  )}

                  {message.metadata?.codeOutput && (
                    <div className="mt-3">
                      <Badge variant="secondary" className="mb-2">
                        {message.metadata.codeLanguage}
                      </Badge>
                      <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                        <code>{message.metadata.codeOutput}</code>
                      </pre>
                    </div>
                  )}
                </Card>

                <div
                  className={cn(
                    "flex items-center gap-2 text-xs text-muted-foreground",
                    message.type === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <span>{formatTime(message.timestamp)}</span>
                  {message.type === "ai" && (
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {message.type === "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <Card className="p-4 bg-card">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyPress={onKeyPress}
                placeholder="Type your message here..."
                className="pr-12 min-h-[44px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={onSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
