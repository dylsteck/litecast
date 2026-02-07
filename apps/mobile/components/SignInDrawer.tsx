import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Linking from 'expo-linking';
import {
  generateSignerKeypair,
  createSignedKeyRequest,
  pollSignerStatus,
  storeSigner,
  markOnboardingSeen,
} from '../lib/farcaster/signer';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SignInDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type ConnectState = 'idle' | 'generating' | 'requesting' | 'waiting' | 'completed' | 'error';

export function SignInDrawer({ isOpen, onClose, onSuccess }: SignInDrawerProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [connectState, setConnectState] = React.useState<ConnectState>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state when opening
      setConnectState('idle');
      setErrorMessage(null);
      
      // Animate in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 28,
          stiffness: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: SCREEN_HEIGHT,
          damping: 28,
          stiffness: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen, slideAnim, fadeAnim]);

  const handleConnectFarcaster = async () => {
    try {
      setErrorMessage(null);
      setConnectState('generating');

      // Step 1: Generate Ed25519 keypair locally
      const { privateKey, publicKey } = await generateSignerKeypair();
      setConnectState('requesting');

      // Step 2: Create signed key request via our API
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

        // Close drawer and trigger success callback
        setTimeout(() => {
          onClose();
          onSuccess?.();
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

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]} />
          )}
        </Animated.View>

        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={connectState === 'idle' || connectState === 'error' ? onClose : undefined}
        />

        {/* Drawer */}
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <SafeAreaView edges={['bottom']} style={styles.drawerContent}>
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <FarcasterIcon />
              </View>
            </View>

            {/* Content */}
            <Text style={styles.title}>Sign in to Litecast</Text>
            <Text style={styles.description}>
              Connect your Farcaster account to view notifications, access your profile, and interact with casts.
            </Text>

            {/* Status/Buttons */}
            {connectState === 'idle' && (
              <>
                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={handleConnectFarcaster}
                  activeOpacity={0.9}
                >
                  <Text style={styles.signInButtonText}>Sign in with Farcaster</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Maybe later</Text>
                </TouchableOpacity>
              </>
            )}

            {connectState === 'generating' && (
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>Generating signer...</Text>
              </View>
            )}

            {connectState === 'requesting' && (
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>Creating request...</Text>
              </View>
            )}

            {connectState === 'waiting' && (
              <View style={styles.statusContainer}>
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
                  style={styles.retryButton}
                  onPress={handleConnectFarcaster}
                  activeOpacity={0.9}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function FarcasterIcon() {
  return (
    <View style={styles.farcasterIcon}>
      <Text style={styles.farcasterIconText}>F</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  drawerContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  handleContainer: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#C7C7CC',
    borderRadius: 2,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#8B5CF6',
    opacity: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  farcasterIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  farcasterIconText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  signInButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 14,
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statusText: {
    color: '#8E8E93',
    fontSize: 14,
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
    borderRadius: 12,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
