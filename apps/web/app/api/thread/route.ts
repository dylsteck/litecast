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

    // The SDK type may not include direct_replies in the type definition,
    // but it can be present in the response. We'll handle it safely.
    const conversation = data?.conversation;
    
    // Type assertion for conversation with optional direct_replies
    // The SDK's ConversationConversation type doesn't always include direct_replies
    type ConversationWithReplies = typeof conversation & { direct_replies?: unknown[] };
    const conversationWithReplies = conversation as ConversationWithReplies | undefined;

    // If direct_replies is missing but cast has replies, fetch them separately
    if (conversation?.cast && !conversationWithReplies?.direct_replies && conversation.cast.replies?.count > 0) {
      try {
        const cast = conversation.cast;
        // Construct parent URL using farcaster.xyz
        const parentUrl = `https://farcaster.xyz/${cast.author.username}/${cast.hash}`;
        
        // Fetch replies using parent URL feed
        const repliesData = await client.fetchFeedByParentUrls({
          parentUrls: [parentUrl],
          limit: 50,
        });

        // Extract direct replies (casts that reply to this specific cast)
        const directReplies = repliesData.casts?.filter(
          (reply) => reply.parent_hash === cast.hash
        ) || [];

        // Add direct_replies to the conversation
        if (conversationWithReplies && directReplies.length > 0) {
          conversationWithReplies.direct_replies = directReplies;
        }
      } catch (error: any) {
        // Continue without replies rather than failing
        // Silently handle error - replies will just be empty
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
