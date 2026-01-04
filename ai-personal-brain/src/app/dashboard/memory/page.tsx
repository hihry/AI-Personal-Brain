import { MemoryUploader } from "@/components/memory/memory-uploader"

export default function MemoryPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Memory</h1>
        <p className="text-sm text-muted-foreground">Upload and manage documents in your AI brain</p>
      </div>

      <div className="mx-auto w-full max-w-2xl">
        <MemoryUploader />
      </div>
    </div>
  )
}
