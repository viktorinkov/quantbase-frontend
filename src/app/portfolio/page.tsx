"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { PortfolioBalances } from "@/components/portfolio-balances"
import { PortfolioHistoryChart } from "@/components/portfolio-history-chart"
import { SelectedBotInfo } from "@/components/selected-bot-info"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { usePortfolio } from "@/hooks/use-portfolio"

export default function Page() {
  const { portfolio, isLoading, error } = usePortfolio()

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
                  <PortfolioBalances balances={portfolio?.balances} />
                  {portfolio?.performance_history && portfolio.performance_history.length > 0 && (
                    <div className="px-4 lg:px-6">
                      <PortfolioHistoryChart history={portfolio.performance_history} />
                    </div>
                  )}
                </>
              )}
            </div>
            </>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
