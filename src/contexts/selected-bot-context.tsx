"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface BotTrade {
  action: string
  price: number
  timestamp: string
}

interface BotStats {
  updated_at: string
  hourly_pnl_usd: {
    value: number
    estimated: boolean
    basis: string
  }
  daily_pnl_usd: {
    value: number
    estimated: boolean
    basis: string
  }
  trades_hourly: {
    value: number
    estimated: boolean
    basis: string
  }
  win_rate_daily: {
    value: number
    estimated: boolean
    basis: string
  }
  samples: {
    ticks_lookback: number
    trips_total: number
    trips_1h: number
    trips_today: number
    open_buys: number
  }
  assumptions: {
    trade_size_SOL: number
    lookback_days_for_ticks: number
  }
}

export interface Bot {
  id: string
  name: string
  modelName: string
  category?: string
  description?: string
  architecture?: string
  monthlyPerformance?: number
  accuracy?: string
  mape?: number
  tags?: string[]
  userCount?: number
  totalTrades?: number
  ranking?: number
  totalBots?: number
  topPercentile?: number
  todaysTrades: BotTrade[]
  stats?: BotStats
}

interface SelectedBotContextType {
  selectedBot: Bot | null
  selectBot: (bot: Bot) => void
  deselectBot: () => void
  isUpdating: boolean
  isLoading: boolean
}

const SelectedBotContext = createContext<SelectedBotContextType | undefined>(undefined)

// Default username - in a real app, this would come from authentication
const DEFAULT_USERNAME = "demo"

export function SelectedBotProvider({ children }: { children: React.ReactNode }) {
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch the current model from the database on mount
  useEffect(() => {
    const fetchCurrentModel = async () => {
      try {
        // Fetch current user model
        const userResponse = await fetch(`/api/user/model?username=${DEFAULT_USERNAME}`)
        if (!userResponse.ok) {
          console.error('Failed to fetch user model')
          setIsLoading(false)
          return
        }

        const userData = await userResponse.json()
        const currentModelName = userData.user?.current_model

        // If no model is selected, we're done
        if (!currentModelName) {
          setIsLoading(false)
          return
        }

        // Fetch all available bots
        let bots = []
        try {
          const botsResponse = await fetch('/api/models')
          if (botsResponse.ok) {
            const botsData = await botsResponse.json()
            bots = botsData.models || []
          } else {
            // Fallback to static data
            const staticBotsModule = await import('@/data/bots.json')
            bots = staticBotsModule.default
          }
        } catch (error) {
          // Fallback to static data
          const staticBotsModule = await import('@/data/bots.json')
          bots = staticBotsModule.default
        }

        // Find the bot that matches the current model
        const matchingBot = bots.find((bot: Bot) => bot.modelName === currentModelName)

        if (matchingBot) {
          setSelectedBot(matchingBot)
        }
      } catch (error) {
        console.error('Error fetching current model:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentModel()
  }, [])

  const selectBot = async (bot: Bot) => {
    setIsUpdating(true)
    try {
      // Update local state
      setSelectedBot(bot)

      // Update the database with the new active model
      const response = await fetch('/api/user/model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: DEFAULT_USERNAME,
          modelName: bot.modelName,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to update model in database:', error)
      } else {
        const data = await response.json()
        console.log('Model updated successfully:', data)
      }
    } catch (error) {
      console.error('Error updating selected bot:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const deselectBot = async () => {
    setIsUpdating(true)
    try {
      // Update local state
      setSelectedBot(null)

      // Update the database to remove active model (set to null)
      const response = await fetch('/api/user/model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: DEFAULT_USERNAME,
          modelName: null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to deselect model in database:', error)
      } else {
        const data = await response.json()
        console.log('Model deselected successfully:', data)
      }
    } catch (error) {
      console.error('Error deselecting bot:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <SelectedBotContext.Provider value={{ selectedBot, selectBot, deselectBot, isUpdating, isLoading }}>
      {children}
    </SelectedBotContext.Provider>
  )
}

export function useSelectedBot() {
  const context = useContext(SelectedBotContext)
  if (context === undefined) {
    throw new Error("useSelectedBot must be used within a SelectedBotProvider")
  }
  return context
}
