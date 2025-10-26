import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    console.log('Attempting to connect to MongoDB...')
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || 'solana_db')
    console.log('Connected to MongoDB successfully')

    // Fetch Solana data from the ticks collection only
    const collection = db.collection('ticks')

    // Fetch all documents from the ticks collection and sort by timestamp
    const documents = await collection
      .find({})
      .sort({ timestamp: 1 })
      .toArray()

    console.log(`Ticks collection: ${documents.length} documents`)

    if (documents.length === 0) {
      return NextResponse.json([])
    }

    // Map the documents to chart data format
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

    // Return Solana data only
    const cryptoData = [{
      id: 'solana',
      name: 'Solana',
      symbol: 'SOL',
      currentPrice: latestPrice,
      priceChange24h: priceChange24h,
      chartData: chartData,
    }]

    console.log(`Returning Solana crypto data`)

    return NextResponse.json(cryptoData)
  } catch (error) {
    console.error('Error fetching crypto data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch crypto data', details: errorMessage },
      { status: 500 }
    )
  }
}

