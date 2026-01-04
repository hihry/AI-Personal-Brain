"use client"

import { useState, useCallback } from "react"
import { NotesList } from "@/components/notes/notes-list"
import { NoteEditor } from "@/components/notes/note-editor"

// Demo data for the notes list
const demoNotes = [
  {
    id: "1",
    title: "Project Architecture Overview",
    content:
      "## System Design\n\nThe application follows a **microservices architecture** with the following key components:\n\n- API Gateway for routing\n- Auth service for authentication\n- Core business logic services\n- Event-driven communication via message queues",
    tags: ["architecture", "technical", "planning"],
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
  {
    id: "2",
    title: "Meeting Notes: Q1 Planning",
    content:
      "Key takeaways from the quarterly planning session:\n\n1. Focus on user retention metrics\n2. Launch new onboarding flow by March\n3. Improve API response times by 40%\n4. Hire 2 senior engineers",
    tags: ["meetings", "planning"],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
    id: "3",
    title: "RAG Implementation Research",
    content:
      "Retrieval-Augmented Generation combines the power of large language models with external knowledge retrieval. Key considerations:\n\n- Embedding model selection (OpenAI, Cohere, local)\n- Vector database choice (Pinecone, Weaviate, Chroma)\n- Chunking strategies for optimal retrieval\n- Re-ranking for improved relevance",
    tags: ["ai", "research", "technical"],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    id: "4",
    title: "Personal Goals 2024",
    content:
      "Goals for this year:\n\n- Learn Rust programming\n- Read 24 books\n- Run a half marathon\n- Ship 3 side projects\n- Improve public speaking skills",
    tags: ["personal", "goals"],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
  },
  {
    id: "5",
    title: "API Rate Limiting Strategy",
    content:
      "```typescript\nconst rateLimiter = new RateLimiter({\n  windowMs: 15 * 60 * 1000,\n  max: 100,\n  message: 'Too many requests'\n});\n```\n\nImplement sliding window rate limiting to prevent API abuse while maintaining good UX for legitimate users.",
    tags: ["technical", "api", "security"],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
]

type Note = (typeof demoNotes)[0]

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(demoNotes)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
  }

  const handleCreateNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "Untitled",
      content: "",
      tags: [],
      updatedAt: new Date(),
      createdAt: new Date(),
    }
    setNotes((prev) => [newNote, ...prev])
    setSelectedNote(newNote)
  }

  const handleSaveNote = useCallback((updatedNote: Partial<Note>) => {
    if (!updatedNote.id) return

    setNotes((prev) =>
      prev.map((note) => (note.id === updatedNote.id ? { ...note, ...updatedNote, updatedAt: new Date() } : note)),
    )

    setSelectedNote((prev) => (prev?.id === updatedNote.id ? { ...prev, ...updatedNote, updatedAt: new Date() } : prev))
  }, [])

  // Mock AI assist handler - in production this would call an API
  const handleAIAssist = useCallback(
    async (action: "summarize" | "improve" | "extract-tasks", content: string): Promise<string> => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      switch (action) {
        case "summarize":
          return `## Summary\n\n${content.slice(0, 200)}...\n\nKey points extracted from the original content.`
        case "improve":
          return content.replace(/\n\n/g, "\n\n").trim()
        case "extract-tasks":
          return "- [ ] Task 1 extracted from content\n- [ ] Task 2 identified\n- [ ] Task 3 to follow up"
        default:
          return content
      }
    },
    [],
  )

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Notes sidebar */}
      <div className="w-80 shrink-0 border-r border-border">
        <NotesList
          notes={notes}
          selectedNoteId={selectedNote?.id}
          onSelectNote={handleSelectNote}
          onCreateNote={handleCreateNote}
        />
      </div>

      {/* Note editor area */}
      <div className="flex-1">
        <NoteEditor note={selectedNote} onSave={handleSaveNote} onAIAssist={handleAIAssist} />
      </div>
    </div>
  )
}
