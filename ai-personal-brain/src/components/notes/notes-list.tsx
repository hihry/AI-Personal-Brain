"use client"

import type React from "react"

import { useState, useMemo, useCallback } from "react"
import { Search, SortAsc, SortDesc, Clock, Tag, FileText, Plus, ChevronDown, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  updatedAt: Date
  createdAt: Date
}

interface NotesListProps {
  notes: Note[]
  selectedNoteId?: string
  onSelectNote: (note: Note) => void
  onCreateNote: () => void
}

type SortOption = "updated" | "created" | "title"
type SortDirection = "asc" | "desc"

const sortLabels: Record<SortOption, string> = {
  updated: "Last updated",
  created: "Date created",
  title: "Title",
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getPreview(content: string, maxLength = 120): string {
  const cleaned = content
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*|__|`/g, "")
    .replace(/\n+/g, " ")
    .trim()

  if (cleaned.length <= maxLength) return cleaned
  return cleaned.slice(0, maxLength).trim() + "..."
}

export function NotesList({ notes, selectedNoteId, onSelectNote, onCreateNote }: NotesListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("updated")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    notes.forEach((note) => note.tags.forEach((tag) => tagSet.add(tag)))
    return Array.from(tagSet).sort()
  }, [notes])

  const filteredAndSortedNotes = useMemo(() => {
    let result = [...notes]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    if (selectedTags.length > 0) {
      result = result.filter((note) => selectedTags.every((tag) => note.tags.includes(tag)))
    }

    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "updated":
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime()
          break
        case "created":
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
      }
      return sortDirection === "desc" ? -comparison : comparison
    })

    return result
  }, [notes, searchQuery, selectedTags, sortBy, sortDirection])

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }, [])

  const toggleSortDirection = useCallback(() => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (filteredAndSortedNotes.length === 0) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setFocusedIndex((prev) => (prev < filteredAndSortedNotes.length - 1 ? prev + 1 : prev))
          break
        case "ArrowUp":
          e.preventDefault()
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break
        case "Enter":
          e.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < filteredAndSortedNotes.length) {
            onSelectNote(filteredAndSortedNotes[focusedIndex])
          }
          break
      }
    },
    [filteredAndSortedNotes, focusedIndex, onSelectNote],
  )

  return (
    <div className="flex h-full flex-col bg-background" onKeyDown={handleKeyDown}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Notes</h2>
        <Button size="sm" variant="ghost" onClick={onCreateNote} className="h-8 w-8 p-0">
          <Plus className="size-4" />
          <span className="sr-only">Create new note</span>
        </Button>
      </div>

      {/* Search and filters */}
      <div className="space-y-2 border-b border-border p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Tag filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs bg-transparent">
                <Tag className="size-3.5" />
                Tags
                {selectedTags.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {selectedTags.length}
                  </Badge>
                )}
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-xs">Filter by tag</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allTags.length > 0 ? (
                allTags.map((tag) => (
                  <DropdownMenuItem key={tag} onClick={() => toggleTag(tag)} className="gap-2">
                    <div
                      className={cn(
                        "size-4 rounded border",
                        selectedTags.includes(tag) ? "border-primary bg-primary" : "border-muted-foreground/30",
                      )}
                    >
                      {selectedTags.includes(tag) && (
                        <svg
                          className="size-4 text-primary-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm">{tag}</span>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="px-2 py-4 text-center text-xs text-muted-foreground">No tags available</div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs bg-transparent">
                <Clock className="size-3.5" />
                {sortLabels[sortBy]}
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuLabel className="text-xs">Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => setSortBy(option)}
                  className={cn(sortBy === option && "bg-accent")}
                >
                  {sortLabels[option]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort direction toggle */}
          <Button variant="outline" size="sm" onClick={toggleSortDirection} className="h-8 w-8 p-0 bg-transparent">
            {sortDirection === "desc" ? <SortDesc className="size-3.5" /> : <SortAsc className="size-3.5" />}
            <span className="sr-only">Sort {sortDirection === "desc" ? "ascending" : "descending"}</span>
          </Button>
        </div>

        {/* Active tag filters */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1 text-xs">
                {tag}
                <button
                  onClick={() => toggleTag(tag)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="size-3" />
                  <span className="sr-only">Remove {tag} filter</span>
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Notes list */}
      <ScrollArea className="flex-1">
        {filteredAndSortedNotes.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredAndSortedNotes.map((note, index) => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note)}
                onFocus={() => setFocusedIndex(index)}
                className={cn(
                  "w-full px-4 py-3 text-left transition-colors",
                  "hover:bg-muted/50 focus:bg-muted/50 focus:outline-none",
                  selectedNoteId === note.id && "bg-muted",
                  focusedIndex === index && "ring-1 ring-inset ring-ring",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium leading-tight text-foreground line-clamp-1">{note.title}</h3>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(note.updatedAt)}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {getPreview(note.content)}
                </p>
                {note.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="h-5 px-1.5 text-[10px] font-normal">
                        {tag}
                      </Badge>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{note.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <div className="mb-3 rounded-full bg-muted p-3">
              <FileText className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No notes found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {searchQuery || selectedTags.length > 0
                ? "Try adjusting your search or filters"
                : "Create your first note to get started"}
            </p>
            {!searchQuery && selectedTags.length === 0 && (
              <Button size="sm" variant="outline" onClick={onCreateNote} className="mt-4 bg-transparent">
                <Plus className="mr-1.5 size-4" />
                New note
              </Button>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Footer with count */}
      <div className="border-t border-border px-4 py-2">
        <p className="text-xs text-muted-foreground">
          {filteredAndSortedNotes.length} of {notes.length} notes
        </p>
      </div>
    </div>
  )
}

// "use client"

// import type React from "react"
// import { useState, useMemo, useCallback } from "react"
// import { Search, SortAsc, SortDesc, Clock, Tag, FileText, Plus, ChevronDown, X } from "lucide-react"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
//   DropdownMenuLabel,
// } from "@/components/ui/dropdown-menu"
// import { cn } from "@/lib/utils"

// // 1. Updated Interface with Date/String flexibility for API compatibility
// interface Note {
//   id: string
//   title: string
//   content: string
//   tags: string[]
//   updatedAt: Date | string
//   createdAt: Date | string
// }

// interface NotesListProps {
//   notes: Note[]
//   selectedNoteId?: string
//   onSelectNote: (note: Note) => void
//   onCreateNote: () => void
// }

// type SortOption = "updated" | "created" | "title"
// type SortDirection = "asc" | "desc"

// const sortLabels: Record<SortOption, string> = {
//   updated: "Last updated",
//   created: "Date created",
//   title: "Title",
// }

// // Helper to handle both Date objects and ISO strings from Supabase
// function formatRelativeTime(dateInput: Date | string): string {
//   const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
//   const now = new Date()
//   const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

//   if (diffInSeconds < 60) return "Just now"
//   if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
//   if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
//   if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

//   return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
// }

// function getPreview(content: string, maxLength = 120): string {
//   const cleaned = content
//     .replace(/^#+\s+/gm, "")
//     .replace(/\*\*|__|`/g, "")
//     .replace(/\n+/g, " ")
//     .trim()

//   if (cleaned.length <= maxLength) return cleaned
//   return cleaned.slice(0, maxLength).trim() + "..."
// }

// export function NotesList({ notes = [], selectedNoteId, onSelectNote, onCreateNote }: NotesListProps) {
//   const [searchQuery, setSearchQuery] = useState("")
//   const [selectedTags, setSelectedTags] = useState<string[]>([])
//   const [sortBy, setSortBy] = useState<SortOption>("updated")
//   const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
//   const [focusedIndex, setFocusedIndex] = useState<number>(-1)

//   // 2. FIXED: Added null-checks and valid fallback for tags extraction
//   const allTags = useMemo(() => {
//     const tagSet = new Set<string>();
//     (notes || []).forEach((note) => {
//       // Ensure tags exists and is an array before iterating
//       if (Array.isArray(note.tags)) {
//         note.tags.forEach((tag) => {
//           if (tag) tagSet.add(tag);
//         });
//       }
//     });
//     return Array.from(tagSet).sort();
//   }, [notes]);

//   const filteredAndSortedNotes = useMemo(() => {
//     let result = [...(notes || [])]

//     if (searchQuery.trim()) {
//       const query = searchQuery.toLowerCase()
//       result = result.filter(
//         (note) =>
//           note.title.toLowerCase().includes(query) ||
//           note.content.toLowerCase().includes(query) ||
//           (note.tags || []).some((tag) => tag.toLowerCase().includes(query)),
//       )
//     }

//     if (selectedTags.length > 0) {
//       result = result.filter((note) => 
//         selectedTags.every((tag) => (note.tags || []).includes(tag))
//       )
//     }

//     // 3. FIXED: Robust sorting that handles Date objects and Strings
//     result.sort((a, b) => {
//       let comparison = 0
//       const dateA = new Date(a.updatedAt).getTime()
//       const dateB = new Date(b.updatedAt).getTime()
//       const createA = new Date(a.createdAt).getTime()
//       const createB = new Date(b.createdAt).getTime()

//       switch (sortBy) {
//         case "updated":
//           comparison = dateA - dateB
//           break
//         case "created":
//           comparison = createA - createB
//           break
//         case "title":
//           comparison = (a.title || "").localeCompare(b.title || "")
//           break
//       }
//       return sortDirection === "desc" ? -comparison : comparison
//     })

//     return result
//   }, [notes, searchQuery, selectedTags, sortBy, sortDirection])

//   const toggleTag = useCallback((tag: string) => {
//     setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
//   }, [])

//   const toggleSortDirection = useCallback(() => {
//     setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
//   }, [])

//   const handleKeyDown = useCallback(
//     (e: React.KeyboardEvent) => {
//       if (filteredAndSortedNotes.length === 0) return

//       switch (e.key) {
//         case "ArrowDown":
//           e.preventDefault()
//           setFocusedIndex((prev) => (prev < filteredAndSortedNotes.length - 1 ? prev + 1 : prev))
//           break
//         case "ArrowUp":
//           e.preventDefault()
//           setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev))
//           break
//         case "Enter":
//           e.preventDefault()
//           if (focusedIndex >= 0 && focusedIndex < filteredAndSortedNotes.length) {
//             onSelectNote(filteredAndSortedNotes[focusedIndex])
//           }
//           break
//       }
//     },
//     [filteredAndSortedNotes, focusedIndex, onSelectNote],
//   )

//   return (
//     <div className="flex h-full flex-col bg-background" onKeyDown={handleKeyDown}>
//       <div className="flex items-center justify-between border-b border-border px-4 py-3">
//         <h2 className="text-sm font-semibold">Notes</h2>
//         <Button size="sm" variant="ghost" onClick={onCreateNote} className="h-8 w-8 p-0">
//           <Plus className="size-4" />
//           <span className="sr-only">Create new note</span>
//         </Button>
//       </div>

//       <div className="space-y-2 border-b border-border p-3">
//         <div className="relative">
//           <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
//           <Input
//             type="text"
//             placeholder="Search notes..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="h-9 pl-9 text-sm"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs bg-transparent">
//                 <Tag className="size-3.5" />
//                 Tags
//                 {selectedTags.length > 0 && (
//                   <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
//                     {selectedTags.length}
//                   </Badge>
//                 )}
//                 <ChevronDown className="size-3" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="start" className="w-48">
//               <DropdownMenuLabel className="text-xs">Filter by tag</DropdownMenuLabel>
//               <DropdownMenuSeparator />
//               {allTags.length > 0 ? (
//                 allTags.map((tag) => (
//                   <DropdownMenuItem key={tag} onClick={() => toggleTag(tag)} className="gap-2">
//                     <div
//                       className={cn(
//                         "size-4 rounded border",
//                         selectedTags.includes(tag) ? "border-primary bg-primary" : "border-muted-foreground/30",
//                       )}
//                     >
//                       {selectedTags.includes(tag) && (
//                         <svg className="size-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
//                           <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//                         </svg>
//                       )}
//                     </div>
//                     <span className="text-sm">{tag}</span>
//                   </DropdownMenuItem>
//                 ))
//               ) : (
//                 <div className="px-2 py-4 text-center text-xs text-muted-foreground">No tags available</div>
//               )}
//             </DropdownMenuContent>
//           </DropdownMenu>

//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs bg-transparent">
//                 <Clock className="size-3.5" />
//                 {sortLabels[sortBy]}
//                 <ChevronDown className="size-3" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="start" className="w-40">
//               <DropdownMenuLabel className="text-xs">Sort by</DropdownMenuLabel>
//               <DropdownMenuSeparator />
//               {(Object.keys(sortLabels) as SortOption[]).map((option) => (
//                 <DropdownMenuItem
//                   key={option}
//                   onClick={() => setSortBy(option)}
//                   className={cn(sortBy === option && "bg-accent")}
//                 >
//                   {sortLabels[option]}
//                 </DropdownMenuItem>
//               ))}
//             </DropdownMenuContent>
//           </DropdownMenu>

//           <Button variant="outline" size="sm" onClick={toggleSortDirection} className="h-8 w-8 p-0 bg-transparent">
//             {sortDirection === "desc" ? <SortDesc className="size-3.5" /> : <SortAsc className="size-3.5" />}
//           </Button>
//         </div>
//       </div>

//       <ScrollArea className="flex-1">
//         {filteredAndSortedNotes.length > 0 ? (
//           <div className="divide-y divide-border">
//             {filteredAndSortedNotes.map((note, index) => (
//               <button
//                 key={note.id}
//                 onClick={() => onSelectNote(note)}
//                 onFocus={() => setFocusedIndex(index)}
//                 className={cn(
//                   "w-full px-4 py-3 text-left transition-colors",
//                   "hover:bg-muted/50 focus:bg-muted/50 focus:outline-none",
//                   selectedNoteId === note.id && "bg-muted",
//                   focusedIndex === index && "ring-1 ring-inset ring-ring",
//                 )}
//               >
//                 <div className="flex items-start justify-between gap-2">
//                   <h3 className="text-sm font-medium leading-tight text-foreground line-clamp-1">{note.title}</h3>
//                   <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(note.updatedAt)}</span>
//                 </div>
//                 <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
//                   {getPreview(note.content)}
//                 </p>
//                 {(note.tags || []).length > 0 && (
//                   <div className="mt-2 flex flex-wrap gap-1">
//                     {note.tags.slice(0, 3).map((tag) => (
//                       <Badge key={tag} variant="outline" className="h-5 px-1.5 text-[10px] font-normal">
//                         {tag}
//                       </Badge>
//                     ))}
//                   </div>
//                 )}
//               </button>
//             ))}
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
//             <FileText className="size-6 text-muted-foreground mb-3" />
//             <p className="text-sm font-medium">No notes found</p>
//           </div>
//         )}
//       </ScrollArea>
//     </div>
//   )
// }