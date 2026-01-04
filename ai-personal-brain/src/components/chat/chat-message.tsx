"use client"

import type * as React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Brain, Copy, Check } from "lucide-react"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
  createdAt: Date
}

export function ChatMessage({ role, content, createdAt }: ChatMessageProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [copied, setCopied] = useState(false)
  const isUser = role === "user"

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn("group flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar - only visible for assistant */}
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10">
            <Brain className="h-4 w-4 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className="relative max-w-[80%]">
        {/* Message bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted/70 text-foreground",
          )}
        >
          <MessageContent content={content} isUser={isUser} />
        </div>

        {/* Timestamp on hover */}
        <time
          className={cn(
            "absolute -bottom-5 text-[10px] text-muted-foreground transition-opacity duration-200",
            isUser ? "right-0" : "left-0",
            isHovered ? "opacity-100" : "opacity-0",
          )}
        >
          {createdAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>

        {/* Copy button on hover (assistant messages only) */}
        {!isUser && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute -right-10 top-0 h-8 w-8 text-muted-foreground hover:text-foreground transition-opacity duration-200",
              isHovered ? "opacity-100" : "opacity-0",
            )}
            onClick={handleCopy}
            aria-label={copied ? "Copied" : "Copy message"}
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* User avatar placeholder for alignment */}
      {isUser && <div className="w-8 shrink-0" />}
    </div>
  )
}

function MessageContent({ content, isUser }: { content: string; isUser: boolean }) {
  // Parse markdown-like content
  const renderContent = () => {
    const parts: React.ReactNode[] = []
    const remaining = content
    let key = 0

    // Process code blocks first (```...```)
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(<span key={key++}>{renderInlineFormatting(content.slice(lastIndex, match.index), isUser)}</span>)
      }

      // Add code block
      const language = match[1] || "plaintext"
      const code = match[2].trim()
      parts.push(<CodeBlock key={key++} code={code} language={language} />)

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(<span key={key++}>{renderInlineFormatting(content.slice(lastIndex), isUser)}</span>)
    }

    return parts.length > 0 ? parts : renderInlineFormatting(content, isUser)
  }

  return <div className="whitespace-pre-wrap break-words">{renderContent()}</div>
}

function renderInlineFormatting(text: string, isUser: boolean): React.ReactNode {
  const parts: React.ReactNode[] = []
  const remaining = text
  let key = 0

  // Process inline code (`...`)
  const inlineCodeRegex = /`([^`]+)`/g
  let lastIndex = 0
  let match

  while ((match = inlineCodeRegex.exec(text)) !== null) {
    // Add text before inline code
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{renderBoldAndItalic(text.slice(lastIndex, match.index), isUser)}</span>)
    }

    // Add inline code
    parts.push(
      <code
        key={key++}
        className={cn(
          "rounded px-1.5 py-0.5 font-mono text-[13px]",
          isUser ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-foreground",
        )}
      >
        {match[1]}
      </code>,
    )

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{renderBoldAndItalic(text.slice(lastIndex), isUser)}</span>)
  }

  return parts.length > 0 ? parts : renderBoldAndItalic(text, isUser)
}

function renderBoldAndItalic(text: string, isUser: boolean): React.ReactNode {
  // Process bold (**...**)
  const boldRegex = /\*\*([^*]+)\*\*/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match
  let key = 0

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>)
    }
    parts.push(
      <strong key={key++} className="font-semibold">
        {match[1]}
      </strong>,
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>)
  }

  return parts.length > 0 ? parts : text
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-border bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-zinc-900/50 px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Code content */}
      <pre className="overflow-x-auto p-4">
        <code className="font-mono text-[13px] leading-relaxed text-zinc-100">{code}</code>
      </pre>
    </div>
  )
}
