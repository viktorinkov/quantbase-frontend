"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface TopWin {
  pair: string
  profit: number
  timestamp: string
}

interface DailyPerformance {
  date: string
  performance: number
}

interface Creator {
  username: string
  avatar: string
}

export interface Bot {
  id: string
  name: string
  image: string
  creator: Creator
  monthlyPerformance: number
  totalVolume: number
  userCount: number
  dailyPerformance: DailyPerformance[]
  topWinsToday: TopWin[]
}

interface SelectedBotContextType {
  selectedBot: Bot | null
  selectBot: (bot: Bot) => void
  deselectBot: () => void
}

const SelectedBotContext = createContext<SelectedBotContextType | undefined>(undefined)

export function SelectedBotProvider({ children }: { children: React.ReactNode }) {
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null)

  // Load selected bot from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("selectedBot")
    if (stored) {
      try {
        setSelectedBot(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse stored bot", e)
      }
    }
  }, [])

  const selectBot = (bot: Bot) => {
    setSelectedBot(bot)
    localStorage.setItem("selectedBot", JSON.stringify(bot))
  }

  const deselectBot = () => {
    setSelectedBot(null)
    localStorage.removeItem("selectedBot")
  }

  return (
    <SelectedBotContext.Provider value={{ selectedBot, selectBot, deselectBot }}>
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
