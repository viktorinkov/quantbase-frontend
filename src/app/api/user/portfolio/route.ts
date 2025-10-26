import { MongoClient } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

const client = new MongoClient(uri);

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

    // Get ticks data for portfolio calculation
    const solanaDb = client.db('solana_db');
    const ticksCollection = solanaDb.collection('ticks');

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
    const trades = ticks
      .filter(tick => tick.action && tick.action !== 'WARMUP')
      .map(tick => ({
        id: tick._id.toString(),
        timestamp: tick.timestamp,
        action: tick.action,
        price_usd: tick.price_usd,
        wallet_balance_sol: tick.wallet_balance_sol,
        profit_loss_usd: tick.profit_loss_usd,
      }));

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
    // Group ticks by day and calculate cumulative portfolio value
    const performanceHistoryMap = new Map<string, number>();
    let cumulativeProfitLoss = 0;
    const initialPortfolioValue = usdBalance; // Assume initial value was just USD balance

    ticks.forEach((tick) => {
      const date = new Date(tick.timestamp).toISOString().split('T')[0];
      cumulativeProfitLoss += (tick.profit_loss_usd || 0);

      // Portfolio value = initial value + cumulative P/L
      const portfolioValue = initialPortfolioValue + cumulativeProfitLoss;

      // Keep only the latest value for each day
      performanceHistoryMap.set(date, portfolioValue);
    });

    // Convert to array format for the chart
    const performanceHistory = Array.from(performanceHistoryMap.entries())
      .map(([date, value]) => ({
        date,
        value
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      portfolio: {
        username: user.username,
        current_model: user.current_model,
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
        trades: trades.slice(-50), // Return last 50 trades
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
