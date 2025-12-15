# Litecast ✍️

A beautiful yet simple Farcaster client. Built by [dylsteck.eth](https://farcaster.xyz/dylsteck.eth)

Originally started as part of [dwr.eth's mobile client bounty](https://farcaster.xyz/dwr.eth/0x5727a985)

### Built with

- [Expo](https://expo.dev)
- [Neynar](https://neynar.com)

### How to run

1. Set up the app locally

-   `git clone https://github.com/dylsteck/litecast`
-   `cd litecast && bun install`

2. Set environment variables

-   Copy `.env.example` to a new `.env` file and add your `NEYNAR_API_KEY`

1. Create Expo project

-   To run the app locally, you'll need to create an account at `https://expo.dev`, then create a new project
-   Once you've created a project, run `npm install --global eas-cli && eas init --id [YOUR PROJECT ID]` to overwrite the existing project with your own

4. Run the app

```bash
bun install      # Install dependencies
bun run start    # Start development server with Expo Go
```

Press `i` to open iOS Simulator

**Useful commands:**
- `bun run clean` - Fresh install (removes node_modules and reinstalls)
- `bun run start` - Start development server
- `bun run ios` - Run on iOS Simulator
- `bun run android` - Run on Android Simulator
- `bun run web` - Run on web

### Mockups

Here are some mockups from the very original version from around when this was started -- huge shoutout to [Sirsu](https://farcaster.xyz/sirsu) for the amazing designs 🙌

|                       Login                        |                       Home                        |
| :------------------------------------------------: | :-----------------------------------------------: |
| ![Litecast Login](https://i.imgur.com/ncsCxVU.png) | ![Litecast Home](https://i.imgur.com/GBlg0fJ.png) |

|                       Search                        |                       Reply                        |
| :-------------------------------------------------: | :------------------------------------------------: |
| ![Litecast Search](https://i.imgur.com/cDsCm95.png) | ![Litecast Reply](https://i.imgur.com/BdhLkTy.png) |
