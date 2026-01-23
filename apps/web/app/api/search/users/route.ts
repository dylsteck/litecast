import { NextRequest, NextResponse } from 'next/server';
import { getNeynarClient } from '@/lib/neynar/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!q) {
      return NextResponse.json({ error: 'q (query) is required' }, { status: 400 });
    }

    const client = getNeynarClient();
    const data = await client.searchUser({
      q,
      limit,
      cursor,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Search Users API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search users' },
      { status: 500 }
    );
  }
}
