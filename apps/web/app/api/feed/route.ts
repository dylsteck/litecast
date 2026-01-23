import { NextRequest, NextResponse } from 'next/server';
import { getNeynarClient } from '@/lib/neynar/client';

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
    const data = await client.fetchUserFollowingFeed({
      fid: Number(fid),
      cursor,
      limit: limit ? Number(limit) : undefined,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Feed API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}
