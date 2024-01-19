import { useState, useEffect } from 'react';

export type WarpcastUserProfile = {
  fid: number;
  username: string;
  displayName: string;
  pfp: {
    url: string;
    verified: boolean;
  };
  profile: {
    bio: {
      text: string;
      mentions: string[];
      channelMentions: any[];
    };
    location: {
      placeId: string;
      description: string;
    };
  };
  followerCount: number;
  followingCount: number;
  activeOnFcNetwork: boolean;
  referrerUsername: string;
  viewerContext: {
    following: boolean;
    followedBy: boolean;
    canSendDirectCasts: boolean;
    hasUploadedInboxKeys: boolean;
  };
}

export type WarpcastUserProfileResponse = {
  result: {
    user: WarpcastUserProfile;
    inviterIsReferrer: boolean;
    collectionsOwned: any[];
    extras: {
      fid: number;
      custodyAddress: string;
    };
  };
};

function useWarpcastUser(fid: number | null) {
  const [data, setData] = useState<WarpcastUserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (fid === null) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://client.warpcast.com/v2/user?fid=${fid}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const json = await response.json() as WarpcastUserProfileResponse;
        setData(json.result.user);
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fid]);

  return { user: data, loading, error };
}

export default useWarpcastUser;