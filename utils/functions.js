export const filterFeedBasedOnFID = (feed, lower_limit_feed=0, upper_limit_feed=Infinity) => {
    if (upper_limit_feed === 0) {
        return feed
    }
    if (!feed || feed.length === 0) {
        return [];
    }

    let upper = upper_limit_feed
    if(upper === null || upper === undefined) {
        upper = Infinity
    }

    let lower = lower_limit_feed
    if (lower === null || lower === undefined) {
        lower = 0
    }
    return feed.filter((item) => item?.author?.fid >= lower && item?.author?.fid <= upper);
}

const getChannelIdFromUrl = (channelUrl = "") => {
    // "parent_url": "https://warpcast.com/~/channel/degentokenbase"
    if (!channelUrl) {
        return null
    }
    const channelId = channelUrl.split('/').pop()
    return channelId
}

export const filterCastsBasedOnChannels = (casts, channels) => {
    return casts.filter((cast) => channels.includes(getChannelIdFromUrl(cast?.parent_url)))
}

export const filterCastsToMute = (casts, mutedChannels) => {
    return casts.filter((cast) => !mutedChannels.includes(getChannelIdFromUrl(cast?.parent_url)))
}