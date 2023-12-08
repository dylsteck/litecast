import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useContext, useEffect } from 'react';

const API_KEY = "";
const API_URL = 'https://api.neynar.com';

export interface FarcasterUser {
  signer_uuid: string;
  public_key: string;
  status: string;
  signer_approval_url?: string;
  fid?: number;
}

export interface Cast {
  hash: string;
  author: {
    username: string;
    pfp_url: string;
    display_name: string;
  };
  text: string;
  timestamp: string;
  reactions: {
    likes: Array<{ fid: number, fname: string }>;
    recasts: Array<{ fid: number, fname: string }>;
  };
  replies: { count: number };
}

interface NeynarContextProps {
  farcasterUser: FarcasterUser | null;
  setFarcasterUser: React.Dispatch<React.SetStateAction<FarcasterUser | null>>;
  handleSignIn: () => Promise<void>;
  loading: boolean;
}

export const NeynarContext = createContext<NeynarContextProps | undefined>(undefined);

export const NeynarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/neynar/signer`, {
        headers: {
          'Content-Type': 'application/json',
          'api_key': API_KEY
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
  };

  useEffect(() => {
    const fetchData = async () => {
      const storedData = await AsyncStorage.getItem('FARCASTER_USER');
      if (storedData) {
        const user: FarcasterUser = JSON.parse(storedData);
        setFarcasterUser(user);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (farcasterUser && farcasterUser.status === 'pending_approval') {
      const intervalId = setInterval(async () => {
        try {
          const response = await fetch(`${API_URL}/neynar/signer?signer_uuid=${farcasterUser.signer_uuid}`, {
            headers: {
              'api_key': API_KEY
            },
          });
          const updatedUser = await response.json() as FarcasterUser;
          if (updatedUser?.status === 'approved') {
            await AsyncStorage.setItem('FARCASTER_USER', JSON.stringify(updatedUser));
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

export const useLogin = () => {
  const context = useContext(NeynarContext);
  if (!context) {
    throw new Error('useLogin must be used within a NeynarProvider');
  }
  return context;
};