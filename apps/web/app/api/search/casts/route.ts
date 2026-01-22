import { NextRequest, NextResponse } from 'next/server';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';

function getNeynarClient() {
  const apiKey = process.env.NEYNAR_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('NEYNAR_API_KEY not configured');
  }
  return new NeynarAPIClient({ apiKey });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '25', 10);

    if (!q) {
      return NextResponse.json({ error: 'q (query) is required' }, { status: 400 });
    }

    const client = getNeynarClient();
    const data = await client.searchCasts({
      q,
      limit,
      cursor,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Search Casts API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search casts' },
      { status: 500 }
    );
  }
}
