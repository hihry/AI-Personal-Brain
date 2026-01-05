// "use client"

// import { useState, useCallback } from "react"
// import { NotesList } from "@/components/notes/notes-list"
// import { NoteEditor } from "@/components/notes/note-editor"

// // Demo data for the notes list
// const demoNotes = [
//   {
//     id: "1",
//     title: "Project Architecture Overview",
//     content:
//       "## System Design\n\nThe application follows a **microservices architecture** with the following key components:\n\n- API Gateway for routing\n- Auth service for authentication\n- Core business logic services\n- Event-driven communication via message queues",
//     tags: ["architecture", "technical", "planning"],
//     updatedAt: new Date(Date.now() - 1000 * 60 * 30),
//     createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
//   },
//   {
//     id: "2",
//     title: "Meeting Notes: Q1 Planning",
//     content:
//       "Key takeaways from the quarterly planning session:\n\n1. Focus on user retention metrics\n2. Launch new onboarding flow by March\n3. Improve API response times by 40%\n4. Hire 2 senior engineers",
//     tags: ["meetings", "planning"],
//     updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
//     createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
//   },
//   {
//     id: "3",
//     title: "RAG Implementation Research",
//     content:
//       "Retrieval-Augmented Generation combines the power of large language models with external knowledge retrieval. Key considerations:\n\n- Embedding model selection (OpenAI, Cohere, local)\n- Vector database choice (Pinecone, Weaviate, Chroma)\n- Chunking strategies for optimal retrieval\n- Re-ranking for improved relevance",
//     tags: ["ai", "research", "technical"],
//     updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
//     createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
//   },
//   {
//     id: "4",
//     title: "Personal Goals 2024",
//     content:
//       "Goals for this year:\n\n- Learn Rust programming\n- Read 24 books\n- Run a half marathon\n- Ship 3 side projects\n- Improve public speaking skills",
//     tags: ["personal", "goals"],
//     updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
//     createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
//   },
//   {
//     id: "5",
//     title: "API Rate Limiting Strategy",
//     content:
//       "```typescript\nconst rateLimiter = new RateLimiter({\n  windowMs: 15 * 60 * 1000,\n  max: 100,\n  message: 'Too many requests'\n});\n```\n\nImplement sliding window rate limiting to prevent API abuse while maintaining good UX for legitimate users.",
//     tags: ["technical", "api", "security"],
//     updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
//     createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
//   },
// ]

// type Note = (typeof demoNotes)[0]

// export default function NotesPage() {
//   const [notes, setNotes] = useState<Note[]>(demoNotes)
//   const [selectedNote, setSelectedNote] = useState<Note | null>(null)

//   const handleSelectNote = (note: Note) => {
//     setSelectedNote(note)
//   }

//   const handleCreateNote = () => {
//     const newNote: Note = {
//       id: crypto.randomUUID(),
//       title: "Untitled",
//       content: "",
//       tags: [],
//       updatedAt: new Date(),
//       createdAt: new Date(),
//     }
//     setNotes((prev) => [newNote, ...prev])
//     setSelectedNote(newNote)
//   }

//   const handleSaveNote = useCallback((updatedNote: Partial<Note>) => {
//     if (!updatedNote.id) return

//     setNotes((prev) =>
//       prev.map((note) => (note.id === updatedNote.id ? { ...note, ...updatedNote, updatedAt: new Date() } : note)),
//     )

//     setSelectedNote((prev) => (prev?.id === updatedNote.id ? { ...prev, ...updatedNote, updatedAt: new Date() } : prev))
//   }, [])

//   // Mock AI assist handler - in production this would call an API
//   const handleAIAssist = useCallback(
//     async (action: "summarize" | "improve" | "extract-tasks", content: string): Promise<string> => {
//       // Simulate API delay
//       await new Promise((resolve) => setTimeout(resolve, 1500))

