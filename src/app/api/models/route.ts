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
    const customBotsDb = client.db('custom_bots_db');
    const solanaDb = client.db('solana_db');

    // Get all bots from both bots_db and custom_bots_db
    const botsCollection = botsDb.collection('bots');
    const customBotsCollection = customBotsDb.collection('bots');

    // Fetch from both collections in parallel, handle if custom_bots_db doesn't exist
    let standardBots: any[] = [];
    let customBots: any[] = [];

    try {
      [standardBots, customBots] = await Promise.all([
        botsCollection.find({}).toArray(),
        customBotsCollection.find({}).toArray().catch(err => {
          console.log('custom_bots_db might not exist yet, using empty array');
          return [];
        })
      ]);
    } catch (error) {
      console.error('Error fetching bots:', error);
      // Try to at least get standard bots
      standardBots = await botsCollection.find({}).toArray();
    }

    console.log('Standard bots found:', standardBots.length);
    console.log('Custom bots found:', customBots.length);

    // Combine bots and mark their source
    const allBots = [
      ...standardBots.map(bot => ({ ...bot, source: 'standard' })),
      ...customBots.map(bot => ({ ...bot, source: 'custom' }))
    ] as any[];

    console.log('Total bots after combining:', allBots.length);

    // Get today's start time (midnight UTC) - MongoDB best practice: use Date object, not ISO string
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    // Map bots and fetch their today's trades
    const models = await Promise.all(
      allBots.map(async (bot) => {
        // Handle different schemas between bots_db and custom_bots_db
        let modelName: string;
        let ticksRef: string;
        let displayName: string;
        let baseTradeSize = 0.0001; // Default fallback

        if (bot.source === 'custom') {
          // Custom bot schema: has 'name', 'model_type', and 'parameters.base_trade_size'
          // Use the bot's name as the modelName for custom bots
          modelName = bot.name.toLowerCase().replace(/\s+/g, '_');
          displayName = bot.name; // Use the custom bot's name directly

          // For ticks reference, use the model_type to determine which collection to use
          const baseModelType = bot.model_type || 'mean_reversion';
          ticksRef = `${baseModelType}_ticks`; // Use the base model type for ticks

          if (bot.parameters?.base_trade_size) {
            baseTradeSize = bot.parameters.base_trade_size;
          }
        } else {
          // Standard bot schema: has 'model_name' and 'ticks_ref'
          modelName = bot.model_name;
          ticksRef = bot.ticks_ref;

          // Convert model_name to display name
          displayName = modelName
            .split('_')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }

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
          id: bot.id || bot._id.toString(), // Use bot.id for custom bots, _id for standard
          name: displayName,
          modelName: modelName,
          todaysTrades: todaysTradesFormatted,
          stats: bot.stats || undefined,
          source: bot.source,
          baseTradeSize: baseTradeSize,
          parameters: bot.parameters || undefined // Include parameters for custom bots
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
