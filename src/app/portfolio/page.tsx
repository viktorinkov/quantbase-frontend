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

import portfolioData from "@/data/portfolio-data.json"

export default function Page() {
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
              <PortfolioSectionCards summary={portfolioData.summary} />
              <div className="px-4 lg:px-6">
                <PortfolioPerformanceChart performanceHistory={portfolioData.performanceHistory} />
              </div>
              <CryptoTradesTable data={portfolioData.trades} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
