import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

// Helper function to make requests to the backend API
async function makeBackendRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${BACKEND_API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.detail || error.error || 'Backend request failed');
  }

  return response.json();
}

// Get a specific bot
export async function GET(
  request: NextRequest,
  { params }: { params: { botId: string } }
) {
  try {
    const { botId } = params;
    
    const response = await makeBackendRequest(`/api/bots/${botId}`);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching bot:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch bot' },
      { status: 500 }
    );
  }
}

// Delete a bot
export async function DELETE(
  request: NextRequest,
  { params }: { params: { botId: string } }
) {
  try {
    const { botId } = params;
    
    const response = await makeBackendRequest(`/api/bots/${botId}`, {
      method: 'DELETE',
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting bot:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete bot' },
      { status: 500 }
    );
  }
}
