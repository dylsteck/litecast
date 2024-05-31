import axios from 'axios'

export const useSearchChannel = async (q) => {
  try {
    let apiKey = process.env.EXPO_PUBLIC_NEYNAR_API_KEY

    if (!apiKey) {
      throw new Error(`API key is missing in NeynarContext: ${apiKey}`)
    }

    const response = await axios.get(
      'https://api.neynar.com/v2/farcaster/channel/search',
      {
        params: {
          q,
        },
        headers: {
          Accept: 'application/json',
          api_key: apiKey,
        },
      },
    )

    const { data } = response

    return {
      channels: data?.channels || [],
    }
  } catch (error) {
    console.log(error)
    return {
        channels: [],
    }
  }
}
