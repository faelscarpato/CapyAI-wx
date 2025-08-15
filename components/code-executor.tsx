"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Copy, Download, Terminal, AlertCircle } from "lucide-react"

interface CodeExecutorProps {
  onCodeExecuted: (language: string, output: string) => void
}

const LANGUAGES = [
  { value: "python", label: "Python", example: 'print("Hello, World!")' },
  { value: "javascript", label: "JavaScript", example: 'console.log("Hello, World!");' },
  { value: "html", label: "HTML", example: "<h1>Hello, World!</h1>" },
  { value: "css", label: "CSS", example: "body { color: blue; }" },
]

export function CodeExecutor({ onCodeExecuted }: CodeExecutorProps) {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("python")
  const [isExecuting, setIsExecuting] = useState(false)
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [explanation, setExplanation] = useState("")
  const [executionHistory, setExecutionHistory] = useState<
    Array<{
      id: string
      language: string
      code: string
      output: string
      error: string | null
      explanation: string
      timestamp: Date
    }>
  >([])

  const handleExecute = async () => {
    if (!code.trim()) return

    setIsExecuting(true)
    setError(null)

    try {
      const response = await fetch("/api/execute-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, language }),
      })

      if (!response.ok) {
        throw new Error("Failed to execute code")
      }

      const result = await response.json()

      setOutput(result.output || "")
      setError(result.error)
      setExplanation(result.explanation || "")
      onCodeExecuted(language, result.output || result.error || "")

      const execution = {
        id: Date.now().toString(),
        language,
        code,
        output: result.output || "",
        error: result.error,
        explanation: result.explanation || "",
        timestamp: new Date(),
      }

      setExecutionHistory((prev) => [execution, ...prev])
    } catch (error) {
      console.error("Code execution error:", error)
      setError("Failed to execute code. Please try again.")
    } finally {
      setIsExecuting(false)
    }
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    const example = LANGUAGES.find((lang) => lang.value === newLanguage)?.example || ""
    if (!code.trim()) {
      setCode(example)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Code Editor Section */}
      <div className="border-b border-border p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Code Executor</h2>
            <p className="text-muted-foreground">Write and execute code in multiple programming languages</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Code Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button onClick={handleExecute} disabled={!code.trim() || isExecuting} className="flex-1">
                  {isExecuting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Code
                    </>
                  )}
                </Button>
              </div>

              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`Enter your ${language} code here...`}
                className="min-h-[300px] font-mono text-sm resize-none"
                disabled={isExecuting}
              />
            </div>

            {/* Output */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <span className="font-medium">Output</span>
                {(output || error) && (
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <Card className="min-h-[300px] p-4 bg-muted/50">
                {error ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Error</span>
                    </div>
                    <pre className="text-sm font-mono whitespace-pre-wrap text-destructive">{error}</pre>
                  </div>
                ) : output ? (
                  <div className="space-y-2">
                    <pre className="text-sm font-mono whitespace-pre-wrap">{output}</pre>
                    {explanation && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm text-muted-foreground">{explanation}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Output will appear here</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Execution History */}
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold mb-4">Execution History</h3>

          {executionHistory.length === 0 ? (
            <div className="text-center py-8">
              <Terminal className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No code executed yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {executionHistory.map((execution) => (
                <Card key={execution.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{execution.language}</Badge>
                      <span className="text-sm text-muted-foreground">{execution.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Code:</p>
                      <pre className="text-xs bg-muted p-3 rounded font-mono overflow-x-auto">{execution.code}</pre>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Output:</p>
                      <pre className="text-xs bg-muted p-3 rounded font-mono overflow-x-auto">{execution.output}</pre>
                      {execution.error && (
                        <div className="mt-3 pt-3 border-t border-destructive">
                          <p className="text-sm text-destructive">{execution.error}</p>
                        </div>
                      )}
                      {execution.explanation && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-sm text-muted-foreground">{execution.explanation}</p>
                        </div>
                      )}
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
