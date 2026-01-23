import { NextRequest, NextResponse } from 'next/server';
import { getNeynarClient } from '@/lib/neynar/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hash = searchParams.get('hash');

    if (!hash) {
      return NextResponse.json({ error: 'hash is required' }, { status: 400 });
    }

    const client = getNeynarClient();
    const data = await client.lookupCastConversation({
      identifier: hash,
      type: 'hash',
      replyDepth: 2,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Thread API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch thread' },
      { status: 500 }
    );
  }
}