//       switch (action) {
//         case "summarize":
//           return `## Summary\n\n${content.slice(0, 200)}...\n\nKey points extracted from the original content.`
//         case "improve":
//           return content.replace(/\n\n/g, "\n\n").trim()
//         case "extract-tasks":
//           return "- [ ] Task 1 extracted from content\n- [ ] Task 2 identified\n- [ ] Task 3 to follow up"
//         default:
//           return content
//       }
//     },
//     [],
//   )

//   return (
//     <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
//       {/* Notes sidebar */}
//       <div className="w-80 shrink-0 border-r border-border">
//         <NotesList
//           notes={notes}
//           selectedNoteId={selectedNote?.id}
//           onSelectNote={handleSelectNote}
//           onCreateNote={handleCreateNote}
//         />
//       </div>

//       {/* Note editor area */}
//       <div className="flex-1">
//         <NoteEditor note={selectedNote} onSave={handleSaveNote} onAIAssist={handleAIAssist} />
//       </div>
//     </div>
//   )
// }

"use client"

import { useState, useCallback, useEffect } from "react"
import { NotesList } from "@/components/notes/notes-list"
import { NoteEditor } from "@/components/notes/note-editor"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

// Define the real structure based on your Supabase table
interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  updatedAt: Date | string
  createdAt: Date | string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // 1. Ensure user is logged in on mount
  useEffect(() => {
    const manualLogin = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'work.himanshu.r.v@gmail.com',
        password: 'Himanshu9321',
      })

      if (error) {
        console.error("Manual Login Failed:", error.message)
      } else {
        console.log("Logged in successfully! User ID:", data.user?.id)
        // After login, fetch notes
        setMounted(true)
        fetchNotes()
      }
    }

    manualLogin()
  }, [])

  // 1. Fix Hydration: Ensure component only renders logic on client
  useEffect(() => {
    if (mounted) {
      fetchNotes()
    }
  }, [mounted])

  // 2. Fetch real data from Supabase
  const fetchNotes = async () => {
    const supabase = createClient()
    
    // Get current user
    let { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // If no user, try to login
    if (!user || userError) {
      console.warn("No user found in fetchNotes, attempting to login...")
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'work.himanshu.r.v@gmail.com',
        password: 'Himanshu9321',
      })
      
      if (loginError || !loginData.user) {
        console.error("Login failed in fetchNotes:", loginError)
        toast.error("Please log in to view notes")
        setLoading(false)
        return
      }
      
      user = loginData.user
      console.log("Logged in successfully in fetchNotes, User ID:", user.id)
    }

    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', user.id) // Only fetch current user's notes
      .order('updated_at', { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      toast.error("Failed to load notes from Supabase")
    } else if (data) {
      // Mapping database fields to UI fields
      const formattedNotes = data.map((n: any) => ({
        id: n.id,
        title: n.metadata?.title || "Untitled",
        content: n.content,
        tags: n.metadata?.tags || [],
        updatedAt: n.updated_at,
        createdAt: n.created_at
      }))
      setNotes(formattedNotes)
    }
    setLoading(false)
  }

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
  }

  // 3. Trigger Ingest API on Create (Autosave functionality)
  const handleCreateNote = async () => {
    const tempId = `temp-${crypto.randomUUID()}`
    const newNote: Note = {
      id: tempId,
      title: "Untitled",
      content: "",
      tags: [],
      updatedAt: new Date(),
      createdAt: new Date(),
    }

    console.log('Creating new note:', { tempId })

    // Optimistic Update
    setNotes((prev) => [newNote, ...prev])
    setSelectedNote(newNote)

    // Don't save empty notes immediately - wait for user to type something
    // The auto-save will handle it when content is added
    console.log('New note created, waiting for content before saving')
  }

  // 4. The actual API Trigger to bridge UI -> DB -> Pinecone
  const saveToBrain = useCallback(async (noteToSave: any) => {
    console.log('saveToBrain called with:', { 
      hasNote: !!noteToSave,
      noteId: noteToSave?.id,
      contentLength: noteToSave?.content?.length,
      title: noteToSave?.title 
    })
    
    try {
      const supabase = createClient()
      let { data: { user }, error: userError } = await supabase.auth.getUser()
      
      // If no user, try to login
      if (!user || userError) {
        console.warn('No user found in saveToBrain, attempting login...')
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: 'work.himanshu.r.v@gmail.com',
          password: 'Himanshu9321',
        })
        
        if (loginError || !loginData.user) {
          console.error('Login failed in saveToBrain:', loginError)
          toast.error("Please log in to save notes")
          return
        }
        
        user = loginData.user
        console.log('Successfully logged in in saveToBrain, user ID:', user.id)
      }

      console.log('Calling ingest API with:', { 
        contentLength: noteToSave?.content?.length || 0,
        title: noteToSave?.title || 'Untitled',
        userId: user.id
      })
      
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies for authentication
        body: JSON.stringify({
          content: noteToSave.content || '',
          metadata: {
            title: noteToSave.title || 'Untitled',
            tags: noteToSave.tags || []
          }
        }),
      })
      
      console.log('Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('API Error:', errorData)
        throw new Error(errorData.error || `Sync failed: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('Ingest successful:', result)
      
      // Show warning if Pinecone is not configured, but still show success
      if (result.warning) {
        toast.success(result.message || "Note saved, but AI search not available", {
          description: "Add Pinecone credentials to enable AI search"
        })
      } else {
        toast.success(result.message || "Note saved successfully")
      }
      
      // If successful, the API returns the permanent ID from Supabase
      return result.noteId
    } catch (error: any) {
      console.error("Ingest Error:", error)
      // Don't show error if it's just a Pinecone warning
      if (error.message && error.message.includes('Pinecone')) {
        toast.success("Note saved to database", {
          description: "AI search is not configured - add Pinecone credentials"
        })
      } else {
        toast.error(error.message || "AI Memory sync failed")
      }
    }
  }, [])

  const handleSaveNote = useCallback(async (updatedFields: Partial<Note>) => {
    console.log('handleSaveNote called with:', { 
      hasSelectedNote: !!selectedNote,
      selectedNoteId: selectedNote?.id,
      updatedFields 
    })
    
    if (!selectedNote) {
      console.warn('handleSaveNote: No selected note, returning early')
      return
    }

    const updatedNote = { ...selectedNote, ...updatedFields, updatedAt: new Date() }
    console.log('Updated note:', { 
      id: updatedNote.id,
      title: updatedNote.title,
      contentLength: updatedNote.content?.length 
    })

    // Update local UI immediately
    setNotes((prev) =>
      prev.map((note) => (note.id === selectedNote.id ? updatedNote : note)),
    )
    setSelectedNote(updatedNote)

    // Only save if there's actual content (skip empty notes)
    // But still save if it's a new note (to create it in DB)
    const hasContent = updatedNote.content && updatedNote.content.trim().length > 0
    const isNewNote = !updatedNote.id || updatedNote.id.startsWith('temp-') || updatedNote.id.includes('temp')
    
    if (!hasContent && !isNewNote) {
      console.log('Skipping save - no content and not a new note')
      return
    }

    // Sync to Pinecone and Supabase via our API
    console.log('Calling saveToBrain from handleSaveNote', { hasContent, isNewNote })
    try {
      await saveToBrain(updatedNote)
    } catch (error) {
      console.error('Error in handleSaveNote:', error)
    }
  }, [selectedNote, saveToBrain])

  // 5. AI Assist: Replace mock with real API call
  const handleAIAssist = useCallback(
    async (action: string, content: string): Promise<string> => {
      const response = await fetch('/api/ai-assist', {
        method: 'POST',
        body: JSON.stringify({ action, content })
      })
      const data = await response.json()
      return data.result
    },
    [],
  )

  if (!mounted) return null // Prevent Hydration error

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      <div className="w-80 shrink-0 border-r border-border">
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground text-center">Loading Brain...</div>
        ) : (
          <NotesList
            notes={notes}
            selectedNoteId={selectedNote?.id}
            onSelectNote={handleSelectNote}
            onCreateNote={handleCreateNote}
          />
        )}
      </div>

      <div className="flex-1">
        <NoteEditor 
          note={selectedNote} 
          onSave={handleSaveNote} 
          onAIAssist={handleAIAssist} 
        />
      </div>
    </div>
  )
}
// "use client"

// import { useState, useEffect, useCallback } from "react"
// import { NotesList } from "@/components/notes/notes-list"
// import { NoteEditor } from "@/components/notes/note-editor"
// import { supabase } from "@/lib/supabase" // Ensure this path is correct
// import { toast } from "sonner" // Or your preferred toast lib

// export default function NotesPage() {
//   const [notes, setNotes] = useState<any[]>([])
//   const [selectedNote, setSelectedNote] = useState<any | null>(null)
//   const [loading, setLoading] = useState(true)

//   // 1. FETCH NOTES FROM SUPABASE ON LOAD
//   useEffect(() => {
//     const fetchNotes = async () => {
//       const { data, error } = await supabase
//         .from('memories')
//         .select('*')
//         .order('updated_at', { ascending: false })

//       if (error) {
//         toast.error("Failed to load notes")
//       } else {
//         setNotes(data || [])
//       }
//       setLoading(false)
//     }

//     fetchNotes()
//   }, [])

//   const handleSelectNote = (note: any) => {
//     setSelectedNote(note)
//   }

//   const handleCreateNote = () => {
//     const newNote = {
//       id: 'temp-' + crypto.randomUUID(), // Temp ID until saved
//       content: "",
//       metadata: { title: "Untitled" },
//       updated_at: new Date().toISOString(),
//     }
//     setNotes((prev) => [newNote, ...prev])
//     setSelectedNote(newNote)
//   }

//   // 2. SAVE NOTE & TRIGGER RAG INGESTION
//   const handleSaveNote = useCallback(async (updatedNote: any) => {
//     try {
//       // Optimistic UI Update
//       setNotes((prev) =>
//         prev.map((n) => (n.id === updatedNote.id ? { ...n, ...updatedNote } : n))
//       )

//       // Call our Ingest API
//       const response = await fetch('/api/ingest', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           content: updatedNote.content,
//           userId: (await supabase.auth.getUser()).data.user?.id,
//           metadata: { 
//             title: updatedNote.title || "Untitled",
//             tags: updatedNote.tags || [] 
//           }
//         }),
//       })

//       if (!response.ok) throw new Error("Failed to sync with AI Brain")
      
//       const result = await response.json()
//       toast.success("Memory Synced")

//     } catch (err) {
//       toast.error("Cloud sync failed, but saved locally.")
//       console.error(err)
//     }
//   }, [])

//   // 3. AI ASSIST (Live OpenRouter Call)
//   const handleAIAssist = useCallback(
//     async (action: string, content: string): Promise<string> => {
//       const response = await fetch('/api/ai-assist', {
//         method: 'POST',
//         body: JSON.stringify({ action, content })
//       })
//       const data = await response.json()
//       return data.result
//     },
//     [],
//   )

//   if (loading) return <div className="p-10 text-center">Loading your Brain...</div>

//   return (
//     <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
//       <div className="w-80 shrink-0 border-r border-border">
//         <NotesList
//           notes={notes}
//           selectedNoteId={selectedNote?.id}
//           onSelectNote={handleSelectNote}
//           onCreateNote={handleCreateNote}
//         />
//       </div>

//       <div className="flex-1">
//         <NoteEditor 
//             note={selectedNote} 
//             onSave={handleSaveNote} 
//             onAIAssist={handleAIAssist} 
//         />
//       </div>
//     </div>
//   )
// }