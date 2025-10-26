import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB;

async function inspectDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log(`Connected to MongoDB database: ${DB_NAME}`);

    const db = client.db(DB_NAME);
    const collection = db.collection('bots');

    // Get one bot document to inspect its structure
    const bot = await collection.findOne({});

    if (!bot) {
      console.log('No bots found in the database');
      return;
    }

    console.log('\n=== Bot Document Structure ===\n');
    console.log(JSON.stringify(bot, null, 2));

    console.log('\n=== Stats Structure (if exists) ===\n');
    if (bot.stats) {
      console.log(JSON.stringify(bot.stats, null, 2));
    } else {
      console.log('No stats field found');
    }

    console.log('\n=== Field Names ===\n');
    console.log(Object.keys(bot));

  } catch (error) {
    console.error('Error inspecting database:', error);
  } finally {
    await client.close();
  }
}

inspectDatabase();
