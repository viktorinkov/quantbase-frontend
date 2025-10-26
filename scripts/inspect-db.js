const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Manually load .env.local (but don't overwrite existing env vars)
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.+)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      // Only set if not already defined
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

async function inspectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI not found in environment variables');
    return;
  }

  console.log('Connecting to MongoDB...');
  console.log('URI:', uri.replace(/:[^:@]+@/, ':****@')); // Hide password

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✓ Connected successfully\n');

    // List all databases
    const adminDb = client.db().admin();
    const { databases } = await adminDb.listDatabases();

    console.log('Available databases:');
    databases.forEach(db => {
      console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    console.log();

    // Inspect database (from env or default to solana_db)
    const dbName = process.env.MONGODB_DB || 'solana_db';
    console.log(`Inspecting database: ${dbName}`);
    const db = client.db(dbName);

    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`\nFound ${collections.length} collections:\n`);

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`📊 Collection: ${collectionName}`);

      const collection = db.collection(collectionName);

      // Get count
      const count = await collection.countDocuments();
      console.log(`   Documents: ${count}`);

      // Get sample document
      const sample = await collection.findOne();
      if (sample) {
        console.log(`   Sample document structure:`);
        console.log(`   ${JSON.stringify(sample, null, 2).split('\n').join('\n   ')}`);
      }

      // Get field info
      const fields = sample ? Object.keys(sample) : [];
      console.log(`   Fields: ${fields.join(', ')}`);
      console.log();
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

inspectDatabase();
