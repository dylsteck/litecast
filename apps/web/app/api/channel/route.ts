import { NextRequest, NextResponse } from 'next/server';
import { getNeynarClient } from '@/lib/neynar/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const channelId = searchParams.get('channel_id') ?? undefined;
    const parentUrl = searchParams.get('parent_url') ?? undefined;
    const cursor = searchParams.get('cursor') ?? undefined;
    const limit = searchParams.get('limit');

    if (!channelId && !parentUrl) {
      return NextResponse.json(
        { error: 'Either channel_id or parent_url is required' },
        { status: 400 }
      );
    }

    const client = getNeynarClient();
    
    if (channelId) {
      const data = await client.fetchFeedByChannelIds({
        channelIds: [channelId],
        cursor,
        limit: limit ? Number(limit) : undefined,
      });
      return NextResponse.json(data);
    }

    const data = await client.fetchFeedByParentUrls({
      parentUrls: [parentUrl!],
      cursor,
      limit: limit ? Number(limit) : undefined,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Channel API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch channel feed' },
      { status: 500 }
    );
  }
}
