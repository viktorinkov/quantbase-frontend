const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set in environment variables');
  process.exit(1);
}

const client = new MongoClient(uri);

async function checkMomentumTicks() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const solanaDb = client.db('solana_db');

    // Check momentum_ticks
    const momentumTicksCount = await solanaDb.collection('momentum_ticks').countDocuments();
    console.log(`\nMomentum ticks collection: ${momentumTicksCount} documents`);

    // Count action types
    const actionTypes = await solanaDb.collection('momentum_ticks').aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    console.log('\n=== MOMENTUM TICKS ACTION TYPE COUNTS ===');
    actionTypes.forEach(type => {
      console.log(`${type._id}: ${type.count}`);
    });

    // Get sample BUY and SELL
    const buySample = await solanaDb.collection('momentum_ticks')
      .findOne({ action: { $regex: /^BUY/ } });
    const sellSample = await solanaDb.collection('momentum_ticks')
      .findOne({ action: { $regex: /^SELL/ } });

    console.log('\n=== SAMPLE BUY ===');
    console.log(JSON.stringify(buySample, null, 2));

    console.log('\n=== SAMPLE SELL ===');
    console.log(JSON.stringify(sellSample, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkMomentumTicks();
