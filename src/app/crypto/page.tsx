import { AppSidebar } from "@/components/app-sidebar"
import { CryptoChart } from "@/components/crypto-chart"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

interface CryptoData {
  id: string
  name: string
  symbol: string
  currentPrice: number
  priceChange24h: number
  chartData: Array<{ date: string; price: number }>
}

async function getCryptoData(): Promise<CryptoData[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/crypto`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error('Failed to fetch crypto data')
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching crypto data:', error)
    return []
  }
}

export default async function Page() {
  const cryptoData = await getCryptoData()

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
              {cryptoData.length > 0 ? (
                cryptoData.map((crypto) => (
                  <CryptoChart
                    key={crypto.id}
                    name={crypto.name}
                    symbol={crypto.symbol}
                    currentPrice={crypto.currentPrice}
                    priceChange24h={crypto.priceChange24h}
                    chartData={crypto.chartData}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">No crypto data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
