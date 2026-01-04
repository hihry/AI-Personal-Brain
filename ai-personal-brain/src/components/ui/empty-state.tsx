"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "secondary" | "outline" | "ghost"
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
  size?: "sm" | "default" | "lg"
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "default",
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: "py-8 px-4",
      iconWrapper: "h-10 w-10",
      icon: "h-5 w-5",
      title: "text-sm",
      description: "text-xs",
    },
    default: {
      container: "py-12 px-6",
      iconWrapper: "h-14 w-14",
      icon: "h-7 w-7",
      title: "text-base",
      description: "text-sm",
    },
    lg: {
      container: "py-16 px-8",
      iconWrapper: "h-18 w-18",
      icon: "h-9 w-9",
      title: "text-lg",
      description: "text-base",
    },
  }

  const classes = sizeClasses[size]

  return (
    <div className={cn("flex flex-col items-center justify-center text-center", classes.container, className)}>
      <div className={cn("flex items-center justify-center rounded-full bg-muted mb-4", classes.iconWrapper)}>
        <Icon className={cn("text-muted-foreground", classes.icon)} />
      </div>

      <h3 className={cn("font-semibold text-foreground mb-1", classes.title)}>{title}</h3>

      <p className={cn("text-muted-foreground max-w-sm mb-4", classes.description)}>{description}</p>

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant ?? "default"}
              size={size === "sm" ? "sm" : "default"}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="ghost" size={size === "sm" ? "sm" : "default"}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
