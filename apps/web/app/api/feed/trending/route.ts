import { NextRequest, NextResponse } from 'next/server';
import { getNeynarClient } from '@/lib/neynar/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get('cursor') ?? undefined;
    const limit = searchParams.get('limit');
    const timeWindow = searchParams.get('time_window') ?? '24h';

    const client = getNeynarClient();
    const data = await client.fetchTrendingFeed({
      cursor,
      limit: limit ? Number(limit) : 10,
      timeWindow: timeWindow as '1h' | '6h' | '12h' | '24h' | '7d',
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Trending Feed API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trending feed' },
      { status: 500 }
    );
  }
}
