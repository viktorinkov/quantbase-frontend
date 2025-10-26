"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { CryptoTradesTable } from "@/components/crypto-trades-table"
import { PortfolioPerformanceChart } from "@/components/portfolio-performance-chart"
import { PortfolioSectionCards } from "@/components/portfolio-section-cards"
import { SelectedBotInfo } from "@/components/selected-bot-info"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { usePortfolio } from "@/hooks/use-portfolio"

import portfolioData from "@/data/portfolio-data.json"

export default function Page() {
  const { portfolio, isLoading, error } = usePortfolio()

  // Transform portfolio data to match the existing component structure
  const summary = portfolio ? {
    totalValue: portfolio.balances.total_value_usd,
    totalValueChange: portfolio.performance.performance_24h_percent,
    totalTrades: portfolio.total_trades,
    tradesThisMonth: portfolio.trades.length, // Last 50 trades as proxy
    totalProfitLoss: portfolio.performance.total_profit_loss_usd,
    profitLossPercent: (portfolio.performance.total_profit_loss_usd / portfolio.balances.total_value_usd) * 100,
    winRate: portfolioData.summary.winRate, // Use mock data for now
    winRateChange: portfolioData.summary.winRateChange, // Use mock data for now
  } : portfolioData.summary

  // Transform trades data
  const trades = portfolio?.trades.map((trade, index) => {
    const amount = trade.amount || 0
    const priceUsd = trade.price_usd || 0
    return {
      id: index + 1, // Use index as numeric ID
      date: new Date(trade.timestamp).toLocaleDateString(),
      time: new Date(trade.timestamp).toLocaleTimeString(),
      cryptocurrency: `Solana (SOL)`,
      type: trade.action === 'BUY' ? 'Buy' : trade.action === 'SELL' ? 'Sell' : 'Hold',
      amount: amount.toFixed(4),
      price: priceUsd.toFixed(2),
      total: (amount * priceUsd).toFixed(2),
    }
  }) || portfolioData.trades

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
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SelectedBotInfo />
              {isLoading ? (
                <div className="px-4 py-8 text-center text-muted-foreground lg:px-6">
                  Loading portfolio data...
                </div>
              ) : error ? (
                <div className="px-4 py-8 text-center text-destructive lg:px-6">
                  Error loading portfolio: {error}
                </div>
              ) : (
                <>
                  <PortfolioSectionCards summary={summary} />
                  <div className="px-4 lg:px-6">
                    <PortfolioPerformanceChart
                      performanceHistory={portfolio?.performance_history || portfolioData.performanceHistory}
                    />
                  </div>
                  <CryptoTradesTable data={trades} />
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
