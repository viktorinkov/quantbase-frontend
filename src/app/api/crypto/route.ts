import { NextResponse } from 'next/server'

// CoinGecko API mapping for crypto IDs
// SUI is placed first as our sponsor
const CRYPTO_IDS = {
  SUI: 'sui',
  BTC: 'bitcoin',
  ETH: 'ethereum', 
  SOL: 'solana',
  XRP: 'ripple',
} as const

const CRYPTO_NAMES = {
  SUI: 'Sui',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  SOL: 'Solana',
  XRP: 'Ripple', 
} as const

// Simple in-memory cache to avoid hitting rate limits
let cachedData: any = null
let lastFetch = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET() {
  try {
    // Check if we have fresh cached data
    const now = Date.now()
    if (cachedData && (now - lastFetch) < CACHE_DURATION) {
      console.log('Returning cached crypto data')
      return NextResponse.json(cachedData)
    }

    console.log('Fetching live crypto data from CoinGecko...')
    
    // Fetch current prices and 24h data for all cryptos
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
      if (currentPricesResponse.status === 429) {
        // Rate limited - return cached data if available, otherwise fallback
        if (cachedData) {
          console.log('Rate limited, returning cached data')
          return NextResponse.json(cachedData)
        }
        throw new Error('Rate limited and no cached data available')
      }
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

    // Cache the result
    cachedData = cryptoData
    lastFetch = now

    console.log(`Returning ${cryptoData.length} cryptocurrencies with live data`)
    return NextResponse.json(cryptoData)
    
  } catch (error) {
    console.error('Error fetching crypto data:', error)
    
    // If we have cached data, return it as fallback
    if (cachedData) {
      console.log('Error occurred, returning cached data as fallback')
      return NextResponse.json(cachedData)
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch crypto data', details: errorMessage },
      { status: 500 }
    )
  }
}

