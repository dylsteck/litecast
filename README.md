# Litecast ✍️

A beautiful yet simple Farcaster client
Built as an open source example for FarcasterKit x Neynar, as well as part of [dwr.eth's mobile client bounty](https://warpcast.com/dwr.eth/0x5727a985)

### Built with
- [Expo](https://expo.dev)
- [FarcasterKit](https://farcasterkit.com)'s [Neynar](https://neynar.com) Provider, as well as other API calls from both providers


### How to run
1. Set up the app locally
- `git clone https://github.com/dylsteck/litecast`
- `cd litecast && yarn install`
2. Set environment variables
- Copy `.env.example` to a new `.env` file and add your `NEYNAR_API_KEY`
- In `constants.ts`, the `API_URL` value is for FarcasterKit's API, which has routes to get/receive the signer and post casts to Neynar. Don't change this value you're running the FarcasterKit API locally, but if not change the value to `http://api.farcasterkit.com`
3. Run by calling `yarn start`

### Todos
*note*: These are just the most immediate todos that come to mind, I'm sure this list will change a bit! 
- [] Launch TestFlight with existing app
- [] Make the navbar functional(clicking feeds)
- [] Further style the cast and thread components
- [] Cleanup `NeynarProvider` before eventually moving it officially into `farcasterkit`
    - note: my process for building `farcasterkit` providers has been building the providers in an example app(like Litecast) before moving to the package level -- so this works out well anyways
- [] Add search
- [] Add logout capabilities
- [] (longterm) build the client out in `web` and use as many overlapping `packages/ui` components as possible
    - note: funny enough I was building the `NeynarProvider` for Next.JS last weekend, so I might be able to merge that codebase with `apps/web` whenever I get to it

### Mockups
Here are some mockups to further showcase where the app is headed -- huge shoutout again to [Sirsu](https://warpcast.com/sirsu) for the amazing designs 🙌

Login           |  Home
:-------------------------:|:-------------------------:
![Litecast Login](https://i.imgur.com/ncsCxVU.png)  |  ![Litecast Home](https://i.imgur.com/GBlg0fJ.png)

Search           |  Reply
:-------------------------:|:-------------------------:
![Litecast Search](https://i.imgur.com/cDsCm95.png)  |  ![Litecast Reply](https://i.imgur.com/BdhLkTy.png)