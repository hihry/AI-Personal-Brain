"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertTriangle, Zap, HardDrive, Sparkles } from "lucide-react"

interface UsageMeterProps {
  label: string
  current: number
  limit: number
  unit?: string
  icon?: "storage" | "ai" | "custom"
  customIcon?: React.ReactNode
  warningThreshold?: number
  criticalThreshold?: number
  showUpgrade?: boolean
  onUpgrade?: () => void
  className?: string
  compact?: boolean
}

export function UsageMeter({
  label,
  current,
  limit,
  unit = "",
  icon = "storage",
  customIcon,
  warningThreshold = 70,
  criticalThreshold = 90,
  showUpgrade = true,
  onUpgrade,
  className,
  compact = false,
}: UsageMeterProps) {
  const percentage = Math.min((current / limit) * 100, 100)
  const isWarning = percentage >= warningThreshold && percentage < criticalThreshold
  const isCritical = percentage >= criticalThreshold

  const formatValue = (value: number) => {
    if (unit === "GB" || unit === "MB") {
      return value.toFixed(1)
    }
    return value.toLocaleString()
  }

  const getStatusColor = () => {
    if (isCritical) return "text-red-500"
    if (isWarning) return "text-yellow-500"
    return "text-muted-foreground"
  }

  const getProgressColor = () => {
    if (isCritical) return "bg-red-500"
    if (isWarning) return "bg-yellow-500"
    return "bg-primary"
  }

  const IconComponent = () => {
    if (customIcon) return <>{customIcon}</>
    if (icon === "ai") return <Sparkles className="h-4 w-4" />
    return <HardDrive className="h-4 w-4" />
  }

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-2", className)}>
              <div className={cn("flex-shrink-0", getStatusColor())}>
                <IconComponent />
              </div>
              <div className="flex-1 min-w-0">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", getProgressColor())}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              {(isWarning || isCritical) && <AlertTriangle className={cn("h-3 w-3 flex-shrink-0", getStatusColor())} />}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">
                {formatValue(current)} / {formatValue(limit)} {unit} used ({percentage.toFixed(0)}%)
              </p>
              {isCritical && <p className="text-xs text-red-500">Storage critically low</p>}
              {isWarning && !isCritical && <p className="text-xs text-yellow-500">Approaching limit</p>}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-md bg-muted", getStatusColor())}>
            <IconComponent />
          </div>
          <span className="text-sm font-medium">{label}</span>
        </div>
        {(isWarning || isCritical) && (
          <div className={cn("flex items-center gap-1 text-xs", getStatusColor())}>
            <AlertTriangle className="h-3 w-3" />
            <span>{isCritical ? "Critical" : "Warning"}</span>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-300", getProgressColor())}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {formatValue(current)} {unit} of {formatValue(limit)} {unit}
          </span>
          <span className={cn(getStatusColor())}>{percentage.toFixed(0)}%</span>
        </div>
      </div>

      {isCritical && showUpgrade && (
        <div className="flex items-center justify-between p-2 rounded-md bg-red-500/10 border border-red-500/20">
          <span className="text-xs text-red-500">You've almost reached your limit</span>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs border-red-500/50 text-red-500 hover:bg-red-500/10 bg-transparent"
            onClick={onUpgrade}
          >
            <Zap className="h-3 w-3 mr-1" />
            Upgrade
          </Button>
        </div>
      )}

      {isWarning && !isCritical && showUpgrade && (
        <Button
          size="sm"
          variant="ghost"
          className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
          onClick={onUpgrade}
        >
          <Zap className="h-3 w-3 mr-1" />
          Upgrade for more {icon === "ai" ? "AI credits" : "storage"}
        </Button>
      )}
    </div>
  )
}

interface UsageMeterGroupProps {
  meters: Omit<UsageMeterProps, "onUpgrade">[]
  onUpgrade?: () => void
  className?: string
}

export function UsageMeterGroup({ meters, onUpgrade, className }: UsageMeterGroupProps) {
  const hasAnyCritical = meters.some((m) => (m.current / m.limit) * 100 >= (m.criticalThreshold || 90))

  return (
    <div className={cn("space-y-4", className)}>
      {meters.map((meter, index) => (
        <UsageMeter key={index} {...meter} onUpgrade={onUpgrade} showUpgrade={false} />
      ))}
      {hasAnyCritical && (
        <Button size="sm" className="w-full" onClick={onUpgrade}>
          <Zap className="h-4 w-4 mr-2" />
          Upgrade Plan
        </Button>
      )}
    </div>
  )
}
