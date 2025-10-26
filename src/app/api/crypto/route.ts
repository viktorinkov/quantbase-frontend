import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    console.log('Attempting to connect to MongoDB...')
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || 'solana-data')
    console.log('Connected to MongoDB successfully')

    // Get all collections in the database
    const collections = await db.listCollections().toArray()
    console.log(`Found ${collections.length} collections:`, collections.map(c => c.name))

    // Fetch data from all collections
    const cryptoData = await Promise.all(
      collections.map(async (collectionInfo) => {
        const collectionName = collectionInfo.name
        const collection = db.collection(collectionName)

        // Fetch all documents from the collection and sort by timestamp/date
        const documents = await collection
          .find({})
          .sort({ timestamp: 1, date: 1 })
          .toArray()

        console.log(`Collection ${collectionName}: ${documents.length} documents`)

        if (documents.length === 0) {
          return null
        }

        // Map the documents to chart data format
        // Support both 'timestamp' and 'date' fields
        const chartData = documents.map((doc) => {
          const dateValue = doc.timestamp || doc.date
          // Ensure the date is in ISO string format
          const dateStr = dateValue instanceof Date
            ? dateValue.toISOString()
            : typeof dateValue === 'string'
              ? dateValue
              : new Date(dateValue).toISOString()

          return {
            date: dateStr,
            price: doc.price_usd || doc.price || 0,
          }
        })

        // Get the latest document for current price and calculate 24h change
        const latestDoc = documents[documents.length - 1]

        // Try to find a document from ~24 hours ago for better price change calculation
        const now = new Date(latestDoc.timestamp || latestDoc.date).getTime()
        const oneDayAgo = now - (24 * 60 * 60 * 1000)

        // Find the closest document to 24 hours ago
        let compareDoc = documents[0]
        for (const doc of documents) {
          const docTime = new Date(doc.timestamp || doc.date).getTime()
          if (docTime <= oneDayAgo) {
            compareDoc = doc
          } else {
            break
          }
        }

        // If we don't have 24h of data, compare with first available document
        if (compareDoc === latestDoc && documents.length > 1) {
          compareDoc = documents[0]
        }

        const latestPrice = latestDoc.price_usd || latestDoc.price || 0
        const comparePrice = compareDoc.price_usd || compareDoc.price || 0
        const priceChange24h = comparePrice && latestPrice
          ? ((latestPrice - comparePrice) / comparePrice) * 100
          : 0

        // Determine the crypto name and symbol from collection name
        const cryptoInfo = getCryptoInfo(collectionName)

        return {
          id: collectionName.toLowerCase(),
          name: cryptoInfo.name,
          symbol: cryptoInfo.symbol,
          currentPrice: latestPrice,
          priceChange24h: priceChange24h,
          chartData: chartData,
        }
      })
    )

    // Filter out null entries and return
    const validCryptoData = cryptoData.filter((item) => item !== null)
    console.log(`Returning ${validCryptoData.length} crypto datasets`)

    return NextResponse.json(validCryptoData)
  } catch (error) {
    console.error('Error fetching crypto data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch crypto data', details: errorMessage },
      { status: 500 }
    )
  }
}

// Helper function to map collection names to crypto info
function getCryptoInfo(collectionName: string): { name: string; symbol: string } {
  const lowerName = collectionName.toLowerCase()

  // Map known cryptocurrencies
  const cryptoMap: Record<string, { name: string; symbol: string }> = {
    solana: { name: 'Solana', symbol: 'SOL' },
    bitcoin: { name: 'Bitcoin', symbol: 'BTC' },
    ethereum: { name: 'Ethereum', symbol: 'ETH' },
    cardano: { name: 'Cardano', symbol: 'ADA' },
    sol: { name: 'Solana', symbol: 'SOL' },
    btc: { name: 'Bitcoin', symbol: 'BTC' },
    eth: { name: 'Ethereum', symbol: 'ETH' },
    ada: { name: 'Cardano', symbol: 'ADA' },
    ticks: { name: 'Solana', symbol: 'SOL' }, // Default ticks collection to Solana
  }

  // Check if the collection name matches a known crypto
  for (const [key, value] of Object.entries(cryptoMap)) {
    if (lowerName.includes(key)) {
      return value
    }
  }

  // Default: capitalize the collection name and use first 3 letters as symbol
  return {
    name: collectionName.charAt(0).toUpperCase() + collectionName.slice(1),
    symbol: collectionName.slice(0, 3).toUpperCase(),
  }
}
