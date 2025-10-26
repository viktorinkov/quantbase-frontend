import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

// Helper function to make requests to the backend API
async function makeBackendRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${BACKEND_API_URL}${endpoint}`;
  
  console.log('Frontend API: Making request to', url);
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  console.log('Frontend API: Response status', response.status);

  if (!response.ok) {
    const responseText = await response.text();
    console.log('Frontend API: Error response body', responseText);
    let error;
    try {
      error = JSON.parse(responseText);
    } catch {
      error = { error: responseText || 'Unknown error' };
    }
    throw new Error(error.detail || error.error || `Backend request failed with status ${response.status}`);
  }

  return response.json();
}

// Personalize bot parameters using Claude AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { botId, ...personalizationData } = body;
    
    // If no botId provided, use standalone endpoint (pre-creation parameter generation)
    let backendEndpoint: string;
    if (!botId) {
      backendEndpoint = '/api/bots/personalize-standalone';
    } else {
      backendEndpoint = `/api/bots/${botId}/personalize`;
    }
    
    console.log('Frontend API: Routing to', backendEndpoint);
    console.log('Frontend API: Sending data', JSON.stringify(personalizationData, null, 2));
    
    const response = await makeBackendRequest(backendEndpoint, {
      method: 'POST',
      body: JSON.stringify(personalizationData),
    });

    console.log('Frontend API: Response received successfully');
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
