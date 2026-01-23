import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import { useMiniAppBridge } from '../services/miniapp';
import { SystemColors } from '../constants/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MiniAppModalProps {
  visible: boolean;
  url: string;
  domain: string;
  iconUrl?: string;
  title?: string;
  splashImageUrl?: string;
  splashBackgroundColor?: string;
  onClose: () => void;
  onMinimize?: () => void;
}

export const MiniAppModal: React.FC<MiniAppModalProps> = ({
  visible,
  url,
  domain,
  iconUrl,
  title: appTitle,
  splashImageUrl,
  splashBackgroundColor,
  onClose,
  onMinimize,
}) => {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  const [currentUrl, setCurrentUrl] = useState(url);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState('');
  const [showSplash, setShowSplash] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const displayTitle = appTitle || pageTitle || getDomainDisplay(domain);

  function getDomainDisplay(urlOrDomain: string) {
    try {
      const hostname = urlOrDomain.includes('://')
        ? new URL(urlOrDomain).hostname
        : urlOrDomain;
      return hostname.replace('www.', '');
    } catch {
      return urlOrDomain;
    }
  }

  // Reset state when closing and initialize slide animation
  useEffect(() => {
    if (!visible) {
      setIsMinimized(false);
      slideAnim.setValue(SCREEN_HEIGHT);
    } else if (visible && !isMinimized) {
      // Slide up when opening
      slideAnim.setValue(SCREEN_HEIGHT);
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, isMinimized, slideAnim]);

  // Update URL when prop changes
  useLayoutEffect(() => {
    if (visible && url) {
      setCurrentUrl(url);
      setShowSplash(true);
    }
  }, [visible, url]);

  // Auto-hide splash after 500ms
  useEffect(() => {
    if (!showSplash || !visible) return;
    const timeout = setTimeout(() => setShowSplash(false), 500);
    return () => clearTimeout(timeout);
  }, [showSplash, visible]);

  // Minimize function
  const minimize = useCallback(() => {
    // Slide down to bottom
    Animated.spring(slideAnim, {
      toValue: SCREEN_HEIGHT,
      damping: 20,
      stiffness: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsMinimized(true);
      onMinimize?.();
    });
  }, [slideAnim, onMinimize]);

  // Restore function with slide-up animation
  const restore = useCallback(() => {
    setIsMinimized(false);
    // Slide up from bottom
    slideAnim.setValue(SCREEN_HEIGHT);
    Animated.spring(slideAnim, {
      toValue: 0,
      damping: 20,
      stiffness: 200,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  // MiniApp bridge
  const {
    onMessage,
    primaryButton,
    backEnabled,
    bridgeReady,
    emit,
  } = useMiniAppBridge({
    webViewRef,
    domain,
    url: currentUrl,
    onReady: () => setShowSplash(false),
    onClose,
    onMinimize: minimize,
  });

  const handlePrimaryButtonPress = useCallback(() => {
    emit('primary_button_clicked');
  }, [emit]);

  const handleWebViewMessage = useCallback(
    (e: any) => {
      try {
        const data = JSON.parse(e.nativeEvent.data);
        if (data.type === '__CONSOLE__') return;
      } catch {
        // Pass through
      }
      onMessage(e);
    },
    [onMessage]
  );

  const handleNavigationStateChange = (navState: any) => {
    setCurrentUrl(navState.url);
    setPageTitle(navState.title);
    setLoading(navState.loading);
  };

  if (!visible) return null;

  return (
    <View style={[styles.overlay, isMinimized && styles.overlayTransparent]} pointerEvents="box-none">
      <StatusBar barStyle="dark-content" />
      
      {/* Full modal - hidden but mounted when minimized to preserve WebView session */}
      <Animated.View 
        style={[
          styles.container, 
          isMinimized && styles.containerHidden,
          {
            transform: [{ translateY: slideAnim }],
          }
        ]}
        pointerEvents={isMinimized ? 'none' : 'auto'}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
          <View style={styles.headerContent}>
            <View style={styles.leftButtons}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.headerButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Close mini app"
              >
                <Ionicons name="close" size={22} color={SystemColors.label} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={minimize}
                style={styles.headerButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Minimize mini app"
              >
                <Ionicons name="chevron-down" size={24} color={SystemColors.label} />
              </TouchableOpacity>
            </View>

            <View style={styles.titleContainer}>
              <View style={styles.titleGroup}>
                {iconUrl ? (
                  <Image source={{ uri: iconUrl }} style={styles.appIcon} resizeMode="cover" />
                ) : (
                  <View style={styles.appIconPlaceholder}>
                    <Ionicons name="cube" size={14} color={SystemColors.secondaryLabel} />
                  </View>
                )}
                <Text style={styles.appTitle} numberOfLines={1}>
                  {displayTitle}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.headerButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="More options"
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="ellipsis-horizontal" size={16} color={SystemColors.label} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <View style={styles.webViewWrapper}>
            {loading && !showSplash && (
              <View style={styles.loadingBar}>
                <View style={styles.loadingProgress} />
              </View>
            )}

            {bridgeReady && (
              <WebView
                ref={webViewRef}
                source={{ uri: currentUrl }}
                onNavigationStateChange={handleNavigationStateChange}
                onMessage={handleWebViewMessage}
                startInLoadingState
                renderLoading={() => (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={SystemColors.secondaryLabel} />
                  </View>
                )}
                style={styles.webView}
                userAgent="warpcast"
                allowsBackForwardNavigationGestures={!backEnabled}
                javaScriptEnabled
                domStorageEnabled
                mixedContentMode="compatibility"
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                cacheEnabled
                decelerationRate={0.998}
                nestedScrollEnabled
                bounces={false}
                overScrollMode="never"
                setBuiltInZoomControls={false}
                setDisplayZoomControls={false}
                textZoom={100}
              />
            )}

            {showSplash && (
              <View
                style={[
                  styles.splashOverlay,
                  splashBackgroundColor && { backgroundColor: splashBackgroundColor },
                ]}
              >
                {splashImageUrl ? (
                  <Image source={{ uri: splashImageUrl }} style={styles.splashImage} resizeMode="contain" />
                ) : iconUrl ? (
                  <Image source={{ uri: iconUrl }} style={styles.splashIcon} resizeMode="contain" />
                ) : (
                  <View style={styles.splashIconPlaceholder}>
                    <Ionicons name="cube" size={48} color={SystemColors.secondaryLabel} />
                  </View>
                )}
              </View>
            )}
          </View>

          {primaryButton && !primaryButton.hidden && (
            <View style={[styles.primaryButtonContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              <TouchableOpacity
                style={[styles.primaryButton, primaryButton.disabled && styles.primaryButtonDisabled]}
                onPress={handlePrimaryButtonPress}
                disabled={primaryButton.disabled || primaryButton.loading}
                accessibilityRole="button"
              >
                {primaryButton.loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>{primaryButton.text}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Minimized bubble - shown when minimized */}
      {isMinimized && (
        <View style={[styles.miniBubbleWrapper, { bottom: 20, right: 20 }]}>
          <TouchableOpacity
            onPress={restore}
            activeOpacity={0.9}
            accessibilityLabel={`Expand ${displayTitle}`}
            accessibilityRole="button"
          >
            <BlurView intensity={80} tint="light" style={styles.miniBubble}>
              {iconUrl ? (
                <Image source={{ uri: iconUrl }} style={styles.miniBubbleIcon} resizeMode="cover" />
              ) : (
                <View style={styles.miniBubbleIconPlaceholder}>
                  <Ionicons name="cube" size={20} color={SystemColors.secondaryLabel} />
                </View>
              )}
            </BlurView>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    backgroundColor: '#000',
  },
  overlayTransparent: {
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: SystemColors.background,
  },
  containerHidden: {
    opacity: 0,
  },
  // Header
  header: {
    backgroundColor: SystemColors.background,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 44,
  },
  leftButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIcon: {
    width: 24,
    height: 24,
    borderRadius: 5,
    marginRight: 8,
    backgroundColor: SystemColors.secondaryBackground,
  },
  appIconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 5,
    marginRight: 8,
    backgroundColor: SystemColors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: SystemColors.label,
    letterSpacing: -0.3,
  },
  menuIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: SystemColors.separator,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Minimized bubble
  miniBubbleWrapper: {
    position: 'absolute',
    zIndex: 1001,
  },
  miniBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  miniBubbleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  miniBubbleIconPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Content
  contentContainer: {
    flex: 1,
    backgroundColor: SystemColors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  webViewWrapper: {
    flex: 1,
    backgroundColor: SystemColors.background,
  },
  webView: {
    flex: 1,
    backgroundColor: SystemColors.background,
  },
  loadingBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.05)',
    zIndex: 10,
  },
  loadingProgress: {
    height: '100%',
    width: '35%',
    backgroundColor: '#007AFF',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SystemColors.background,
  },
  splashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SystemColors.background,
    zIndex: 20,
  },
  splashImage: {
    width: 80,
    height: 80,
    borderRadius: 18,
  },
  splashIcon: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  splashIconPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: SystemColors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: SystemColors.background,
  },
  primaryButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
