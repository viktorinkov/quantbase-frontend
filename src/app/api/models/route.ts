import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

interface Trade {
  timestamp: string;
  price_usd: number;
  action: string;
  profit_loss_usd: number;
}

export async function GET() {
  try {
    const client = await clientPromise;

    const botsDb = client.db('bots_db');
    const solanaDb = client.db('solana_db');

    // Get all bots from bots_db
    const botsCollection = botsDb.collection('bots');
    const bots = await botsCollection.find({}).toArray();

    // Get today's start time (midnight UTC)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    // Map bots and fetch their today's trades
    const models = await Promise.all(
      bots.map(async (bot) => {
        const modelName = bot.model_name;
        const ticksRef = bot.ticks_ref;

        // Convert model_name to display name
        // e.g., "momentum" -> "Momentum", "mean_reversion" -> "Mean Reversion"
        const displayName = modelName
          .split('_')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        // Fetch today's trades from the referenced ticks collection
        const ticksCollection = solanaDb.collection(ticksRef);
        const todayTradesRaw = await ticksCollection
          .find({
            timestamp: { $gte: todayStart.toISOString() },
            action: { $in: ['BUY', 'SELL'] } // Only actual trades, not WARMUP
          })
          .sort({ profit_loss_usd: -1 }) // Sort by profit descending
          .limit(3)
          .toArray();

        const todayTrades = todayTradesRaw as unknown as Trade[];

        // Calculate daily performance for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentTradesRaw = await ticksCollection
          .find({
            timestamp: { $gte: sevenDaysAgo.toISOString() }
          })
          .sort({ timestamp: 1 })
          .toArray();

        const recentTrades = recentTradesRaw as unknown as Trade[];

        // Group trades by day and calculate daily performance
        const dailyPerformanceMap = new Map<string, number>();
        recentTrades.forEach((trade) => {
          const date = new Date(trade.timestamp).toISOString().split('T')[0];
          const currentProfit = dailyPerformanceMap.get(date) || 0;
          dailyPerformanceMap.set(date, currentProfit + trade.profit_loss_usd);
        });

        const dailyPerformance = Array.from(dailyPerformanceMap.entries()).map(([date, profit]) => ({
          date,
          performance: profit
        }));

        // Format today's trades
        const todaysTradesFormatted = todayTrades.map((trade) => ({
          pair: 'SOL/USD', // Based on the data structure showing price_usd
          profit: trade.profit_loss_usd,
          timestamp: trade.timestamp
        }));

        return {
          id: bot._id.toString(),
          name: displayName,
          modelName: modelName,
          dailyPerformance,
          todaysTradesToday: todaysTradesFormatted
        };
      })
    );

    return NextResponse.json({
      success: true,
      models,
      count: models.length
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models from database' },
      { status: 500 }
    );
  }
}
