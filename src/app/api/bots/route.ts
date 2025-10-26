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
    const errorMessage = error.detail || error.error || 'Backend request failed';
    const backendError = {
      message: errorMessage,
      status: response.status,
      statusText: response.statusText,
      details: error
    };
    throw new Error(JSON.stringify(backendError));
  }

  return response.json();
}

// Create a new bot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await makeBackendRequest('/api/bots/create', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating bot:', error);
    
    // Try to parse structured error from backend
    let errorMessage = 'Failed to create bot';
    let statusCode = 500;
    
    if (error instanceof Error) {
      try {
        const backendError = JSON.parse(error.message);
        errorMessage = backendError.message || errorMessage;
        statusCode = backendError.status || statusCode;
      } catch {
        // If not JSON, use the error message as-is
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

// List all bots
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorUsername = searchParams.get('creator_username');
    
    const endpoint = creatorUsername 
      ? `/api/bots/?creator_username=${encodeURIComponent(creatorUsername)}`
      : '/api/bots/';
    
    const response = await makeBackendRequest(endpoint);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching bots:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch bots' },
      { status: 500 }
    );
  }
}
