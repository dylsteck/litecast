import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { 
  generateSignerKeypair, 
  createSignedKeyRequest, 
  pollSignerStatus, 
  storeSigner, 
  markOnboardingSeen,
  hasSeenOnboarding,
  hasActiveSigner 
} from '../lib/farcaster/signer';

type ConnectState = 'idle' | 'generating' | 'requesting' | 'waiting' | 'completed' | 'error';

export default function IndexScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [connectState, setConnectState] = useState<ConnectState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if user has seen onboarding and has an active signer
      const seenOnboarding = await hasSeenOnboarding();
      const hasSigner = await hasActiveSigner();
      
      // On web, skip onboarding for now (legacy behavior)
      if (Platform.OS === 'web') {
        router.push('/(tabs)');
        return;
      }

      // If user has completed onboarding and has signer, go to main app
      if (seenOnboarding && hasSigner) {
        router.push('/(tabs)');
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = async () => {
    try {
      // Mark onboarding as seen without connecting Farcaster
      await markOnboardingSeen();
      // Navigate to main app
      router.push('/(tabs)');
    } catch (error) {
      console.error('Continue as guest error:', error);
      // Still navigate even if marking fails
      router.push('/(tabs)');
    }
  };

  const handleConnectFarcaster = async () => {
    try {
      setErrorMessage(null);
      setConnectState('generating');

      // Step 1: Generate Ed25519 keypair locally
      const { privateKey, publicKey } = await generateSignerKeypair();
      setConnectState('requesting');

      // Step 2: Create signed key request via our API
      // The API handles the EIP-712 signature using app credentials
      const signedKeyRequest = await createSignedKeyRequest(publicKey);

      const { token, deeplinkUrl } = signedKeyRequest;
      
      // Step 3: Store signer with token for polling
      await storeSigner({
        privateKey,
        publicKey,
        token,
        createdAt: Date.now(),
      });

      setConnectState('waiting');

      // Step 4: Open deep link to Farcaster app
      const canOpen = await Linking.canOpenURL(deeplinkUrl);
      if (canOpen) {
        await Linking.openURL(deeplinkUrl);
      } else {
        // Fallback: try farcaster:// protocol directly
        const fallbackUrl = deeplinkUrl.replace('https://', 'farcaster://');
        try {
          await Linking.openURL(fallbackUrl);
        } catch {
          setErrorMessage('Could not open Farcaster app. Please install it and try again.');
          setConnectState('error');
          return;
        }
      }

      // Step 5: Poll for completion
      try {
        const completedStatus = await pollSignerStatus(token, {
          interval: 2000,
          timeout: 300000, // 5 minutes
          onStatusUpdate: (status) => {
            console.log('Signer status:', status.state);
          },
        });

        // Step 6: Update stored signer with FID
        await storeSigner({
          privateKey,
          publicKey,
          fid: completedStatus.userFid,
          token,
          createdAt: Date.now(),
        });

        // Mark onboarding as seen
        await markOnboardingSeen();
        
        setConnectState('completed');
        
        // Navigate to main app after a brief delay
        setTimeout(() => {
          router.push('/(tabs)');
        }, 1000);
      } catch (pollError: any) {
        console.error('Polling error:', pollError);
        setErrorMessage(pollError.message || 'Failed to complete signer approval. Please try again.');
        setConnectState('error');
      }
    } catch (error: any) {
      console.error('Connect error:', error);
      setErrorMessage(error.message || 'Failed to connect Farcaster. Please try again.');
      setConnectState('error');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text 
            style={[
              styles.title,
              {
                fontFamily: Platform.select({
                  ios: 'Georgia',
                  android: 'serif',
                  default: 'Georgia, serif'
                }),
              }
            ]}
          >
            Litecast
          </Text>
          <Text 
            style={[
              styles.subtitle,
              {
                fontFamily: Platform.select({
                  ios: 'System',
                  android: 'sans-serif',
                  default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui'
                }),
              }
            ]}
          >
            A beautiful yet simple{'\n'}Farcaster client
          </Text>
        </View>

        {/* Connect Button */}
        <View style={styles.buttonContainer}>
          {connectState === 'idle' && (
            <>
              <TouchableOpacity
                onPress={handleConnectFarcaster}
                style={styles.connectButton}
                activeOpacity={0.9}
              >
                <Text 
                  style={[
                    styles.connectButtonText,
                    {
                      fontFamily: Platform.select({
                        ios: 'System',
                        android: 'sans-serif-medium',
                        default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui'
                      }),
                    }
                  ]}
                >
                  Connect Farcaster
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleContinueAsGuest}
                style={styles.guestButton}
                activeOpacity={0.7}
              >
                <Text 
                  style={[
                    styles.guestButtonText,
                    {
                      fontFamily: Platform.select({
                        ios: 'System',
                        android: 'sans-serif',
                        default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui'
                      }),
                    }
                  ]}
                >
                  Continue as Guest
                </Text>
              </TouchableOpacity>
            </>
          )}

          {connectState === 'generating' && (
            <View style={styles.statusContainer}>
              <ActivityIndicator size="small" color="#8B5CF6" />
              <Text style={styles.statusText}>Generating signer...</Text>
            </View>
          )}

          {connectState === 'requesting' && (
            <View style={styles.statusContainer}>
              <ActivityIndicator size="small" color="#8B5CF6" />
              <Text style={styles.statusText}>Creating request...</Text>
            </View>
          )}

          {connectState === 'waiting' && (
            <View style={styles.statusContainer}>
              <ActivityIndicator size="small" color="#8B5CF6" />
              <Text style={styles.statusText}>
                Waiting for approval...{'\n'}
                <Text style={styles.statusSubtext}>Please approve in the Farcaster app</Text>
              </Text>
            </View>
          )}

          {connectState === 'completed' && (
            <View style={styles.statusContainer}>
              <Text style={styles.successText}>✓ Connected!</Text>
              <Text style={styles.statusText}>Redirecting...</Text>
            </View>
          )}

          {connectState === 'error' && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {errorMessage || 'An error occurred'}
              </Text>
              <TouchableOpacity
                onPress={handleConnectFarcaster}
                style={styles.retryButton}
                activeOpacity={0.9}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#F8F8F8',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 48,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 16,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 9999,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  statusSubtext: {
    fontSize: 12,
  },
  successText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorContainer: {
    alignItems: 'center',
    width: '100%',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  guestButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  guestButtonText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '400',
  },
});
