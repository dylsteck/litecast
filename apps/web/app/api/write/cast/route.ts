import { NextRequest, NextResponse } from 'next/server';
import { getNeynarClient } from '../../../../lib/neynar/client';
import { getClientIp, rateLimitWriteRequest } from '../../../../lib/rateLimitWrite';

const MAX_BODY_BYTES = 512_000;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = rateLimitWriteRequest(ip);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfterSec: limited.retryAfterSec },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } }
    );
  }

  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Body too large' }, { status: 413 });
    }
    const body = JSON.parse(raw) as { message?: Record<string, unknown> };
    if (!body.message || typeof body.message !== 'object') {
      return NextResponse.json({ error: 'message object required' }, { status: 400 });
    }

    const client = getNeynarClient();
    const data = await client.publishMessageToFarcaster({ body: body.message } as {
      body: Record<string, unknown>;
    });
    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to publish';
    console.error('write/cast error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
