'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchUsers, useSearchCasts } from '@litecast/hooks';
import { TabPills } from './TabPills';
import { FeedList } from './FeedList';
import { UserAvatar } from './UserAvatar';
import { EmptyState } from './EmptyState';

const TABS = [
  { id: 'users', label: 'People' },
  { id: 'casts', label: 'Casts' },
];

export default function ExploreContent() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('litecast-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const saveSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 8);
    setRecentSearches(updated);
    localStorage.setItem('litecast-recent-searches', JSON.stringify(updated));
  }, [recentSearches]);

  const removeSearch = useCallback((searchToRemove: string) => {
    const updated = recentSearches.filter((s) => s !== searchToRemove);
    setRecentSearches(updated);
    localStorage.setItem('litecast-recent-searches', JSON.stringify(updated));
  }, [recentSearches]);

  const clearAllSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('litecast-recent-searches');
  }, []);

  const usersQuery = useSearchUsers(debouncedQuery, activeTab === 'users' && debouncedQuery.length > 0);
  const castsQuery = useSearchCasts(debouncedQuery, activeTab === 'casts' && debouncedQuery.length > 0);

  const users = useMemo(() => {
    return usersQuery.data?.pages.flatMap((page) => page.result.users) || [];
  }, [usersQuery.data]);

  const casts = useMemo(() => {
    return castsQuery.data?.pages.flatMap((page) => page.result.casts) || [];
  }, [castsQuery.data]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveSearch(query.trim());
    }
  };

  const handleRecentClick = (search: string) => {
    setQuery(search);
    saveSearch(search);
    inputRef.current?.focus();
  };

  const isSearching = debouncedQuery.length > 0;

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-system-separator">
        <div className="px-4 py-3">
          <form onSubmit={handleSearch}>
            <div 
              className={`
                relative flex items-center transition-all duration-200 ease-out
                bg-system-secondary-background/60 rounded-xl
                ${isFocused ? 'ring-2 ring-system-label/10 bg-system-secondary-background' : ''}
              `}
            >
              <SearchIcon className="absolute left-3 w-[17px] h-[17px] text-system-tertiary-label pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Search people or casts"
                className="w-full pl-9 pr-9 py-2 bg-transparent text-[15px] text-system-label placeholder:text-system-tertiary-label focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 p-1 rounded-full bg-system-tertiary-label/20 hover:bg-system-tertiary-label/30 transition-colors"
                  aria-label="Clear search"
                >
                  <XIcon className="w-3.5 h-3.5 text-system-secondary-label" />
                </button>
              )}
            </div>
          </form>
        </div>

        {isSearching && (
          <div className="px-4 pb-3">
            <TabPills tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
          </div>
        )}
      </div>

      {/* Content */}
      {isSearching ? (
        <div>
          {activeTab === 'users' && (
            <UsersList
              users={users}
              isLoading={usersQuery.isLoading}
              hasNextPage={usersQuery.hasNextPage}
              fetchNextPage={usersQuery.fetchNextPage}
              isFetchingNextPage={usersQuery.isFetchingNextPage}
              query={debouncedQuery}
            />
          )}
          {activeTab === 'casts' && (
            <FeedList
              casts={casts}
              isLoading={castsQuery.isLoading}
              hasNextPage={castsQuery.hasNextPage}
              fetchNextPage={castsQuery.fetchNextPage}
              isFetchingNextPage={castsQuery.isFetchingNextPage}
              emptyTitle="No casts found"
              emptyDescription={`No casts matching "${debouncedQuery}"`}
            />
          )}
        </div>
      ) : (
        <div className="px-4 pt-6 pb-32">
          {recentSearches.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[15px] font-semibold text-system-label">
                  Recent Searches
                </h3>
                <button
                  onClick={clearAllSearches}
                  className="text-[13px] font-medium text-system-secondary-label hover:text-system-label transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-0">
                {recentSearches.map((search, index) => (
                  <div
                    key={search}
                    className="flex items-center justify-between py-2.5 border-b border-system-separator/50 last:border-0"
                    style={{ 
                      animationDelay: `${index * 30}ms`,
                      animation: 'fadeSlideIn 0.3s ease-out forwards',
                      opacity: 0,
                    }}
                  >
                    <button
                      onClick={() => handleRecentClick(search)}
                      className="flex-1 text-left text-[15px] text-system-label truncate pr-3"
                    >
                      {search}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSearch(search);
                      }}
                      className="p-1.5 -mr-1.5 rounded-full text-system-tertiary-label hover:text-system-secondary-label hover:bg-system-secondary-background/50 transition-all"
                      aria-label={`Remove ${search} from recent searches`}
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-system-secondary-background/50 flex items-center justify-center mb-4">
                <SearchIcon className="w-7 h-7 text-system-tertiary-label" />
              </div>
              <h3 className="text-lg font-semibold text-system-label mb-1">
                Search Farcaster
              </h3>
              <p className="text-[15px] text-system-secondary-label max-w-[240px]">
                Find people, casts, and conversations across the network
              </p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

interface UsersListProps {
  users: any[];
  isLoading: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  query: string;
}

function UsersList({ users, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage, query }: UsersListProps) {
  if (isLoading) {
    return (
      <div className="divide-y divide-system-separator">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="flex items-center gap-3 px-4 py-3"
            style={{
              animationDelay: `${i * 50}ms`,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          >
            <div className="w-11 h-11 bg-system-secondary-background rounded-full" />
            <div className="flex-1">
              <div className="w-28 h-4 bg-system-secondary-background rounded-md mb-1.5" />
              <div className="w-20 h-3.5 bg-system-secondary-background/70 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-14 h-14 rounded-full bg-system-secondary-background/50 flex items-center justify-center mb-4">
          <UserIcon className="w-6 h-6 text-system-tertiary-label" />
        </div>
        <h3 className="text-base font-semibold text-system-label mb-1">
          No people found
        </h3>
        <p className="text-[15px] text-system-secondary-label">
          No results for "{query}"
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-system-separator">
      {users.map((user, index) => (
        <Link
          key={user.fid}
          href={`/${user.username}`}
          className="flex items-center gap-3 px-4 py-3 hover:bg-system-secondary-background/30 transition-colors"
          style={{
            animationDelay: `${index * 30}ms`,
            animation: 'fadeSlideIn 0.25s ease-out forwards',
            opacity: 0,
          }}
        >
          <UserAvatar username={user.username} pfpUrl={user.pfp_url} size="md" linked={false} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[15px] text-system-label truncate">
              {user.display_name}
            </p>
            <p className="text-[14px] text-system-secondary-label">
              @{user.username}
            </p>
          </div>
          <ChevronRightIcon className="w-4 h-4 text-system-tertiary-label" />
        </Link>
      ))}
      {hasNextPage && (
        <button
          onClick={fetchNextPage}
          disabled={isFetchingNextPage}
          className="w-full py-4 text-[15px] text-brand-primary font-medium hover:bg-system-secondary-background/30 transition-colors disabled:opacity-50"
        >
          {isFetchingNextPage ? 'Loading...' : 'Show more'}
        </button>
      )}

      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}
