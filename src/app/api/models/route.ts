import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

interface Tick {
  _id: string;
  timestamp: string;
  price_usd: number;
  action: string;
}

export async function GET() {
  try {
    const client = await clientPromise;

    const botsDb = client.db('bots_db');
    const solanaDb = client.db('solana_db');

    // Get all bots from bots_db
    const botsCollection = botsDb.collection('bots');
    const bots = await botsCollection.find({}).toArray();

    // Get today's start time (midnight UTC) - MongoDB best practice: use Date object, not ISO string
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

        // Fetch all of today's ticks from the referenced ticks collection
        // MongoDB stores dates as ISODate objects - query with Date object, not string
        const ticksCollection = solanaDb.collection(ticksRef);
        const todayTicksRaw = await ticksCollection
          .find({
            timestamp: { $gte: todayStart }
          })
          .sort({ timestamp: -1 }) // Sort by most recent first
          .toArray();

        const todayTicks = todayTicksRaw as unknown as Tick[];

        // Calculate daily performance for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Filter out invalid ticks - only include ticks with valid action, price, and timestamp
        const validTicks = todayTicks.filter((tick) =>
          tick.action &&
          typeof tick.price_usd === 'number' &&
          !isNaN(tick.price_usd) &&
          tick.timestamp
        );

        // Format today's ticks for display
        const todaysTradesFormatted = validTicks.map((tick) => ({
          action: tick.action,
          price: tick.price_usd,
          timestamp: tick.timestamp
        }));

        return {
          id: bot._id.toString(),
          name: displayName,
          modelName: modelName,
          todaysTrades: todaysTradesFormatted,
          stats: bot.stats || undefined
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
