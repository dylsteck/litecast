# Litecast

A beautiful yet simple Farcaster client. Built by [dylsteck.eth](https://farcaster.xyz/dylsteck.eth)

Talks to the official Farcaster client API (`https://client.farcaster.xyz`) — the same API the open-sourced Farcaster client uses. Guest browsing works without a key. Ranked Home, notifications, DMs, and writes need a Farcaster API session.

### Stack

- Expo / Expo Router
- TanStack Query
- Official Farcaster client API + Farcaster Auth relay (SIWF)

### Run

```bash
bun install
cp .env.example .env
bun run start
```

`i` opens the iOS simulator. `bun run web` for web.

### What works without a session

- Discover feed (recent casts from the network)
- Profiles, threads, search, channels
- Local hide / mute
- Sign in with Farcaster (QR) for identity

### What needs a `client.farcaster.xyz` session

- Ranked For You / Following (`POST /v2/feed-items`) including the view → rank loop
- Notifications and direct casts
- Cast, reply, like, recast, follow

That session is what the official client mints after custody / companion-device login. SIWF proves who you are; it is not a Warpcast API token.

### Layout

```
lib/farcaster/     API client, types, view-event buffer
providers/         Session + local hide/mute
hooks/             React Query hooks, one concern each
app/(tabs)/        Home, Explore, Inbox, Profile
```
