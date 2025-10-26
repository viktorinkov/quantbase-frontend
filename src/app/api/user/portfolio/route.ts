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

    // Determine which ticks collection to use based on selected model
    let ticksCollectionName = 'ticks'; // Default collection

    if (currentModel) {
      // Get the bot configuration to find the ticks_ref
      const botsDb = client.db('bots_db');
      const botsCollection = botsDb.collection('bots');
      const bot = await botsCollection.findOne({ model_name: currentModel });

      if (bot && bot.ticks_ref) {
        ticksCollectionName = bot.ticks_ref;
      }
    }

    // Get ticks data for portfolio calculation
    const solanaDb = client.db('solana_db');
    const ticksCollection = solanaDb.collection(ticksCollectionName);

    // Get all ticks sorted by timestamp
    const ticks = await ticksCollection
      .find({})
      .sort({ timestamp: 1 })
      .toArray();

    // Get latest tick for current SOL price
    const latestTick = await ticksCollection
      .findOne({}, { sort: { timestamp: -1 } });

    // Calculate portfolio metrics
    const currentSolPrice = latestTick?.price_usd || 0;
    const solBalance = user.sol_bal || 0;
    const usdBalance = user.usd_bal || 0;

    // Calculate total portfolio value in USD
    const solValueInUsd = solBalance * currentSolPrice;
    const totalPortfolioValue = usdBalance + solValueInUsd;

    // Calculate trades from ticks
    // Parse action field which can be: "BUY 0.0010", "SELL 0.0010", or just "WARMUP"
    const trades = ticks
      .filter(tick => {
        if (!tick.action) return false;
        // Only include entries that match "BUY [amount]" or "SELL [amount]" format
        return /^(BUY|SELL)\s+[\d.]+$/.test(tick.action);
      })
      .map(tick => {
        // Parse action and amount from string like "BUY 0.0010"
        const actionMatch = tick.action.match(/^(BUY|SELL)\s+([\d.]+)$/);
        const actionType = actionMatch ? actionMatch[1] : tick.action;
        const amount = actionMatch ? parseFloat(actionMatch[2]) : (tick.wallet_balance_sol || 0);

        return {
          id: tick._id.toString(),
          timestamp: tick.timestamp,
          action: actionType,
          amount: amount,
          price_usd: tick.price_usd,
          wallet_balance_sol: tick.wallet_balance_sol,
          profit_loss_usd: tick.profit_loss_usd,
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

    // Calculate performance history (daily portfolio value over time)
    // Group ticks by day and store timestamp, USD value, and SOL value
    const performanceHistoryMap = new Map<string, { timestamp: string; usd: number; sol: number }>();

    ticks.forEach((tick) => {
      const date = new Date(tick.timestamp).toISOString().split('T')[0];
      const timestamp = tick.timestamp;
      const walletBalanceUsd = (tick.wallet_balance_usd || 0);
      const walletBalanceSol = (tick.wallet_balance_sol || 0);

      // Keep only the latest value for each day
      performanceHistoryMap.set(date, {
        timestamp,
        usd: walletBalanceUsd,
        sol: walletBalanceSol,
      });
    });

    // Convert to array format for the chart
    const performanceHistory = Array.from(performanceHistoryMap.entries())
      .map(([_, data]) => [
        data.timestamp,
        data.usd,
        data.sol,
      ])
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

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
