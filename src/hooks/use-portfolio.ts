"use client"

import { useState, useEffect } from 'react'

export interface PortfolioBalances {
  usd: number
  sol: number
  sol_value_usd: number
  total_value_usd: number
}

export interface PortfolioPerformance {
  total_profit_loss_usd: number
  performance_24h_usd: number
  performance_24h_percent: number
}

export interface PortfolioTrade {
  id: string
  timestamp: string
  action: string
  amount: number
  price_usd: number
  wallet_balance_sol: number
  profit_loss_usd: number
}

export interface PerformanceHistoryPoint {
  date: string
  value: number
}

export interface Portfolio {
  username: string
  current_model: string | null
  owned_models: string[]
  balances: PortfolioBalances
  current_prices: {
    sol_usd: number
  }
  performance: PortfolioPerformance
  trades: PortfolioTrade[]
  total_trades: number
  performance_history: PerformanceHistoryPoint[]
}

interface UsePortfolioResult {
  portfolio: Portfolio | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const DEFAULT_USERNAME = "demo"

export function usePortfolio(): UsePortfolioResult {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPortfolio = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/user/portfolio?username=${DEFAULT_USERNAME}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch portfolio')
      }

      const data = await response.json()

      if (data.success && data.portfolio) {
        setPortfolio(data.portfolio)
      } else {
        throw new Error('Invalid portfolio data received')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error fetching portfolio:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPortfolio()
  }, [])

  return {
    portfolio,
    isLoading,
    error,
    refetch: fetchPortfolio,
  }
}
