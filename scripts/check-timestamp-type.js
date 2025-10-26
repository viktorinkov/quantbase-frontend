const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load env
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

async function checkTimestampType() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const solanaDb = client.db('solana_db');
    const ticksCollection = solanaDb.collection('momentum_ticks');
    
    // Get a sample document
    const sample = await ticksCollection.findOne();
    console.log('Sample document:');
    console.log(JSON.stringify(sample, null, 2));
    console.log('\nTimestamp type:', typeof sample.timestamp);
    console.log('Timestamp value:', sample.timestamp);
    
    // Test query with Date object
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    console.log('\n--- Testing with Date object ---');
    console.log('Query date (Date object):', todayStart);
    console.log('Query date (ISO string):', todayStart.toISOString());
    
    const countWithDate = await ticksCollection.countDocuments({
      timestamp: { $gte: todayStart }
    });
    console.log('Count with Date object:', countWithDate);
    
    // Test query with ISO string
    const countWithString = await ticksCollection.countDocuments({
      timestamp: { $gte: todayStart.toISOString() }
    });
    console.log('Count with ISO string:', countWithString);
    
    // Get all documents to see date range
    const allDocs = await ticksCollection.find().sort({ timestamp: 1 }).limit(1).toArray();
    console.log('\nOldest document timestamp:', allDocs[0]?.timestamp);
    
    const latestDocs = await ticksCollection.find().sort({ timestamp: -1 }).limit(1).toArray();
    console.log('Latest document timestamp:', latestDocs[0]?.timestamp);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

checkTimestampType();
