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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

  // Filter bots by category
  const tradingBots = bots.filter(bot => bot.category === 'trading')
  const forecastingBots = bots.filter(bot => bot.category === 'forecasting')

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
            todaysTrades: bot.todaysTrades || [],
            stats: bot.stats
          }))
          setBots(convertedBots)
        } else {
          // Fallback to static data if backend is not available
          const staticBotsModule = await import('@/data/bots.json')
          const staticBots = staticBotsModule.default
          setBots(staticBots)
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
        todaysTrades: []
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
          todaysTrades: bot.todaysTrades || [],
          stats: bot.stats
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
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Model Marketplace</h1>
                    <p className="text-muted-foreground mt-2">
                      Discover and deploy automated models from top creators
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

              {!loading && !error && bots.length > 0 && (
                <Tabs defaultValue="forecasting" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="forecasting" className="flex items-center gap-2">
                      <span>🔮</span>
                      Forecasting Models
                      <span className="ml-1 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                        {forecastingBots.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="trading" className="flex items-center gap-2">
                      <span>📈</span>
                      Trading Models
                      <span className="ml-1 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                        {tradingBots.length}
                      </span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="forecasting" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">AI/ML Forecasting Models</h3>
                          <p className="text-sm text-muted-foreground">
                            Advanced machine learning models for price prediction and market forecasting
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-6">
                        {forecastingBots.map((bot, index) => (
                          <BotCard
                            key={bot.id}
                            id={bot.id}
                            name={bot.name}
                            modelName={bot.modelName}
                            description={bot.description}
                            architecture={bot.architecture}
                            monthlyPerformance={bot.monthlyPerformance}
                            accuracy={bot.accuracy}
                            mape={bot.mape}
                            tags={bot.tags}
                            userCount={bot.userCount}
                            totalTrades={bot.totalTrades}
                            ranking={bot.ranking}
                            totalBots={bot.totalBots}
                            topPercentile={bot.topPercentile}
                            todaysTrades={bot.todaysTrades}
                            stats={bot.stats}
                            index={index}
                          />
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="trading" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Algorithmic Trading Models</h3>
                          <p className="text-sm text-muted-foreground">
                            Classic trading strategies with proven track records and systematic execution
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-6">
                        {tradingBots.map((bot, index) => (
                          <BotCard
                            key={bot.id}
                            id={bot.id}
                            name={bot.name}
                            modelName={bot.modelName}
                            description={bot.description}
                            architecture={bot.architecture}
                            monthlyPerformance={bot.monthlyPerformance}
                            accuracy={bot.accuracy}
                            mape={bot.mape}
                            tags={bot.tags}
                            userCount={bot.userCount}
                            totalTrades={bot.totalTrades}
                            ranking={bot.ranking}
                            totalBots={bot.totalBots}
                            topPercentile={bot.topPercentile}
                            todaysTrades={bot.todaysTrades}
                            stats={bot.stats}
                            index={index}
                          />
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
