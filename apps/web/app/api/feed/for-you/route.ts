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
    const fid = searchParams.get('fid');
    const cursor = searchParams.get('cursor') ?? undefined;
    const limit = searchParams.get('limit');

    if (!fid) {
      return NextResponse.json({ error: 'fid is required' }, { status: 400 });
    }

    const client = getNeynarClient();
    const data = await client.fetchFeedForYou({
      fid: Number(fid),
      cursor,
      limit: limit ? Number(limit) : undefined,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('For You Feed API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch for you feed' },
      { status: 500 }
    );
  }
}
