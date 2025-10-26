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
import botsData from "@/data/bots.json"

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
    window: number
    k_sigma: number
    risk_factor: number
    base_trade_size: number
  }
}

export default function Page() {
  const [bots, setBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBots() {
      try {
        // Filter for trading models only from our static data
        const tradingModels = botsData.filter(bot => bot.category === "trading")
        
        // Convert to Bot format
        const convertedBots: Bot[] = tradingModels.map((bot: any) => ({
          id: bot.id,
          name: bot.name,
          modelName: bot.modelName,
          image: bot.image,
          todaysTrades: bot.todaysTrades || [],
          stats: {
            updated_at: new Date().toISOString(),
            hourly_pnl_usd: {
              value: bot.monthlyPerformance / 30 / 24, // Convert monthly to hourly estimate
              estimated: true,
              basis: "Historical performance"
            },
            daily_pnl_usd: {
              value: bot.monthlyPerformance / 30, // Convert monthly to daily estimate
              estimated: true,
              basis: "Historical performance"
            },
            trades_hourly: {
              value: bot.totalTrades / 30 / 24, // Convert total to hourly estimate
              estimated: true,
              basis: "Historical data"
            },
            win_rate_daily: {
              value: parseFloat(bot.accuracy.replace('%', '')) / 100, // Convert accuracy to decimal
              estimated: true,
              basis: "Model accuracy"
            },
            samples: {
              ticks_lookback: 1000,
              trips_total: bot.totalTrades,
              trips_1h: Math.round(bot.totalTrades / 30 / 24),
              trips_today: Math.round(bot.totalTrades / 30),
              open_buys: 0
            },
            assumptions: {
              trade_size_SOL: 0.1,
              lookback_days_for_ticks: 30
            },
            // Additional fields for enhanced display
            monthlyPerformance: bot.monthlyPerformance,
            totalVolume: bot.totalVolume,
            userCount: bot.userCount,
            totalTrades: bot.totalTrades,
            ranking: bot.ranking,
            totalBots: bot.totalBots,
            topPercentile: bot.topPercentile,
            mape: bot.mape,
            accuracy: bot.accuracy,
            tags: bot.tags,
            dailyPerformance: bot.dailyPerformance,
            architecture: bot.architecture,
            description: bot.description
          } as any
        }))
        
        setBots(convertedBots)
      } catch (err) {
        console.error('Error loading trading models:', err)
        setError(err instanceof Error ? err.message : 'Failed to load trading models')
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
        image: newBot.image, // Use bot's stored image
        todaysTrades: []
      }
      
      setBots(prev => [...prev, botWithDefaults])
      console.log('New bot created:', botWithDefaults)

      // Refresh the bot list to ensure consistency with MongoDB
      const response = await fetch('/api/bots')
      if (response.ok) {
        const data = await response.json()

        // If backend returns empty array, fetch from MongoDB models instead
        if (!Array.isArray(data) || data.length === 0) {
          const modelsResponse = await fetch('/api/models')
          if (modelsResponse.ok) {
            const modelsData = await modelsResponse.json()
            setBots(modelsData.models || [])
          }
        } else {
          const convertedBots: Bot[] = data.map((bot: any) => ({
            id: bot.id,
            name: bot.name,
            modelName: bot.name,
            image: bot.image, // Use bot's stored image
            todaysTrades: bot.todaysTrades || [],
            stats: bot.stats
          }))
          setBots(convertedBots)
        }
      } else {
        // Fallback to MongoDB models if backend fails
        const modelsResponse = await fetch('/api/models')
        if (modelsResponse.ok) {
          const modelsData = await modelsResponse.json()
          setBots(modelsData.models || [])
        }
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
                    <h1 className="text-3xl font-bold tracking-tight">Trading Models Marketplace</h1>
                    <p className="text-muted-foreground mt-2">
                      Discover and deploy automated trading bots for live trading
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
                    image={bot.image}
                    todaysTrades={bot.todaysTrades}
                    stats={bot.stats}
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
