import { useContext } from 'react'
import useSWRInfinite from 'swr/infinite'

import { NeynarContext } from '../../providers/NeynarProvider'

const useLatestCasts = (type = 'home', parentUrl = '') => {
  const context = useContext(NeynarContext)
  if (!context) {
    throw new Error('useLatestCasts must be used within a NeynarProvider')
  }

  const getKey = (
    pageIndex: number,
    previousPageData: { next?: { cursor: string } } | null,
  ) => {
    const homeCastsUrl = `https://api.neynar.com/v2/farcaster/feed?feed_type=following&fid=616&limit=25&cursor=${
      previousPageData?.next?.cursor || ''
    }`
    const trendingCastsUrl =
      parentUrl.length > 0
        ? `https://api.neynar.com/v2/farcaster/feed?feed_type=filter&filter_type=parent_url&fid=616&parent_url=${parentUrl}&with_recasts=true&limit=25&cursor=${
            previousPageData?.next?.cursor || ''
          }`
        : `https://api.neynar.com/v2/farcaster/feed?feed_type=filter&filter_type=global_trending&fid=616&with_recasts=true&limit=25&cursor=${
            previousPageData?.next?.cursor || ''
          }`
    if (previousPageData && !previousPageData.next) return null
    return type === 'home' && parentUrl.length === 0
      ? homeCastsUrl
      : trendingCastsUrl
  }

  const fetcher = (url: string) =>
    fetch(url, {
      headers: {
        Accept: 'application/json',
        api_key: process.env.EXPO_PUBLIC_NEYNAR_API_KEY as string,
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

export default useLatestCasts
