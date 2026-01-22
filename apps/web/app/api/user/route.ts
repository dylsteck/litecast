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
    const username = searchParams.get('username');

    if (!fid && !username) {
      return NextResponse.json(
        { error: 'Either fid or username is required' },
        { status: 400 }
      );
    }

    const client = getNeynarClient();

    if (fid) {
      const data = await client.fetchBulkUsers({ fids: [Number(fid)] });
      return NextResponse.json({ user: data.users[0] });
    }

    const data = await client.lookupUserByUsername({ username: username! });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('User API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
