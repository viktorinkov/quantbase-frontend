"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { BotCard } from "@/components/bot-card"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import type { Bot } from "@/contexts/selected-bot-context"

export default function Page() {
  const [bots, setBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch('/api/models')
        if (!response.ok) {
          throw new Error('Failed to fetch models')
        }
        const data = await response.json()
        setBots(data.models || [])
      } catch (err) {
        console.error('Error fetching models:', err)
        setError(err instanceof Error ? err.message : 'Failed to load models')
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <div className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight">Bot Marketplace</h1>
                <p className="text-muted-foreground mt-2">
                  Discover and deploy automated trading bots
                </p>
              </div>
              {loading && (
                <div className="text-center py-8 text-muted-foreground">
                  Loading models...
                </div>
              )}
              {error && (
                <div className="text-center py-8 text-destructive">
                  Error: {error}
                </div>
              )}
              {!loading && !error && bots.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No models available
                </div>
              )}
              <div className="grid gap-6">
                {bots.map((bot) => (
                  <BotCard
                    key={bot.id}
                    id={bot.id}
                    name={bot.name}
                    modelName={bot.modelName}
                    todaysTrades={bot.todaysTrades}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
