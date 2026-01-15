import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = '@litecast:recent_searches';
const MAX_RECENT_SEARCHES = 10;

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addRecentSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    try {
      const trimmedQuery = query.trim();
      setRecentSearches(prev => {
        const updated = [
          trimmedQuery,
          ...prev.filter(s => s.toLowerCase() !== trimmedQuery.toLowerCase())
        ].slice(0, MAX_RECENT_SEARCHES);
        
        AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated)).catch(err => {
          console.error('Failed to save recent search:', err);
        });
        
        return updated;
      });
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  }, []);

  const clearRecentSearches = useCallback(async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  }, []);

  return {
    recentSearches,
    isLoading,
    addRecentSearch,
    clearRecentSearches,
  };
}
