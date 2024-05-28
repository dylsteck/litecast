type NeynarCastV2 = {
    object: string; // cast_hydrated?
    hash: string;
    thread_hash: string;
    parent_hash: string | null;
    parent_url: string | null;
    root_parent_url: string | null;
    parent_author: ParentAuthor;
    author: Author;
    text: string;
    timestamp: string;
    embeds: Embed[];
    reactions: Reactions;
    replies: {
        count: number;
    };
    mentioned_profiles: Author[];
};

type ParentAuthor = {
    fid: number | null;
};

type Author = {
    object: string;
    fid: number;
    custody_address: string;
    username: string;
    display_name: string;
    pfp_url: string | null;
    profile: {
        bio: Bio;
    };
    follower_count: number;
    following_count: number;
    verifications: string[];
    active_status: string;
};

type Bio = {
    text: string | null;
    mentioned_profiles: any[]; // Update with a more specific type if available
};

type Embed = {
    url?: string;
    cast_id?: {
        fid: number;
        hash: string;
    };
};

type Reactions = {
    likes: ReactionDetail[];
    recasts: ReactionDetail[];
};

type ReactionDetail = {
    fid: number;
    fname: string;
};