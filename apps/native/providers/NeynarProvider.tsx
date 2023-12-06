import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useContext, useCallback, useEffect, ReactNode } from 'react';

import { API_URL } from '../consants';

export interface FarcasterUser {
  signer_uuid: string;
  public_key: string;
  status: string;
  signer_approval_url?: string;
  fid?: number;
}

interface NeynarContextProps {
  farcasterUser: FarcasterUser | null;
  setFarcasterUser: React.Dispatch<React.SetStateAction<FarcasterUser | null>>;
  handleSignIn: () => Promise<void>;
  loading: boolean;
}

const NeynarContext = createContext<NeynarContextProps | undefined>(undefined);

export const useLogin = () => {
  const context = useContext(NeynarContext);
  if (!context) {
    throw new Error('useLogin must be used within a NeynarProvider');
  }
  return context;
};

export const NeynarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/neynar/signer`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      const data = await response.json();
      if (response.status === 200) {
        await AsyncStorage.setItem('FARCASTER_USER', JSON.stringify(data));
        setFarcasterUser(data);
      }
    } catch (error) {
      console.error('API Call failed', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      const storedData = await AsyncStorage.getItem('FARCASTER_USER');
      if (storedData) {
        const user: FarcasterUser = JSON.parse(storedData);
        setFarcasterUser(user);
      }
    })();
  }, []);

  useEffect(() => {
    if (farcasterUser && farcasterUser.status === 'pending_approval') {
      const intervalId = setInterval(async () => {
        try {
          const response = await fetch(`${API_URL}/neynar/signer?signer_uuid=${farcasterUser.signer_uuid}`);
          const updatedUser = await response.json() as FarcasterUser;
          if (updatedUser?.status === 'approved') {
            await AsyncStorage.setItem('FARCASTER_USER', JSON.stringify(updatedUser));
            console.log(updatedUser);
            setFarcasterUser(updatedUser);
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error('Error during polling', error);
        }
      }, 2000);

      return () => clearInterval(intervalId);
    }
  }, [farcasterUser]);

  return (
    <NeynarContext.Provider value={{ farcasterUser, handleSignIn, loading, setFarcasterUser }}>
      {children}
    </NeynarContext.Provider>
  );
};