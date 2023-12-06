# [Web] Available commands

- `dev`: Start Next.js in development mode.
- `build`: Build the application for production usage.
- `start`: Start a Next.js production server.
- `cypress:open`: 
- `lint`: Lints the code using ESLint
- `clean`: Clear build outputs

## React-navigation and Next.js router

if we render react-navigation on the web it works fine.

but we can't use many things built in Next.js router system, so we will render app header and bottom navigation manually.

check out the files below and change them to suit your design
```typescript
- packages/ui/src/block/appHeader.web.tsx
- packages/ui/src/block/bottomNavigation.web.tsx
```

> ⚠️ Next.js recommend moving Client Components to the leaves of your component tree where possible.  
> we are using client component in most parts because Tamagui has beta support for RSC at this time. 

> [View transition API is not supported in next/navigation currently](https://github.com/vercel/next.js/discussions/46300)
