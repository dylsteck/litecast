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
