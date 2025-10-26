import { MongoClient } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

const client = new MongoClient(uri);
const dbName = 'user_management';

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

    // Create timestamp for the model change (Date format)
    const timestamp = new Date().toISOString();

    // Add to active_models map with timestamp as key and model name as value
    // Format: { "2025-01-15T10:30:00.000Z": "momentum" }
    // Use "no_model" when deselecting instead of null
    const activeModelsKey = `active_models.${timestamp}`;
    const updateData: Record<string, string> = {
      [activeModelsKey]: modelName || "no_model",
    };

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
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('Error closing MongoDB client:', closeError);
      }
    }
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

    // Get the current model from active_models timestamps
    const currentModel = getCurrentModel(user.active_models || {});

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        current_model: currentModel, // Add computed current_model for backward compatibility
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('Error closing MongoDB client:', closeError);
      }
    }
  }
}
