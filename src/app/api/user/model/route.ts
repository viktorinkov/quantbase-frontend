import { MongoClient } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

const client = new MongoClient(uri);
const dbName = 'user_management';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, modelName } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Get current user data
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create timestamp for the model change
    const timestamp = new Date().toISOString();

    // Prepare update object
    const updateData: any = {
      current_model: modelName || null,
    };

    // Add to active_models map with timestamp
    // Use dot notation to add a new field to the active_models object
    const activeModelsKey = `active_models.${timestamp}`;
    updateData[activeModelsKey] = modelName || null;

    // Update user in database
    const result = await usersCollection.updateOne(
      { username },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update user model' },
        { status: 500 }
      );
    }

    // Fetch updated user
    const updatedUser = await usersCollection.findOne({ username });

    return NextResponse.json({
      success: true,
      message: `Model ${modelName ? `set to ${modelName}` : 'deselected'}`,
      user: updatedUser,
      timestamp,
    });
  } catch (error) {
    console.error('Error updating user model:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
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
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
