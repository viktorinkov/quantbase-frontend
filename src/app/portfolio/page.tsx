"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { PortfolioBalances } from "@/components/portfolio-balances"
import { PortfolioHistoryChart } from "@/components/portfolio-history-chart"
import { PortfolioTradesTable } from "@/components/portfolio-trades-table"
import { ModelSwitchingHistory } from "@/components/model-switching-history"
import { SelectedBotInfo } from "@/components/selected-bot-info"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { usePortfolio } from "@/hooks/use-portfolio"

export default function Page() {
  const { portfolio, isLoading, error } = usePortfolio()
  const [activeModels, setActiveModels] = useState<Record<string, string>>({})
  const [userDataLoading, setUserDataLoading] = useState(true)

  // Fetch user data for active_models
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/model?username=demo')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user?.active_models) {
            setActiveModels(data.user.active_models)
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
      } finally {
        setUserDataLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Calculate trading start date from first trade
  const tradingStartDate = portfolio?.trades && portfolio.trades.length > 0
    ? portfolio.trades[portfolio.trades.length - 1].timestamp
    : undefined

  const isLoadingData = isLoading || userDataLoading

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
              {isLoadingData ? (
                <div className="px-4 py-8 text-center text-muted-foreground lg:px-6">
                  Loading portfolio data...
                </div>
              ) : error ? (
                <div className="px-4 py-8 text-center text-destructive lg:px-6">
                  Error loading portfolio: {error}
                </div>
              ) : (
                <>
                  <PortfolioBalances balances={portfolio?.balances} />
                  {portfolio?.performance_history && portfolio.performance_history.length > 0 && (
                    <div className="px-4 lg:px-6">
                      <PortfolioHistoryChart history={portfolio.performance_history} />
                    </div>
                  )}

                  {/* Tabs for Trading History and Model History */}
                  <Tabs defaultValue="trades" className="w-full px-4 lg:px-6">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                      <TabsTrigger value="trades">Trading History</TabsTrigger>
                      <TabsTrigger value="models">Model History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="trades" className="mt-6 px-0">
                      {portfolio?.trades && portfolio.trades.length > 0 ? (
                        <PortfolioTradesTable
                          trades={portfolio.trades}
                          tradingStartDate={tradingStartDate}
                        />
                      ) : (
                        <div className="py-12 text-center text-muted-foreground">
                          No trades yet. Start trading to see your history here.
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="models" className="mt-6 px-0">
                      {Object.keys(activeModels).length > 0 ? (
                        <ModelSwitchingHistory activeModels={activeModels} />
                      ) : (
                        <div className="py-12 text-center text-muted-foreground">
                          No model switching history available.
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
