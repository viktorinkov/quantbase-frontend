const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set in environment variables');
  process.exit(1);
}

const client = new MongoClient(uri);

async function checkPortfolioData() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    // Check user_management.users
    const userDb = client.db('user_management');
    const users = await userDb.collection('users').find({}).toArray();
    console.log('\n=== USERS ===');
    console.log(`Found ${users.length} user(s)`);

    if (users.length > 0) {
      const demoUser = users.find(u => u.username === 'demo');
      if (demoUser) {
        console.log('\nDemo user data:');
        console.log('Username:', demoUser.username);
        console.log('SOL Balance:', demoUser.sol_bal);
        console.log('USD Balance:', demoUser.usd_bal);
        console.log('Active Models:', JSON.stringify(demoUser.active_models, null, 2));
        console.log('Portfolio History entries:', demoUser.portfolio_history?.length || 0);
      }
    }

    // Check solana_db.ticks
    const solanaDb = client.db('solana_db');
    const collections = await solanaDb.listCollections().toArray();
    console.log('\n=== SOLANA_DB COLLECTIONS ===');
    collections.forEach(col => console.log('- ' + col.name));

    // Check ticks
    const ticksCount = await solanaDb.collection('ticks').countDocuments();
    console.log(`\nTicks collection: ${ticksCount} documents`);

    if (ticksCount > 0) {
      const latestTick = await solanaDb.collection('ticks')
        .findOne({}, { sort: { timestamp: -1 } });
      console.log('\nLatest tick:', JSON.stringify(latestTick, null, 2));

      const firstTick = await solanaDb.collection('ticks')
        .findOne({}, { sort: { timestamp: 1 } });
      console.log('\nFirst tick:', JSON.stringify(firstTick, null, 2));
    }

    // Check bots_db
    const botsDb = client.db('bots_db');
    const bots = await botsDb.collection('bots').find({}).toArray();
    console.log('\n=== BOTS ===');
    console.log(`Found ${bots.length} bot(s)`);
    bots.forEach(bot => {
      console.log(`- ${bot.model_name} (ticks_ref: ${bot.ticks_ref})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkPortfolioData();
