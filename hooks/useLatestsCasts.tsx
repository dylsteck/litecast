import useSWRInfinite from 'swr/infinite'

export const useLatestCasts = (type = 'home', parentUrl = '', fid = 616) => {

  let apiKey = process.env.EXPO_PUBLIC_NEYNAR_API_KEY

  if (!apiKey) {
    throw new Error(`API key is missing in NeynarContext: ${apiKey}`)
  }
  const getKey = (
    pageIndex: number,
    previousPageData: { next?: { cursor: string } } | null,
  ) => {
    const homeCastsUrl = `https://api.neynar.com/v2/farcaster/feed?feed_type=following&fid=${fid}&limit=25&cursor=${
      previousPageData?.next?.cursor || ''
    }`
    const trendingCastsUrl =
      parentUrl.length > 0
        ? `https://api.neynar.com/v2/farcaster/feed?feed_type=filter&filter_type=parent_url&fid=${fid}&parent_url=${parentUrl}&with_recasts=true&limit=25&cursor=${
            previousPageData?.next?.cursor || ''
          }`
        : `https://api.neynar.com/v2/farcaster/feed?feed_type=filter&filter_type=global_trending&fid=${fid}&with_recasts=true&limit=25&cursor=${
            previousPageData?.next?.cursor || ''
          }`
    if (previousPageData && !previousPageData.next) return null
    return type === 'home' && parentUrl.length === 0
      ? homeCastsUrl
      : (
        type === 'channel' && fid ? (
          homeCastsUrl
        ) : (
          trendingCastsUrl
        )
      )
  }

  const fetcher = (url: string) =>
    fetch(url, {
      headers: {
        Accept: 'application/json',
        api_key: apiKey,
      },
    }).then((res) => res.json())

  const { data, size, setSize, error } = useSWRInfinite(getKey, fetcher)

  const casts = data ? data.flatMap((page) => page.casts) : []
  const isLoading = !data && !error
  const isReachingEnd = data
    ? data[data.length - 1]?.next?.cursor == null
    : false

  const loadMore = () => {
    if (!isReachingEnd) {
      setSize(size + 1)
    }
  }

  return { casts, isLoading, isReachingEnd, loadMore }
}
