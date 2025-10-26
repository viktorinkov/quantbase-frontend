const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Manually load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.+)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

async function checkLatestTicks() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI not found in environment variables');
    return;
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 60000,
    connectTimeoutMS: 60000,
  });

  try {
    await client.connect();
    console.log('✓ Connected to MongoDB\n');

    const solanaDb = client.db('solana_db');
    const botsDb = client.db('bots_db');

    // Get all bots
    const bots = await botsDb.collection('bots').find({}).toArray();

    // Get today's start time
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    for (const bot of bots) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Model: ${bot.model_name}`);
      console.log(`Ticks Collection: ${bot.ticks_ref}`);
      console.log(`${'='.repeat(60)}`);

      const ticksCollection = solanaDb.collection(bot.ticks_ref);

      // Get today's ticks
      const todayTicks = await ticksCollection
        .find({ timestamp: { $gte: todayStart } })
        .sort({ timestamp: -1 })
        .toArray();

      console.log(`\nTotal ticks today: ${todayTicks.length}`);

      // Count by action type
      const actionCounts = {};
      todayTicks.forEach(tick => {
        actionCounts[tick.action] = (actionCounts[tick.action] || 0) + 1;
      });

      console.log('\nBreakdown by action:');
      Object.entries(actionCounts).forEach(([action, count]) => {
        console.log(`  ${action}: ${count}`);
      });

      // Count BUY/SELL only
      const buySellCount = todayTicks.filter(t => t.action === 'BUY' || t.action === 'SELL').length;
      console.log(`\nBUY/SELL trades (shown in table): ${buySellCount}`);

      // Get latest tick
      if (todayTicks.length > 0) {
        console.log('\nLatest tick:');
        console.log(JSON.stringify(todayTicks[0], null, 2));
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
    console.log('\n\nConnection closed');
  }
}

checkLatestTicks();
