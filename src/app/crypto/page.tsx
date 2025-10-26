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

// CoinGecko API mapping for crypto IDs (duplicated from API route for direct access)
const CRYPTO_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  XRP: 'ripple',
  SOL: 'solana',
  SUI: 'sui',
} as const

const CRYPTO_NAMES = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  XRP: 'Ripple',
  SOL: 'Solana',
  SUI: 'Sui',
} as const

async function getCryptoData(): Promise<CryptoData[]> {
  try {
    console.log('Fetching live crypto data from CoinGecko...')

    // Directly fetch from CoinGecko API instead of going through our API route
    const cryptoIds = Object.values(CRYPTO_IDS).join(',')
    const currentPricesUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=usd&include_24hr_change=true`

    const currentPricesResponse = await fetch(currentPricesUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'QuantBase/1.0',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!currentPricesResponse.ok) {
      throw new Error(`CoinGecko API error: ${currentPricesResponse.status}`)
    }

    const currentPricesData = await currentPricesResponse.json()
    console.log('Current prices fetched successfully')

    // Generate sample historical data based on current prices (for demo purposes)
    const cryptoData = []

    for (const [symbol, coinId] of Object.entries(CRYPTO_IDS)) {
      const priceData = currentPricesData[coinId]
      if (!priceData) continue

      const currentPrice = priceData.usd || 0
      const priceChange24h = priceData.usd_24h_change || 0

      // Generate realistic historical data for the last 7 days
      const chartData = []
      const now = new Date()
      const startPrice = currentPrice / (1 + (priceChange24h / 100)) // Calculate starting price

      for (let i = 168; i >= 0; i--) { // 168 hours = 7 days
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
        // Generate price with realistic volatility and trend
        const progress = (168 - i) / 168
        const volatility = 0.02 + Math.random() * 0.01 // 2-3% volatility
        const randomChange = (Math.random() - 0.5) * volatility
        const trendChange = (priceChange24h / 100) * progress * 0.5 // Half the 24h change spread over time
        const price = startPrice * (1 + trendChange + randomChange)

        chartData.push({
          date: timestamp.toISOString(),
          price: Math.max(price, 0.0001), // Ensure positive price
        })
      }

      cryptoData.push({
        id: coinId,
        name: CRYPTO_NAMES[symbol as keyof typeof CRYPTO_NAMES],
        symbol: symbol,
        currentPrice: currentPrice,
        priceChange24h: priceChange24h,
        chartData: chartData,
      })

      console.log(`Processed ${symbol}: $${currentPrice.toFixed(4)} (${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}%)`)
    }

    console.log(`Returning ${cryptoData.length} cryptocurrencies with live data`)
    return cryptoData

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
