import { MongoClient } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

const client = new MongoClient(uri);

// Helper function to get the current model from active_models
function getCurrentModel(activeModels: Record<string, string>): string | null {
  if (!activeModels || Object.keys(activeModels).length === 0) {
    return null;
  }

  // Get all timestamps and sort them in descending order (most recent first)
  const timestamps = Object.keys(activeModels).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  // Return the model associated with the most recent timestamp
  const currentModel = activeModels[timestamps[0]];

  // If the model is "no_model", return null for backward compatibility
  return currentModel === "no_model" ? null : currentModel;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    await client.connect();

    // Get user data
    const userDb = client.db('user_management');
    const usersCollection = userDb.collection('users');
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the current model from active_models timestamps
    const currentModel = getCurrentModel(user.active_models || {});

    // Get all bots to aggregate trades from all ticks collections
    const botsDb = client.db('bots_db');
    const botsCollection = botsDb.collection('bots');
    const allBots = await botsCollection.find({}).toArray();

    // Determine which ticks collection to use for current prices (based on selected model)
    let currentTicksCollectionName = 'ticks'; // Default collection
    if (currentModel) {
      const currentBot = allBots.find(bot => bot.model_name === currentModel);
      if (currentBot && currentBot.ticks_ref) {
        currentTicksCollectionName = currentBot.ticks_ref;
      }
    }

    // Get ticks data from ALL models for complete trading history
    const solanaDb = client.db('solana_db');

    // Collect ticks from all collections
    const allTicksCollections = new Set(['ticks']); // Always include default
    allBots.forEach(bot => {
      if (bot.ticks_ref) {
        allTicksCollections.add(bot.ticks_ref);
      }
    });

    // Fetch ticks from all collections and combine them
    let allTicks = [];
    for (const collectionName of allTicksCollections) {
      try {
        const collection = solanaDb.collection(collectionName);
        const collectionTicks = await collection
          .find({})
          .sort({ timestamp: 1 })
          .toArray();

        // Add collection name to each tick for reference
        const ticksWithSource = collectionTicks.map(tick => ({
          ...tick,
          _source_collection: collectionName
        }));

        allTicks = allTicks.concat(ticksWithSource);
      } catch (error) {
        console.error(`Error fetching from ${collectionName}:`, error);
      }
    }

    // Sort all ticks by timestamp
    const ticks = allTicks.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Get latest tick for current SOL price from the current model's collection
    const currentTicksCollection = solanaDb.collection(currentTicksCollectionName);
    const latestTick = await currentTicksCollection
      .findOne({}, { sort: { timestamp: -1 } });

    // Calculate portfolio metrics
    const currentSolPrice = latestTick?.price_usd || 0;
    const solBalance = user.sol_bal || 0;
    const usdBalance = user.usd_bal || 0;

    // Calculate total portfolio value in USD
    const solValueInUsd = solBalance * currentSolPrice;
    const totalPortfolioValue = usdBalance + solValueInUsd;

    // Calculate trades from ticks
    // Parse action field which can be:
    // - "BUY 0.0010 SOL @ $193.56"
    // - "BUY 0.0010"
    // - "BUY" or "SELL"
    // - "WARMUP" (excluded)
    // - "HOLD" (excluded)
    const trades = ticks
      .filter(tick => {
        if (!tick.action) return false;
        const action = tick.action.trim();
        // Include any action that starts with BUY or SELL
        return action.startsWith('BUY') || action.startsWith('SELL');
      })
      .map(tick => {
        const action = tick.action.trim();

        // Determine action type (BUY or SELL)
        const actionType = action.startsWith('BUY') ? 'BUY' : 'SELL';

        // Try to extract amount from different formats:
        // 1. "BUY 0.0010 SOL @ $193.56" or "SELL 0.0010 SOL @ $194.23"
        let amountMatch = action.match(/^(BUY|SELL)\s+([\d.]+)\s+SOL/);
        if (!amountMatch) {
          // 2. "BUY 0.0010" or "SELL 0.0010"
          amountMatch = action.match(/^(BUY|SELL)\s+([\d.]+)/);
        }

        // Default to 0.0010 SOL if no amount found (standard trade size)
        const amount = amountMatch ? parseFloat(amountMatch[2]) : 0.0001;

        // Determine which model this trade came from
        const sourceCollection = tick._source_collection || 'ticks';
        let modelName = 'mean_reversion'; // default for 'ticks' collection
        const sourceBot = allBots.find(bot => bot.ticks_ref === sourceCollection);
        if (sourceBot) {
          modelName = sourceBot.model_name;
        }

        return {
          id: tick._id.toString(),
          timestamp: tick.timestamp,
          action: actionType,
          amount: amount,
          price_usd: tick.price_usd,
          wallet_balance_sol: tick.wallet_balance_sol || 0,
          profit_loss_usd: tick.profit_loss_usd || 0,
          model: modelName, // Add model name to track which bot made the trade
        };
      });

    // Calculate performance metrics
    const totalProfitLoss = ticks.reduce(
      (sum, tick) => sum + (tick.profit_loss_usd || 0),
      0
    );

    // Calculate 24h performance if we have enough data
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentTicks = ticks.filter(
      tick => new Date(tick.timestamp) >= twentyFourHoursAgo
    );
    const performance24h = recentTicks.reduce(
      (sum, tick) => sum + (tick.profit_loss_usd || 0),
      0
    );

    // Use the portfolio_history from the user document if it exists
    let performanceHistory = [];

    if (user.portfolio_history && Array.isArray(user.portfolio_history)) {
      // User has portfolio_history stored as tuples [timestamp, usd_value, sol_value]
      performanceHistory = user.portfolio_history
        .map((entry: any[]) => {
          // Convert MongoDB Date objects to ISO strings for JSON serialization
          if (entry && Array.isArray(entry) && entry.length >= 3) {
            return [
              entry[0] instanceof Date ? entry[0].toISOString() : entry[0],
              entry[1],
              entry[2]
            ];
          }
          return null;
        })
        .filter((entry: any) => entry !== null)
        .sort((a: any, b: any) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
    }

    return NextResponse.json({
      success: true,
      portfolio: {
        username: user.username,
        current_model: currentModel,
        owned_models: user.owned_models || [],
        balances: {
          usd: usdBalance,
          sol: solBalance,
          sol_value_usd: solValueInUsd,
          total_value_usd: totalPortfolioValue,
        },
        current_prices: {
          sol_usd: currentSolPrice,
        },
        performance: {
          total_profit_loss_usd: totalProfitLoss,
          performance_24h_usd: performance24h,
          performance_24h_percent:
            totalPortfolioValue > 0
              ? (performance24h / totalPortfolioValue) * 100
              : 0,
        },
        trades: trades.reverse(), // Return all trades, most recent first
        total_trades: trades.length,
        performance_history: performanceHistory,
      },
      ticks_data: {
        total_ticks: ticks.length,
        latest_tick: latestTick,
      },
    });
  } catch (error) {
    console.error('Error fetching user portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
