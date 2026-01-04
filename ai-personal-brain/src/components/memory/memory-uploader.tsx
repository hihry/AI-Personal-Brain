"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import {
  Upload,
  File,
  FileText,
  FileImage,
  FileCode,
  X,
  Check,
  AlertCircle,
  Loader2,
  Plus,
  Lock,
  Unlock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface UploadFile {
  id: string
  file: File
  status: "pending" | "uploading" | "processing" | "complete" | "error"
  progress: number
  error?: string
}

interface MemoryUploaderProps {
  onUploadComplete?: (files: File[], metadata: UploadMetadata) => void
}

interface UploadMetadata {
  sourceName: string
  tags: string[]
  isPrivate: boolean
}

const SUPPORTED_FORMATS = [
  { extension: ".pdf", label: "PDF", icon: FileText },
  { extension: ".md", label: "Markdown", icon: FileCode },
  { extension: ".txt", label: "Text", icon: File },
  { extension: ".docx", label: "Word", icon: FileText },
  { extension: ".png", label: "PNG", icon: FileImage },
  { extension: ".jpg", label: "JPG", icon: FileImage },
]

const ACCEPTED_TYPES = ".pdf,.md,.txt,.docx,.png,.jpg,.jpeg"

function getFileIcon(fileName: string) {
  const ext = fileName.toLowerCase().split(".").pop()
  switch (ext) {
    case "pdf":
    case "docx":
      return FileText
    case "md":
    case "txt":
      return FileCode
    case "png":
    case "jpg":
    case "jpeg":
      return FileImage
    default:
      return File
  }
}

export function MemoryUploader({ onUploadComplete }: MemoryUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [files, setFiles] = useState<UploadFile[]>([])
  const [sourceName, setSourceName] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [isPrivate, setIsPrivate] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return

    const fileArray = Array.from(newFiles).map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: "pending" as const,
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...fileArray])
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      addFiles(e.dataTransfer.files)
    },
    [addFiles],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      addFiles(e.target.files)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [addFiles],
  )

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const addTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag])
      setTagInput("")
    }
  }, [tagInput, tags])

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        addTag()
      }
    },
    [addTag],
  )

  const simulateUpload = useCallback(async () => {
    if (files.length === 0) return

    setIsUploading(true)

    for (let i = 0; i < files.length; i++) {
      const fileId = files[i].id

      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "uploading" as const } : f)))

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 50))
        setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress } : f)))
      }

      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "processing" as const } : f)))

      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 500))

      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "complete" as const } : f)))
    }

    setIsUploading(false)

    onUploadComplete?.(
      files.map((f) => f.file),
      { sourceName, tags, isPrivate },
    )
  }, [files, sourceName, tags, isPrivate, onUploadComplete])

  const allComplete = files.length > 0 && files.every((f) => f.status === "complete")
  const hasErrors = files.some((f) => f.status === "error")

  return (
    <div className="flex flex-col gap-6">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
          files.length > 0 && "pb-4",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES}
          onChange={handleFileSelect}
          className="sr-only"
          id="file-upload"
        />

        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Upload className="size-5 text-muted-foreground" />
        </div>

        <div className="text-center">
          <p className="text-sm font-medium">
            Drag and drop files here, or{" "}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-primary underline-offset-4 hover:underline"
            >
              browse
            </button>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Upload documents to add to your AI brain memory</p>
        </div>

        {/* Supported Formats */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {SUPPORTED_FORMATS.map((format) => (
            <div key={format.extension} className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1">
              <format.icon className="size-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{format.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-medium text-muted-foreground">Files ({files.length})</Label>
          <div className="flex flex-col gap-2 rounded-lg border bg-card p-3">
            {files.map((uploadFile) => {
              const FileIcon = getFileIcon(uploadFile.file.name)
              return (
                <div key={uploadFile.id} className="flex items-center gap-3 rounded-md bg-muted/30 p-2">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded bg-muted">
                    <FileIcon className="size-4 text-muted-foreground" />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{uploadFile.file.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {(uploadFile.file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>

                    {uploadFile.status === "uploading" && <Progress value={uploadFile.progress} className="h-1" />}

                    {uploadFile.status === "processing" && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Loader2 className="size-3 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    )}

                    {uploadFile.status === "error" && (
                      <div className="flex items-center gap-1.5 text-xs text-destructive">
                        <AlertCircle className="size-3" />
                        <span>{uploadFile.error || "Upload failed"}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {uploadFile.status === "complete" && (
                      <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10">
                        <Check className="size-3.5 text-emerald-500" />
                      </div>
                    )}

                    {(uploadFile.status === "pending" || uploadFile.status === "error") && (
                      <Button variant="ghost" size="icon" className="size-6" onClick={() => removeFile(uploadFile.id)}>
                        <X className="size-3.5" />
                        <span className="sr-only">Remove file</span>
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Metadata Section */}
      {files.length > 0 && (
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
          <h3 className="text-sm font-medium">Metadata</h3>

          {/* Source Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="source-name" className="text-xs text-muted-foreground">
              Source Name
            </Label>
            <Input
              id="source-name"
              placeholder="e.g., Research Papers, Meeting Notes"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="tags" className="text-xs text-muted-foreground">
              Tags
            </Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="h-9"
              />
              <Button
                variant="outline"
                size="icon"
                className="size-9 shrink-0 bg-transparent"
                onClick={addTag}
                disabled={!tagInput.trim()}
              >
                <Plus className="size-4" />
                <span className="sr-only">Add tag</span>
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                    >
                      <X className="size-3" />
                      <span className="sr-only">Remove {tag}</span>
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between rounded-md bg-muted/30 p-3">
            <div className="flex items-center gap-3">
              {isPrivate ? (
                <Lock className="size-4 text-amber-500" />
              ) : (
                <Unlock className="size-4 text-muted-foreground" />
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium">Private Memory</span>
                <span className="text-xs text-muted-foreground">
                  {isPrivate ? "Only accessible by you" : "Accessible in shared contexts"}
                </span>
              </div>
            </div>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} aria-label="Toggle private memory" />
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && !allComplete && (
        <Button onClick={simulateUpload} disabled={isUploading || files.length === 0} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 size-4" />
              Upload {files.length} {files.length === 1 ? "File" : "Files"}
            </>
          )}
        </Button>
      )}

      {/* Success State */}
      {allComplete && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10">
            <Check className="size-5 text-emerald-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-emerald-500">Upload Complete</p>
            <p className="text-xs text-muted-foreground">
              {files.length} {files.length === 1 ? "file has" : "files have"} been added to your memory
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFiles([])
              setSourceName("")
              setTags([])
              setIsPrivate(false)
            }}
          >
            Upload More
          </Button>
        </div>
      )}

      {/* Error State */}
      {hasErrors && !isUploading && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
          <AlertCircle className="size-4 text-destructive" />
          <p className="text-sm text-destructive">Some files failed to upload. Please remove them and try again.</p>
        </div>
      )}
    </div>
  )
}
