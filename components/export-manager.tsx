"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Download, FileText, ImageIcon, Code } from "lucide-react"

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

interface Conversation {
  id: string
  title: string
  timestamp: Date
  messageCount: number
  messages?: Message[]
}

interface ExportManagerProps {
  conversations: Conversation[]
  currentMessages: Message[]
  trigger?: React.ReactNode
}

type ExportFormat = "json" | "txt" | "md" | "html"
type ExportScope = "current" | "all" | "selected"

export function ExportManager({ conversations, currentMessages, trigger }: ExportManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [format, setFormat] = useState<ExportFormat>("json")
  const [scope, setScope] = useState<ExportScope>("current")
  const [includeImages, setIncludeImages] = useState(true)
  const [includeCode, setIncludeCode] = useState(true)
  const [includeTimestamps, setIncludeTimestamps] = useState(true)
  const [selectedConversations, setSelectedConversations] = useState<string[]>([])

  const formatOptions = [
    { value: "json", label: "JSON", icon: FileText },
    { value: "txt", label: "Plain Text", icon: FileText },
    { value: "md", label: "Markdown", icon: FileText },
    { value: "html", label: "HTML", icon: FileText },
  ]

  const scopeOptions = [
    { value: "current", label: "Current Conversation" },
    { value: "all", label: "All Conversations" },
    { value: "selected", label: "Selected Conversations" },
  ]

  const generateFileName = () => {
    const date = new Date().toISOString().split("T")[0]
    const scopeText =
      scope === "current" ? "conversation" : scope === "all" ? "all-conversations" : "selected-conversations"
    return `gemini-${scopeText}-${date}.${format}`
  }

  const formatMessageContent = (message: Message): string => {
    let content = message.content

    if (includeTimestamps) {
      const timestamp = message.timestamp.toLocaleString()
      content = `[${timestamp}] ${content}`
    }

    if (message.metadata?.imageUrl && includeImages) {
      content += `\n[Image: ${message.metadata.imageUrl}]`
    }

    if (message.metadata?.codeOutput && includeCode) {
      content += `\n[Code Output (${message.metadata.codeLanguage})]: ${message.metadata.codeOutput}`
    }

    return content
  }

  const exportAsJSON = (data: any) => {
    const jsonString = JSON.stringify(data, null, 2)
    downloadFile(jsonString, generateFileName(), "application/json")
  }

  const exportAsText = (messages: Message[]) => {
    const textContent = messages
      .map((msg) => {
        const role = msg.type === "user" ? "User" : "AI"
        return `${role}: ${formatMessageContent(msg)}`
      })
      .join("\n\n")

    downloadFile(textContent, generateFileName(), "text/plain")
  }

  const exportAsMarkdown = (messages: Message[]) => {
    let markdown = "# Gemini AI Conversation Export\n\n"

    messages.forEach((msg) => {
      const role = msg.type === "user" ? "👤 **User**" : "🤖 **AI Assistant**"
      markdown += `## ${role}\n\n${formatMessageContent(msg)}\n\n---\n\n`
    })

    downloadFile(markdown, generateFileName(), "text/markdown")
  }

  const exportAsHTML = (messages: Message[]) => {
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gemini AI Conversation Export</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .message { margin-bottom: 20px; padding: 15px; border-radius: 8px; }
        .user { background-color: #e3f2fd; border-left: 4px solid #2196f3; }
        .ai { background-color: #f3e5f5; border-left: 4px solid #9c27b0; }
        .timestamp { font-size: 0.8em; color: #666; margin-bottom: 5px; }
        .metadata { margin-top: 10px; padding: 10px; background-color: #f5f5f5; border-radius: 4px; font-size: 0.9em; }
        pre { background-color: #f8f8f8; padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>Gemini AI Conversation Export</h1>
    <p>Exported on: ${new Date().toLocaleString()}</p>
`

    messages.forEach((msg) => {
      const roleClass = msg.type === "user" ? "user" : "ai"
      const roleText = msg.type === "user" ? "User" : "AI Assistant"

      html += `
    <div class="message ${roleClass}">
        ${includeTimestamps ? `<div class="timestamp">${msg.timestamp.toLocaleString()}</div>` : ""}
        <strong>${roleText}:</strong>
        <div>${msg.content.replace(/\n/g, "<br>")}</div>
`

      if (msg.metadata?.imageUrl && includeImages) {
        html += `<div class="metadata">Image: <a href="${msg.metadata.imageUrl}" target="_blank">${msg.metadata.imageUrl}</a></div>`
      }

      if (msg.metadata?.codeOutput && includeCode) {
        html += `<div class="metadata">Code Output (${msg.metadata.codeLanguage}):<pre>${msg.metadata.codeOutput}</pre></div>`
      }

      html += `    </div>`
    })

    html += `
</body>
</html>`

    downloadFile(html, generateFileName(), "text/html")
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExport = () => {
    let messagesToExport: Message[] = []

    switch (scope) {
      case "current":
        messagesToExport = currentMessages
        break
      case "all":
        messagesToExport = conversations.flatMap((conv) => conv.messages || [])
        break
      case "selected":
        messagesToExport = conversations
          .filter((conv) => selectedConversations.includes(conv.id))
          .flatMap((conv) => conv.messages || [])
        break
    }

    switch (format) {
      case "json":
        const exportData = {
          exportDate: new Date().toISOString(),
          format: "Gemini AI Conversation Export",
          scope,
          includeImages,
          includeCode,
          includeTimestamps,
          messages: messagesToExport,
        }
        exportAsJSON(exportData)
        break
      case "txt":
        exportAsText(messagesToExport)
        break
      case "md":
        exportAsMarkdown(messagesToExport)
        break
      case "html":
        exportAsHTML(messagesToExport)
        break
    }

    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Conversations</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={format} onValueChange={(value: ExportFormat) => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scope Selection */}
          <div className="space-y-2">
            <Label>Export Scope</Label>
            <Select value={scope} onValueChange={(value: ExportScope) => setScope(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {scopeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Conversations */}
          {scope === "selected" && (
            <div className="space-y-2">
              <Label>Select Conversations</Label>
              <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-2">
                {conversations.map((conv) => (
                  <div key={conv.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={conv.id}
                      checked={selectedConversations.includes(conv.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedConversations([...selectedConversations, conv.id])
                        } else {
                          setSelectedConversations(selectedConversations.filter((id) => id !== conv.id))
                        }
                      }}
                    />
                    <Label htmlFor={conv.id} className="text-sm truncate">
                      {conv.title}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Export Options */}
          <div className="space-y-3">
            <Label>Include in Export</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="timestamps" checked={includeTimestamps} onCheckedChange={setIncludeTimestamps} />
                <Label htmlFor="timestamps" className="text-sm">
                  Timestamps
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="images" checked={includeImages} onCheckedChange={setIncludeImages} />
                <Label htmlFor="images" className="text-sm flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  Generated Images
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="code" checked={includeCode} onCheckedChange={setIncludeCode} />
                <Label htmlFor="code" className="text-sm flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  Code Execution Results
                </Label>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            className="w-full"
            disabled={scope === "selected" && selectedConversations.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export as {format.toUpperCase()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
