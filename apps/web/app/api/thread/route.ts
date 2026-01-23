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
      replyDepth: 10,
    });

    // The SDK returns direct_replies nested inside cast.direct_replies
    // We need to move it to conversation.direct_replies for consistency with our types
    const conversation = data?.conversation;
    const cast = conversation?.cast;
    
    if (conversation && cast) {
      // Check if direct_replies is in cast object (Neynar SDK structure)
      const castDirectReplies = (cast as any)?.direct_replies;
      
      if (Array.isArray(castDirectReplies)) {
        // Move direct_replies from cast to conversation level
        (conversation as any).direct_replies = castDirectReplies;
        // Remove from cast to avoid duplication
        delete (cast as any).direct_replies;
      } else {
        // Ensure direct_replies exists as empty array if missing
        if (!('direct_replies' in conversation)) {
          (conversation as any).direct_replies = [];
        }
      }
      
      // If direct_replies is still empty but cast has replies, try fallback fetch
      const existingReplies = (conversation as any)?.direct_replies;
      const hasReplies = cast.replies?.count > 0;
      const needsFetch = hasReplies && (!existingReplies || existingReplies.length === 0);
      
      if (needsFetch) {
        try {
          // Try multiple parent URL formats
          const parentUrls = [
            `https://farcaster.xyz/${cast.author.username}/${cast.hash}`,
            `https://warpcast.com/${cast.author.username}/${cast.hash}`,
          ];
          
          // Fetch replies using parent URL feed
          const repliesData = await client.fetchFeedByParentUrls({
            parentUrls: parentUrls,
            limit: 50,
          });

          // Extract direct replies (casts that reply to this specific cast)
          const directReplies = repliesData.casts?.filter(
            (reply) => reply.parent_hash === cast.hash
          ) || [];

          // Update direct_replies in the conversation object
          if (conversation) {
            (conversation as any).direct_replies = directReplies;
          }
        } catch (error: any) {
          // Continue without replies rather than failing
          // Ensure direct_replies is at least an empty array
          if (conversation && !('direct_replies' in conversation)) {
            (conversation as any).direct_replies = [];
          }
        }
      }
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch thread' },
      { status: 500 }
    );
  }
}
