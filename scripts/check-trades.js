const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set in environment variables');
  process.exit(1);
}

const client = new MongoClient(uri);

async function checkTrades() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const solanaDb = client.db('solana_db');

    // Get samples of different action types
    const buyTicks = await solanaDb.collection('ticks')
      .find({ action: { $regex: /^BUY/ } })
      .limit(5)
      .toArray();

    const sellTicks = await solanaDb.collection('ticks')
      .find({ action: { $regex: /^SELL/ } })
      .limit(5)
      .toArray();

    console.log('\n=== BUY TICKS (Sample) ===');
    buyTicks.forEach(tick => {
      console.log(JSON.stringify({
        timestamp: tick.timestamp,
        action: tick.action,
        price_usd: tick.price_usd,
        wallet_balance_sol: tick.wallet_balance_sol,
        profit_loss_usd: tick.profit_loss_usd
      }, null, 2));
    });

    console.log('\n=== SELL TICKS (Sample) ===');
    sellTicks.forEach(tick => {
      console.log(JSON.stringify({
        timestamp: tick.timestamp,
        action: tick.action,
        price_usd: tick.price_usd,
        wallet_balance_sol: tick.wallet_balance_sol,
        profit_loss_usd: tick.profit_loss_usd
      }, null, 2));
    });

    // Count action types
    const actionTypes = await solanaDb.collection('ticks').aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    console.log('\n=== ACTION TYPE COUNTS ===');
    actionTypes.forEach(type => {
      console.log(`${type._id}: ${type.count}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkTrades();
