# AGENTS.md - Litecast Monorepo

This document provides guidance for AI agents working with the Litecast monorepo.

## Project Overview

Litecast is a lightweight Farcaster client built as a **pnpm + Turborepo monorepo** with:
- A mobile app (Expo/React Native)
- A web app (Next.js 15 with App Router)
- Shared packages for types, hooks, utils, and design tokens

## Monorepo Structure

```
litecast/
├── apps/
│   ├── mobile/          # Expo React Native app
│   │   ├── app/         # Expo Router pages
│   │   ├── components/  # React Native components
│   │   ├── hooks/       # Legacy hooks (migrate to @litecast/hooks)
│   │   ├── lib/         # Mobile-specific utilities (signer, etc.)
│   │   └── constants/   # Mobile-specific constants
│   └── web/             # Next.js 15 web app
│       └── app/
│           ├── api/     # Next.js Route Handlers
│           ├── layout.tsx  # Root layout with providers
│           ├── page.tsx    # Home page
│           └── globals.css # Global styles
├── packages/
│   ├── types/           # @litecast/types - Shared TypeScript types
│   │   └── src/
│   │       ├── neynar/  # Neynar API types (user, cast, feed, etc.)
│   │       ├── farcaster/ # Farcaster protocol types (signer)
│   │       └── api/     # API response wrapper types
│   ├── config/          # @litecast/config - Design tokens & Tailwind preset
│   │   └── src/
│   │       ├── colors.ts
│   │       ├── spacing.ts
│   │       ├── typography.ts
│   │       └── tailwind/preset.ts
│   ├── utils/           # @litecast/utils - Shared utilities
│   │   └── src/
│   │       ├── neynar/  # NeynarClient, constants, errors
│   │       └── formatting/  # Time and text formatting
│   └── hooks/           # @litecast/hooks - React Query hooks
│       └── src/
│           ├── api/     # API client configuration
│           ├── queries/ # Query hooks (useFeed, useUser, etc.)
│           └── context/ # ApiProvider context
├── turbo.json           # Turborepo configuration
├── pnpm-workspace.yaml  # pnpm workspace definition
└── package.json         # Root package with turbo scripts
```

## Key Architecture Decisions

### API Architecture
- **All API routes live in `apps/web`** - The web app serves as the centralized API server
- **Mobile app calls the web API** - No direct Neynar calls from mobile
- API is implemented using **Elysia** with type-safe routes
- API base URL:
  - Production: `https://litecast.xyz`
  - Development: `http://localhost:3000`

### Package Dependencies
```
@litecast/hooks  → @litecast/types
@litecast/utils  → @litecast/types
apps/web         → @litecast/hooks, @litecast/utils, @litecast/types, @litecast/config
apps/mobile      → @litecast/hooks, @litecast/types, @litecast/config
```

### UI Architecture
- **Web**: React components + Tailwind CSS
- **Mobile**: React Native components + NativeWind with `@litecast/config` preset
- Design tokens are shared via `@litecast/config`

## Commands

```bash
# Install dependencies
pnpm install

# Run all apps in development
pnpm dev

# Run specific app
pnpm dev:mobile  # Expo mobile app
pnpm dev:web     # TanStack Start web app

# Build all packages and apps
pnpm build

# Type check all packages
pnpm type-check
```

## Do's and Don'ts

### DO:
- Use workspace packages for shared code: `@litecast/types`, `@litecast/hooks`, etc.
- Add new Neynar/Farcaster types to `packages/types/src/neynar/`
- Add new API endpoints to `apps/web/src/lib/elysia/routes/`
- Use the `ApiProvider` from `@litecast/hooks` in both apps
- Keep design tokens in `@litecast/config` for consistency
- Use `pnpm` commands from the root (not `npm` or `yarn`)
- Run `pnpm build` after modifying packages before testing apps

### DON'T:
- Don't add API routes to `apps/mobile` - all API logic goes in `apps/web`
- Don't call Neynar API directly from hooks - use the centralized API
- Don't duplicate types between packages - use `@litecast/types`
- Don't use `bun` (migrated to pnpm for monorepo support)
- Don't commit `.env` files or API keys
- Don't modify `node_modules` or lock files manually

## Environment Variables

Required environment variables (create `.env` at root):

```env
# For web API server
NEYNAR_API_KEY=xxx

# For signer creation
FARCASTER_APP_FID=xxx
FARCASTER_APP_MNEMONIC=xxx

# Optional: Override API URL for mobile development
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## API Endpoints

All endpoints are served from `apps/web` at `/api/*`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/feed` | GET | Following feed for a user |
| `/api/feed/for-you` | GET | For You algorithmic feed |
| `/api/feed/trending` | GET | Trending casts |
| `/api/channel` | GET | Channel-specific feed |
| `/api/thread` | GET | Cast conversation thread |
| `/api/cast` | GET | Single cast by hash |
| `/api/user` | GET | User profile by FID or username |
| `/api/user/casts` | GET | User's casts |
| `/api/notifications` | GET | User notifications |
| `/api/search/casts` | GET | Search casts |
| `/api/search/users` | GET | Search users |
| `/api/signer` | POST | Create signed key request |
| `/api/signer` | GET | Poll signer status |

## Working with Packages

### Adding a new type
1. Add type definition to appropriate file in `packages/types/src/`
2. Export from the index file
3. Run `pnpm build` in packages/types
4. Import in apps: `import { MyType } from '@litecast/types'`

### Adding a new hook
1. Create hook in `packages/hooks/src/queries/`
2. Export from `packages/hooks/src/queries/index.ts`
3. Export from `packages/hooks/src/index.ts`
4. Run `pnpm build` in packages/hooks
5. Import in apps: `import { useMyHook } from '@litecast/hooks'`

### Adding a new API endpoint
1. Create a new route file in `apps/web/app/api/<endpoint>/route.ts`
2. Export GET/POST/etc handlers using Next.js Route Handler conventions
3. Add corresponding endpoint constant in `packages/hooks/src/api/endpoints.ts`
4. Create corresponding hook in `packages/hooks/src/queries/`

## Mobile-Specific Code

The following remain mobile-specific in `apps/mobile/lib/farcaster/`:
- `signer.ts` - Ed25519 keypair generation (uses expo-crypto)
- AsyncStorage operations for persisting signer data

These use native modules and should not be moved to shared packages.

## Testing Changes

After making changes:
1. Run `pnpm build` to build all packages
2. Run `pnpm type-check` to verify types
3. Test mobile: `pnpm dev:mobile`
4. Test web: `pnpm dev:web`
5. Verify API endpoints work from mobile connecting to web

## Common Issues

### "Module not found" errors
- Run `pnpm install` and `pnpm build` from root
- Check that workspace references use `workspace:*` in package.json

### Type errors in apps
- Ensure packages are built: `pnpm build`
- Check imports use package names, not relative paths

### API not working from mobile
- Ensure `EXPO_PUBLIC_API_URL` points to running web server
- Check web server logs for errors
- Verify `NEYNAR_API_KEY` is set in `.env`
