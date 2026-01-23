import { NextRequest, NextResponse } from 'next/server';
import { getNeynarClient } from '@/lib/neynar/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fid = searchParams.get('fid');
    const includeReplies = searchParams.get('include_replies') === 'true';
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '25', 10);

    if (!fid) {
      return NextResponse.json({ error: 'fid is required' }, { status: 400 });
    }

    const client = getNeynarClient();
    const data = await client.fetchCastsForUser({
      fid: parseInt(fid, 10),
      limit,
      cursor,
      includeReplies,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('User Casts API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user casts' },
      { status: 500 }
    );
  }
}
