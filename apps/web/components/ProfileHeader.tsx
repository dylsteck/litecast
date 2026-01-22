import type { NeynarUser } from '@litecast/types';
import { UserAvatar } from './UserAvatar';

interface ProfileHeaderProps {
  user: NeynarUser;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="px-4 py-6 border-b border-system-separator">
      <div className="flex items-start gap-4">
        <UserAvatar
          username={user.username}
          pfpUrl={user.pfp_url}
          size="xl"
          linked={false}
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-system-label truncate">
            {user.display_name}
          </h1>
          <p className="text-system-secondary-label">@{user.username}</p>
        </div>
      </div>

      {user.profile?.bio?.text && (
        <p className="mt-4 text-system-label whitespace-pre-wrap">
          {user.profile.bio.text}
        </p>
      )}

      <div className="flex items-center gap-4 mt-4">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-system-label">
            {formatNumber(user.following_count)}
          </span>
          <span className="text-system-secondary-label">Following</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold text-system-label">
            {formatNumber(user.follower_count)}
          </span>
          <span className="text-system-secondary-label">Followers</span>
        </div>
      </div>

      {user.power_badge && (
        <div className="mt-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary">
            Power Badge
          </span>
        </div>
      )}
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
