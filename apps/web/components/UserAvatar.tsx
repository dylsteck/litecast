import Link from 'next/link';
import clsx from 'clsx';

interface UserAvatarProps {
  username: string;
  pfpUrl: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  linked?: boolean;
  className?: string;
}

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-20 h-20',
};

export function UserAvatar({
  username,
  pfpUrl,
  size = 'md',
  linked = true,
  className,
}: UserAvatarProps) {
  const avatar = (
    <img
      src={pfpUrl}
      alt={`@${username}`}
      className={clsx(
        'rounded-full object-cover bg-system-secondary-background',
        sizes[size],
        className
      )}
    />
  );

  if (linked) {
    return (
      <Link href={`/${username}`} className="flex-shrink-0">
        {avatar}
      </Link>
    );
  }

  return avatar;
}
