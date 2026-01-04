"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  Search,
  FileText,
  MessageSquare,
  Lightbulb,
  Clock,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  X,
  Sparkles,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ResultType = "note" | "chat" | "memory"

interface SearchResult {
  id: string
  type: ResultType
  title: string
  content: string
  matchedText: string
  relevanceScore: number
  tags: string[]
  updatedAt: Date
}

interface Suggestion {
  id: string
  text: string
  type: "recent" | "suggested"
}

const typeConfig: Record<ResultType, { icon: typeof FileText; label: string; color: string }> = {
  note: { icon: FileText, label: "Note", color: "text-blue-400" },
  chat: { icon: MessageSquare, label: "Chat", color: "text-green-400" },
  memory: { icon: Lightbulb, label: "Memory", color: "text-amber-400" },
}

const mockSuggestions: Suggestion[] = [
  { id: "1", text: "machine learning fundamentals", type: "recent" },
  { id: "2", text: "project roadmap Q1", type: "recent" },
  { id: "3", text: "API authentication patterns", type: "suggested" },
  { id: "4", text: "meeting notes from last week", type: "suggested" },
]

const mockResults: SearchResult[] = [
  {
    id: "1",
    type: "note",
    title: "Machine Learning Fundamentals",
    content:
      "An overview of supervised and unsupervised learning techniques, including neural networks and decision trees.",
    matchedText: "neural networks and decision trees",
    relevanceScore: 0.95,
    tags: ["ML", "AI", "Learning"],
    updatedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: "2",
    type: "chat",
    title: "Discussion: ML Model Selection",
    content:
      "We discussed different approaches to selecting the right machine learning model for classification tasks.",
    matchedText: "machine learning model for classification",
    relevanceScore: 0.87,
    tags: ["ML", "Strategy"],
    updatedAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    id: "3",
    type: "memory",
    title: "TensorFlow Documentation",
    content: "Ingested documentation covering TensorFlow basics, Keras API, and model training workflows.",
    matchedText: "TensorFlow basics, Keras API",
    relevanceScore: 0.82,
    tags: ["TensorFlow", "Docs"],
    updatedAt: new Date(Date.now() - 86400000 * 7),
  },
  {
    id: "4",
    type: "note",
    title: "Deep Learning Architecture Notes",
    content: "Notes on CNN, RNN, and Transformer architectures with practical implementation examples.",
    matchedText: "Transformer architectures with practical",
    relevanceScore: 0.78,
    tags: ["Deep Learning", "Architecture"],
    updatedAt: new Date(Date.now() - 86400000 * 10),
  },
]

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  const parts = text.split(regex)

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

function RelevanceIndicator({ score }: { score: number }) {
  const percentage = Math.round(score * 100)
  const getColor = () => {
    if (score >= 0.9) return "text-green-400"
    if (score >= 0.7) return "text-yellow-400"
    return "text-muted-foreground"
  }

  return (
    <div className="flex items-center gap-1.5">
      <Sparkles className={cn("size-3", getColor())} />
      <span className={cn("text-xs font-medium tabular-nums", getColor())}>{percentage}%</span>
    </div>
  )
}

interface ResultCardProps {
  result: SearchResult
  query: string
  isSelected: boolean
  onSelect: () => void
}

function ResultCard({ result, query, isSelected, onSelect }: ResultCardProps) {
  const config = typeConfig[result.type]
  const Icon = config.icon

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-150 border-border/50 hover:border-border hover:bg-muted/50",
        isSelected && "border-primary bg-muted/50 ring-1 ring-primary/20",
      )}
      onClick={onSelect}
      role="option"
      aria-selected={isSelected}
      tabIndex={-1}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={cn("mt-0.5 p-1.5 rounded-md bg-muted", config.color)}>
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm truncate">{highlightMatch(result.title, query)}</h3>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                  {config.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{highlightMatch(result.content, query)}</p>
              <div className="flex items-center gap-2 pt-1">
                {result.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    {tag}
                  </Badge>
                ))}
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatRelativeTime(result.updatedAt)}
                </span>
              </div>
            </div>
          </div>
          <RelevanceIndicator score={result.relevanceScore} />
        </div>
      </CardContent>
    </Card>
  )
}

