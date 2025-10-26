"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { BotCard } from "@/components/bot-card"
import { SiteHeader } from "@/components/site-header"
import { CreateBotDialog } from "@/components/create-bot-dialog"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import type { Bot } from "@/contexts/selected-bot-context"

interface NewBot {
  id: string
  name: string
  description: string
  image: string
  creator: {
    username: string
    avatar: string
  }
  parameters: {
    kSig: number
    window: number
    stopLoss: number
    takeProfit: number
    positionSize: number
    riskLevel: 'conservative' | 'moderate' | 'aggressive'
    tradingHours: '24/7' | 'market-hours' | 'custom'
    customHours?: string
  }
}

export default function Page() {
  const [bots, setBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBots() {
      try {
        // Try to fetch bots from backend API first
        const response = await fetch('/api/bots')
        if (response.ok) {
          const data = await response.json()
          // Convert backend bot format to frontend format
          const convertedBots: Bot[] = data.map((bot: any) => ({
            id: bot.id,
            name: bot.name,
            modelName: bot.name, // Use name as modelName for now
            dailyPerformance: [], // TODO: Add performance data from backend
            todaysTradesToday: [] // TODO: Add trades data from backend
          }))
          setBots(convertedBots)
        } else {
          // Fallback to static data if backend is not available
          const staticResponse = await fetch('/api/models')
          if (!staticResponse.ok) {
            throw new Error('Failed to fetch models')
          }
          const staticData = await staticResponse.json()
          setBots(staticData.models || [])
        }
      } catch (err) {
        console.error('Error fetching bots:', err)
        setError(err instanceof Error ? err.message : 'Failed to load bots')
      } finally {
        setLoading(false)
      }
    }

    fetchBots()
  }, [])

  const handleCreateBot = async (newBot: NewBot) => {
    try {
      // Add the new bot to the marketplace immediately for better UX
      const botWithDefaults: Bot = {
        ...newBot,
        modelName: newBot.name,
        dailyPerformance: [],
        todaysTradesToday: []
      }
      
      setBots(prev => [...prev, botWithDefaults])
      console.log('New bot created:', botWithDefaults)
      
      // Refresh the bot list to ensure consistency with backend
      const response = await fetch('/api/bots')
      if (response.ok) {
        const data = await response.json()
        const convertedBots: Bot[] = data.map((bot: any) => ({
          id: bot.id,
          name: bot.name,
          modelName: bot.name,
          dailyPerformance: [],
          todaysTradesToday: []
        }))
        setBots(convertedBots)
      }
    } catch (error) {
      console.error('Error handling bot creation:', error)
    }
  }

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
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bot Marketplace</h1>
                    <p className="text-muted-foreground mt-2">
                      Discover and deploy automated trading bots from top creators
                    </p>
                  </div>
                  <CreateBotDialog onCreateBot={handleCreateBot} />
                </div>
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
                {bots.map((bot, index) => (
                  <BotCard
                    key={bot.id}
                    id={bot.id}
                    name={bot.name}
                    modelName={bot.modelName}
                    todaysTrades={bot.todaysTrades}
                    index={index}
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
