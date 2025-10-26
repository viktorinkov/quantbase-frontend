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

// Personalize bot parameters using Claude AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { botId, ...personalizationData } = body;
    
    if (!botId) {
      return NextResponse.json(
        { error: 'Bot ID is required' },
        { status: 400 }
      );
    }
    
    const response = await makeBackendRequest(`/api/bots/${botId}/personalize`, {
      method: 'POST',
      body: JSON.stringify(personalizationData),
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error personalizing bot:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to personalize bot' },
      { status: 500 }
    );
  }
}

// Modify bot parameters interactively using Claude AI
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { botId, ...modificationData } = body;
    
    if (!botId) {
      return NextResponse.json(
        { error: 'Bot ID is required' },
        { status: 400 }
      );
    }
    
    const response = await makeBackendRequest(`/api/bots/${botId}/modify`, {
      method: 'POST',
      body: JSON.stringify(modificationData),
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error modifying bot:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to modify bot' },
      { status: 500 }
    );
  }
}
