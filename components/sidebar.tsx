"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, MessageSquare, Settings, Download, Trash2, X, Search, Edit3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Conversation {
  id: string
  title: string
  timestamp: Date
  messageCount: number
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  conversations: Conversation[]
  onNewConversation: () => void
  onSelectConversation?: (id: string) => void
  onDeleteConversation?: (id: string) => void
  onRenameConversation?: (id: string, newTitle: string) => void
  currentConversationId?: string
}

export function Sidebar({
  isOpen,
  onClose,
  conversations,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  currentConversationId,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [showSettings, setShowSettings] = useState(false)

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleExportConversations = () => {
    const dataStr = JSON.stringify(conversations, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `gemini-conversations-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handleRename = (conversation: Conversation) => {
    setEditingId(conversation.id)
    setEditTitle(conversation.title)
  }

  const handleSaveRename = () => {
    if (editingId && editTitle.trim() && onRenameConversation) {
      onRenameConversation(editingId, editTitle.trim())
    }
    setEditingId(null)
    setEditTitle("")
  }

  const handleCancelRename = () => {
    setEditingId(null)
    setEditTitle("")
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-80 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <h2 className="font-semibold text-sidebar-foreground">Conversations</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* New Conversation */}
          <div className="p-4 space-y-3">
            <Button onClick={onNewConversation} className="w-full justify-start gap-2 bg-transparent" variant="outline">
              <Plus className="h-4 w-4" />
              New Conversation
            </Button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{searchQuery ? "No conversations found" : "No conversations yet"}</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      "group flex items-center gap-2 p-3 rounded-lg hover:bg-sidebar-accent cursor-pointer transition-colors",
                      currentConversationId === conversation.id && "bg-sidebar-accent",
                    )}
                    onClick={() => onSelectConversation?.(conversation.id)}
                  >
                    <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      {editingId === conversation.id ? (
                        <div className="space-y-1">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename()
                              if (e.key === "Escape") handleCancelRename()
                            }}
                            onBlur={handleSaveRename}
                            className="h-6 text-sm"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-medium truncate">{conversation.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{conversation.timestamp.toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{conversation.messageCount} messages</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRename(conversation)
                        }}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteConversation?.(conversation.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <Separator />

          {/* Footer Actions */}
          <div className="p-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={handleExportConversations}
              disabled={conversations.length === 0}
            >
              <Download className="h-4 w-4" />
              Export Conversations
            </Button>

            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Conversation Management</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start bg-transparent"
                        onClick={() => {
                          localStorage.removeItem("gemini-conversations")
                          window.location.reload()
                        }}
                      >
                        Clear All Conversations
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start bg-transparent"
                        onClick={handleExportConversations}
                      >
                        Export All Data
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">About</h4>
                    <p className="text-xs text-muted-foreground">
                      Gemini AI Clone v1.0 - Advanced AI assistant with chat, image generation, and code execution
                      capabilities.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  )
}