export function BrainSearch() {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>(mockSuggestions)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isSearching, setIsSearching] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const hasQuery = query.trim().length > 0
  const showSuggestions = isOpen && !hasQuery
  const showResults = isOpen && hasQuery && results.length > 0
  const showEmpty = isOpen && hasQuery && results.length === 0 && !isSearching

  const totalItems = showSuggestions ? suggestions.length : results.length

  // Simulated search
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)

    // Simulate API delay
    setTimeout(() => {
      const filtered = mockResults.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setResults(filtered.length > 0 ? filtered : mockResults)
      setIsSearching(false)
      setSelectedIndex(0)
    }, 300)
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 200)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % totalItems)
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems)
          break
        case "Enter":
          e.preventDefault()
          if (showSuggestions && suggestions[selectedIndex]) {
            setQuery(suggestions[selectedIndex].text)
          } else if (showResults && results[selectedIndex]) {
            // Navigate to result
            console.log("Opening result:", results[selectedIndex].id)
          }
          break
        case "Escape":
          e.preventDefault()
          setIsOpen(false)
          inputRef.current?.blur()
          break
      }
    },
    [isOpen, totalItems, showSuggestions, showResults, suggestions, results, selectedIndex],
  )

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleClear = () => {
    setQuery("")
    setResults([])
    setSelectedIndex(0)
    inputRef.current?.focus()
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.text)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 size-5 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search your entire brain..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="h-14 pl-12 pr-24 text-base bg-muted/50 border-border/50 focus:border-primary focus:bg-background transition-all duration-150 rounded-xl"
            aria-label="Semantic search"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            role="combobox"
          />
          <div className="absolute right-3 flex items-center gap-2">
            {hasQuery && (
              <Button variant="ghost" size="icon" className="size-7" onClick={handleClear} aria-label="Clear search">
                <X className="size-4" />
              </Button>
            )}
            <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-0.5 rounded border border-border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50">
            {/* Suggestions */}
            {showSuggestions && (
              <div className="p-2" role="listbox">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors duration-100",
                      index === selectedIndex ? "bg-muted" : "hover:bg-muted/50",
                    )}
                    onClick={() => handleSuggestionClick(suggestion)}
                    role="option"
                    aria-selected={index === selectedIndex}
                  >
                    {suggestion.type === "recent" ? (
                      <Clock className="size-4 text-muted-foreground" />
                    ) : (
                      <Sparkles className="size-4 text-primary" />
                    )}
                    <span>{suggestion.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Loading */}
            {isSearching && (
              <div className="p-8 flex flex-col items-center gap-3 text-muted-foreground">
                <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Searching your brain...</span>
              </div>
            )}

            {/* Results */}
            {showResults && (
              <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto" role="listbox">
                <div className="px-2 py-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {results.length} Results
                  </span>
                  <span className="text-xs text-muted-foreground">Sorted by relevance</span>
                </div>
                {results.map((result, index) => (
                  <ResultCard
                    key={result.id}
                    result={result}
                    query={query}
                    isSelected={index === selectedIndex}
                    onSelect={() => setSelectedIndex(index)}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {showEmpty && (
              <div className="p-8 flex flex-col items-center gap-2 text-muted-foreground">
                <Search className="size-8 opacity-50" />
                <p className="text-sm font-medium">No results found</p>
                <p className="text-xs">Try a different search term</p>
              </div>
            )}

            {/* Keyboard hints */}
            {(showSuggestions || showResults) && (
              <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ArrowUp className="size-3" />
                  <ArrowDown className="size-3" />
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <CornerDownLeft className="size-3" />
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Esc</kbd>
                  Close
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
