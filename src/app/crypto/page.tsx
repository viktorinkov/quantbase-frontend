import { AppSidebar } from "@/components/app-sidebar"
import { CryptoChart } from "@/components/crypto-chart"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import cryptoData from "@/data/crypto-charts-data.json"

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
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              {cryptoData.map((crypto) => (
                <CryptoChart
                  key={crypto.id}
                  name={crypto.name}
                  symbol={crypto.symbol}
                  currentPrice={crypto.currentPrice}
                  priceChange24h={crypto.priceChange24h}
                  chartData={crypto.chartData}
                />
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
