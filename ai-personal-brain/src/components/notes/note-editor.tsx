"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Bold,
  Italic,
  Code,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Sparkles,
  FileText,
  Lightbulb,
  CheckSquare,
  ChevronDown,
  Check,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  updatedAt: Date
  createdAt: Date
}

interface NoteEditorProps {
  note: Note | null
  onSave: (note: Partial<Note>) => void
  onAIAssist?: (action: "summarize" | "improve" | "extract-tasks", content: string) => Promise<string>
}

type SaveStatus = "idle" | "saving" | "saved"

const formatActions = [
  { id: "bold", icon: Bold, label: "Bold", prefix: "**", suffix: "**" },
  { id: "italic", icon: Italic, label: "Italic", prefix: "_", suffix: "_" },
  { id: "code", icon: Code, label: "Code", prefix: "`", suffix: "`" },
  { id: "heading", icon: Heading2, label: "Heading", prefix: "## ", suffix: "" },
  { id: "quote", icon: Quote, label: "Quote", prefix: "> ", suffix: "" },
  { id: "bullet", icon: List, label: "Bullet list", prefix: "- ", suffix: "" },
  { id: "numbered", icon: ListOrdered, label: "Numbered list", prefix: "1. ", suffix: "" },
] as const

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function NoteEditor({ note, onSave, onAIAssist }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title ?? "")
  const [content, setContent] = useState(note?.content ?? "")
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [isAIProcessing, setIsAIProcessing] = useState(false)
  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  // Sync state with note prop changes
  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setSaveStatus("idle")
    }
  }, [note])

  // Auto-save with debounce
  const triggerAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    setSaveStatus("saving")

    saveTimeoutRef.current = setTimeout(() => {
      console.log('NoteEditor: Triggering auto-save', { 
        noteId: note?.id,
        title,
        contentLength: content?.length 
      })
      
      onSave({
        id: note?.id,
        title,
        content,
        updatedAt: new Date(),
      })
      setSaveStatus("saved")

      setTimeout(() => setSaveStatus("idle"), 2000)
    }, 1000)
  }, [note?.id, title, content, onSave])

  useEffect(() => {
    if (note && (title !== note.title || content !== note.content)) {
      triggerAutoSave()
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [title, content])

  // Handle text selection for floating toolbar
  const handleSelection = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || !textareaRef.current) {
      setShowToolbar(false)
      return
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const textareaRect = textareaRef.current.getBoundingClientRect()

    if (rect.top >= textareaRect.top && rect.bottom <= textareaRect.bottom) {
      setToolbarPosition({
        top: rect.top - textareaRect.top - 48,
        left: rect.left - textareaRect.left + rect.width / 2,
      })
      setShowToolbar(true)
    }
  }, [])

  // Apply formatting to selected text
  const applyFormat = useCallback(
    (prefix: string, suffix: string) => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = content.slice(start, end)

      const newContent = content.slice(0, start) + prefix + selectedText + suffix + content.slice(end)

      setContent(newContent)
      setShowToolbar(false)

      // Restore cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + prefix.length, end + prefix.length)
      }, 0)
    },
    [content],
  )

  // Handle AI assist actions
  const handleAIAssist = useCallback(
    async (action: "summarize" | "improve" | "extract-tasks") => {
      if (!onAIAssist || !content.trim()) return

      setIsAIProcessing(true)

      try {
        const result = await onAIAssist(action, content)
        if (action === "extract-tasks") {
          setContent((prev) => prev + "\n\n## Tasks\n" + result)
        } else {
          setContent(result)
        }
      } catch (error) {
        console.error("AI assist failed:", error)
      } finally {
        setIsAIProcessing(false)
      }
    },
    [content, onAIAssist],
  )

  const wordCount = countWords(content)

  if (!note) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-muted/30 p-8">
        <div className="mb-4 rounded-full bg-muted p-4">
          <FileText className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No note selected</h3>
        <p className="mt-1 text-sm text-muted-foreground">Select a note from the list or create a new one</p>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full flex-col bg-background">
        {/* Title input */}
        <div className="border-b border-border px-8 py-6">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="border-0 bg-transparent px-0 text-2xl font-semibold placeholder:text-muted-foreground/50 focus-visible:ring-0"
          />
        </div>

        {/* Content editor with floating toolbar */}
        <div className="relative flex-1 overflow-hidden">
          {/* Floating formatting toolbar */}
          {showToolbar && (
            <div
              ref={toolbarRef}
              className="absolute z-10 flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-lg"
              style={{
                top: `${toolbarPosition.top}px`,
                left: `${toolbarPosition.left}px`,
                transform: "translateX(-50%)",
              }}
            >
              {formatActions.map((action) => (
                <Tooltip key={action.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => applyFormat(action.prefix, action.suffix)}
                      className="h-8 w-8 p-0"
                    >
                      <action.icon className="size-4" />
                      <span className="sr-only">{action.label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {action.label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}

          {/* Content textarea */}
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onSelect={handleSelection}
            onBlur={() => setTimeout(() => setShowToolbar(false), 200)}
            placeholder="Start writing..."
            className={cn(
              "h-full w-full resize-none border-0 bg-transparent px-8 py-6",
              "text-base leading-relaxed placeholder:text-muted-foreground/50",
              "focus-visible:ring-0",
              "font-mono",
            )}
          />
        </div>

        {/* Footer with AI assist, save status, and word count */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2">
          <div className="flex items-center gap-2">
            {/* AI Assist dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isAIProcessing || !content.trim()}
                  className="h-8 gap-1.5 text-xs"
                >
                  {isAIProcessing ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                  AI Assist
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel className="text-xs">AI Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleAIAssist("summarize")} className="gap-2">
                  <FileText className="size-4" />
                  <span>Summarize</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAIAssist("improve")} className="gap-2">
                  <Lightbulb className="size-4" />
                  <span>Improve clarity</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAIAssist("extract-tasks")} className="gap-2">
                  <CheckSquare className="size-4" />
                  <span>Extract tasks</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {/* Save status indicator */}
            <div className="flex items-center gap-1.5">
              {saveStatus === "saving" && (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  <span>Saving...</span>
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <Check className="size-3 text-green-500" />
                  <span>Saved</span>
                </>
              )}
              {saveStatus === "idle" && <span>Auto-save enabled</span>}
            </div>

            {/* Word count */}
            <span>{wordCount.toLocaleString()} words</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
