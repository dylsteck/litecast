import { NextRequest, NextResponse } from 'next/server';
import { getNeynarClient } from '@/lib/neynar/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fid = searchParams.get('fid');
    const type = searchParams.get('type') || 'likes';
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '25', 10);

    if (!fid) {
      return NextResponse.json({ error: 'fid is required' }, { status: 400 });
    }

    const client = getNeynarClient();
    const data = await client.fetchUserReactions({
      fid: parseInt(fid, 10),
      type: type as 'likes' | 'recasts',
      limit,
      cursor,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('User Reactions API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user reactions' },
      { status: 500 }
    );
  }
}
