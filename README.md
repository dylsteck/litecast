# Litecast ✍️

A beautiful yet simple Farcaster client
Built as an open source example for FarcasterKit x Neynar, as well as part of [dwr.eth's mobile client bounty](https://warpcast.com/dwr.eth/0x5727a985)

### Built with

-   [Expo](https://expo.dev)
-   FarcasterKit's [farcasterkit-react-native](https://www.npmjs.com/package/farcasterkit-react-native)
- Neynar's [react-native-signin](https://www.npmjs.com/package/@neynar/react-native-signin)


### How to run

1. Set up the app locally

-   `git clone https://github.com/dylsteck/litecast`
-   `cd litecast && yarn install`

2. Set environment variables

-   Copy `.env.example` to a new `.env` file and add your `NEYNAR_API_KEY`
-   In `constants.ts`, the `API_URL` value is for FarcasterKit's API, which has routes to get/receive the signer and post casts to Neynar. Don't change this value you're running the FarcasterKit API locally, but if not change the value to `http://api.farcasterkit.com`

3. Create Expo project

-   To run the app locally, you'll need to create an account at `https://expo.dev`, then create a new project
-   Once you've created a project, run `npm install --global eas-cli && eas init --id [YOUR PROJECT ID]` to overwrite the existing project with your own

4. Run by calling `yarn start`

### Todos
Note: These are just a few todos on the top of my mind that would get the app to v1.0(full feature parity with the mockups below), but I'm sure smaller tasks and larger ideas will come to mind as well.

-   [] Further style the cast and thread components
-   [] Add search
-   [] Add following channels(via search)
-   [] Add user pages
-   [] Add more of the backend logic to [farcasterkit-react-native](https://www.npmjs.com/package/farcasterkit-react-native) (not much left to move over)
-   [] Add logout capabilities

### Mockups

Here are some mockups to further showcase where the app is headed -- huge shoutout again to [Sirsu](https://warpcast.com/sirsu) for the amazing designs 🙌

|                       Login                        |                       Home                        |
| :------------------------------------------------: | :-----------------------------------------------: |
| ![Litecast Login](https://i.imgur.com/ncsCxVU.png) | ![Litecast Home](https://i.imgur.com/GBlg0fJ.png) |

|                       Search                        |                       Reply                        |
| :-------------------------------------------------: | :------------------------------------------------: |
| ![Litecast Search](https://i.imgur.com/cDsCm95.png) | ![Litecast Reply](https://i.imgur.com/BdhLkTy.png) |
