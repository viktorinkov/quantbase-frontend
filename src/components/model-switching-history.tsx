"use client"

import * as React from "react"
import { IconClock, IconRobot } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"

interface ModelSwitch {
  timestamp: string
  modelName: string
  isDeselection: boolean
}

interface ModelSwitchingHistoryProps {
  activeModels: Record<string, string>
}

// Format date to readable string
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 30) {
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  } else if (diffMins > 0) {
    return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`
  } else {
    return "Just now"
  }
}

// Format model name for display
function formatModelName(modelName: string | undefined | null): string {
  if (!modelName || modelName === "no_model") return "No Model"

  return modelName
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function ModelSwitchingHistory({ activeModels }: ModelSwitchingHistoryProps) {
  // Convert active_models object to sorted array
  const modelSwitches = React.useMemo((): ModelSwitch[] => {
    if (!activeModels || Object.keys(activeModels).length === 0) {
      return []
    }

    return Object.entries(activeModels)
      .filter(([_, modelName]) => {
        // Filter out malformed entries (objects instead of strings)
        return typeof modelName === 'string'
      })
      .map(([timestamp, modelName]) => {
        // Handle both Unix timestamp (milliseconds) and ISO string formats
        const parsedTimestamp = parseInt(timestamp)
        const date = isNaN(parsedTimestamp) ? new Date(timestamp) : new Date(parsedTimestamp)

        return {
          timestamp: date.toISOString(),
          modelName: modelName || "no_model",
          isDeselection: !modelName || modelName === "no_model"
        }
      })
      .filter(item => {
        const itemDate = new Date(item.timestamp)
        // Filter out invalid dates
        return !isNaN(itemDate.getTime())
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [activeModels])

  if (modelSwitches.length === 0) {
    return null
  }

  const currentModel = modelSwitches[0]

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div>
        <h2 className="text-2xl font-semibold">Model Switching History</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Timeline of your active model changes
        </p>
      </div>

      {/* Current Model Card */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <IconRobot className="size-5 text-primary" />
          <h3 className="text-lg font-semibold">Currently Active</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {formatModelName(currentModel.modelName)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Active since {formatDate(currentModel.timestamp)}
            </div>
          </div>
          <Badge variant={currentModel.isDeselection ? "secondary" : "default"} className="text-sm">
            {currentModel.isDeselection ? "Inactive" : "Active"}
          </Badge>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <IconClock className="size-4" />
            Switch History
          </h3>
        </div>
        <div className="divide-y max-h-96 overflow-y-auto">
          {modelSwitches.map((modelSwitch, index) => {
            const isFirst = index === 0
            const isPrevious = index === 1

            return (
              <div
                key={`${modelSwitch.timestamp}-${modelSwitch.modelName}`}
                className={`p-4 flex items-center justify-between transition-colors ${
                  isFirst ? "bg-muted/50" : "hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`size-3 rounded-full ${
                    isFirst
                      ? "bg-primary animate-pulse"
                      : isPrevious
                      ? "bg-primary/50"
                      : "bg-muted-foreground/30"
                  }`} />
                  <div>
                    <div className="font-medium">
                      {formatModelName(modelSwitch.modelName)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(modelSwitch.timestamp)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">
                    {formatRelativeTime(modelSwitch.timestamp)}
                  </div>
                  {isFirst && (
                    <Badge variant={modelSwitch.isDeselection ? "secondary" : "default"} className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Total Switches</div>
          <div className="text-2xl font-bold">{modelSwitches.length}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Unique Models</div>
          <div className="text-2xl font-bold">
            {new Set(modelSwitches.map(s => s.modelName).filter(m => m !== "no_model")).size}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">First Switch</div>
          <div className="text-sm font-medium mt-1">
            {formatDate(modelSwitches[modelSwitches.length - 1].timestamp)}
          </div>
        </div>
      </div>
    </div>
  )
}
