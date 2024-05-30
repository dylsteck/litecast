export const filterFeedBasedOnFID = (feed, lower_limit_feed, upper_limit_feed) => {
    if(upper_limit_feed === 0) {
        return feed
    }
    if (!feed || feed.length === 0) {
        return [];
    }
    return feed.filter((item) => item?.author?.fid >= lower_limit_feed && item?.author?.fid <= upper_limit_feed);
}