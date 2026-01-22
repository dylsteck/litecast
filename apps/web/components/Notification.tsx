import Link from 'next/link';
import type { NeynarNotification } from '@litecast/types';
import { formatRelativeTime } from '@litecast/utils';
import { UserAvatar } from './UserAvatar';
import clsx from 'clsx';

interface NotificationProps {
  notification: NeynarNotification;
}

export function Notification({ notification }: NotificationProps) {
  const { type, most_recent_timestamp } = notification;

  return (
    <div className="flex gap-3 p-4 border-b border-system-separator hover:bg-system-secondary-background/50 transition-colors">
      <div className="flex-shrink-0">
        <NotificationIcon type={type} />
      </div>
      <div className="flex-1 min-w-0">
        <NotificationContent notification={notification} />
        <span className="text-xs text-system-tertiary-label mt-1 block">
          {formatRelativeTime(most_recent_timestamp)}
        </span>
      </div>
    </div>
  );
}

function NotificationContent({ notification }: { notification: NeynarNotification }) {
  const { type, cast, follows, reactions } = notification;

  switch (type) {
    case 'follows': {
      const users = follows?.map((f) => f.user) || [];
      const displayUsers = users.slice(0, 3);
      const remainingCount = users.length - 3;
      return (
        <div>
          <div className="flex items-center gap-1 mb-1">
            {displayUsers.map((user) => (
              <UserAvatar
                key={user.fid}
                username={user.username}
                pfpUrl={user.pfp_url}
                size="sm"
              />
            ))}
          </div>
          <p className="text-sm text-system-label">
            <Link href={`/${displayUsers[0]?.username}`} className="font-semibold hover:underline">
              {displayUsers[0]?.display_name}
            </Link>
            {displayUsers.length > 1 && (
              <span>
                {' '}and {remainingCount > 0 ? `${users.length - 1} others` : displayUsers.slice(1).map((u, i) => (
                  <span key={u.fid}>
                    {i > 0 && ', '}
                    <Link href={`/${u.username}`} className="font-semibold hover:underline">
                      {u.display_name}
                    </Link>
                  </span>
                ))}
              </span>
            )}
            {' '}followed you
          </p>
        </div>
      );
    }

    case 'likes':
    case 'recasts': {
      const users = reactions?.map((r) => r.user) || [];
      const displayUsers = users.slice(0, 3);
      const action = type === 'likes' ? 'liked' : 'recasted';
      return (
        <div>
          <div className="flex items-center gap-1 mb-1">
            {displayUsers.map((user) => (
              <UserAvatar
                key={user.fid}
                username={user.username}
                pfpUrl={user.pfp_url}
                size="sm"
              />
            ))}
          </div>
          <p className="text-sm text-system-label">
            <Link href={`/${displayUsers[0]?.username}`} className="font-semibold hover:underline">
              {displayUsers[0]?.display_name}
            </Link>
            {users.length > 1 && ` and ${users.length - 1} others`}
            {' '}{action} your cast
          </p>
          {cast && (
            <Link href={`/cast/${cast.hash}`}>
              <p className="text-sm text-system-secondary-label mt-1 line-clamp-2">
                {cast.text}
              </p>
            </Link>
          )}
        </div>
      );
    }

    case 'mentions':
    case 'replies': {
      if (!cast) return null;
      return (
        <Link href={`/cast/${cast.hash}`}>
          <div className="flex items-center gap-2 mb-1">
            <UserAvatar
              username={cast.author.username}
              pfpUrl={cast.author.pfp_url}
              size="sm"
              linked={false}
            />
            <span className="font-semibold text-sm text-system-label">
              {cast.author.display_name}
            </span>
            <span className="text-sm text-system-secondary-label">
              @{cast.author.username}
            </span>
          </div>
          <p className="text-sm text-system-label line-clamp-3">
            {cast.text}
          </p>
        </Link>
      );
    }

    default:
      return null;
  }
}

function NotificationIcon({ type }: { type: NeynarNotification['type'] }) {
  const iconClass = 'w-8 h-8 p-1.5 rounded-full';

  switch (type) {
    case 'follows':
      return (
        <div className={clsx(iconClass, 'bg-blue-100 text-blue-600')}>
          <UserPlusIcon />
        </div>
      );
    case 'likes':
      return (
        <div className={clsx(iconClass, 'bg-red-100 text-red-500')}>
          <HeartIcon />
        </div>
      );
    case 'recasts':
      return (
        <div className={clsx(iconClass, 'bg-green-100 text-green-600')}>
          <RecastIcon />
        </div>
      );
    case 'mentions':
      return (
        <div className={clsx(iconClass, 'bg-purple-100 text-purple-600')}>
          <AtIcon />
        </div>
      );
    case 'replies':
      return (
        <div className={clsx(iconClass, 'bg-brand-primary/10 text-brand-primary')}>
          <ReplyIcon />
        </div>
      );
  }
}

function UserPlusIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function RecastIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function AtIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-5.478 3.717A4 4 0 0016 12zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9" />
    </svg>
  );
}

function ReplyIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  );
}
