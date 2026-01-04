import { Suspense } from "react"
import { BrainSearch } from "@/components/search/brain-search"
import { Brain } from "lucide-react"

function SearchContent() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
            <Brain className="size-10 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Search Your Brain</h1>
            <p className="text-muted-foreground max-w-md">
              Semantic search across all your notes, conversations, and memories. Find anything instantly with
              AI-powered relevance.
            </p>
          </div>
        </div>

        <BrainSearch />

        {/* Quick filters */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground mr-2">Quick filters:</span>
          {["Notes", "Chats", "Memories", "This week", "Tagged"].map((filter) => (
            <button
              key={filter}
              className="px-3 py-1.5 text-xs rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchContent />
    </Suspense>
  )
}
