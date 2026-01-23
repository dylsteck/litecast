import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Modal,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  SafeAreaView,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SystemColors } from '../constants/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageViewerProps {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
}

const ImageViewer = ({ visible, imageUrl, onClose }: ImageViewerProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  
  // Track pinch gesture
  const initialDistance = useRef(0);
  const isPinching = useRef(false);
  
  // Reset transforms when modal opens/closes
  React.useEffect(() => {
    if (visible) {
      scale.setValue(1);
      translateX.setValue(0);
      translateY.setValue(0);
      lastScale.current = 1;
      lastTranslateX.current = 0;
      lastTranslateY.current = 0;
    }
  }, [visible]);

  const getDistance = (touches: any[]) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt) => {
        if (evt.nativeEvent.touches.length === 2) {
          isPinching.current = true;
          initialDistance.current = getDistance(evt.nativeEvent.touches);
        }
      },
      
      onPanResponderMove: (evt, gestureState) => {
        if (evt.nativeEvent.touches.length === 2 && isPinching.current) {
          // Pinch to zoom
          const currentDistance = getDistance(evt.nativeEvent.touches);
          const newScale = Math.max(1, Math.min(4, lastScale.current * (currentDistance / initialDistance.current)));
          scale.setValue(newScale);
        } else if (evt.nativeEvent.touches.length === 1 && lastScale.current > 1) {
          // Pan when zoomed in
          const newX = lastTranslateX.current + gestureState.dx;
          const newY = lastTranslateY.current + gestureState.dy;
          translateX.setValue(newX);
          translateY.setValue(newY);
        }
      },
      
      onPanResponderRelease: (evt, gestureState) => {
        if (isPinching.current) {
          isPinching.current = false;
          // @ts-ignore - Animated.Value has _value
          lastScale.current = scale._value || 1;
          
          // Snap back to 1 if close to it
          if (lastScale.current < 1.1) {
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: true,
              friction: 5,
            }).start();
            lastScale.current = 1;
            
            // Also reset position
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
            lastTranslateX.current = 0;
            lastTranslateY.current = 0;
          }
        } else {
          // @ts-ignore
          lastTranslateX.current = translateX._value || 0;
          // @ts-ignore
          lastTranslateY.current = translateY._value || 0;
        }
      },
    })
  ).current;

  const handleDoubleTap = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const onTap = () => {
    if (handleDoubleTap.current) {
      // Double tap detected - toggle zoom
      clearTimeout(handleDoubleTap.current);
      handleDoubleTap.current = null;
      
      if (lastScale.current > 1) {
        // Zoom out
        Animated.parallel([
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }),
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
        ]).start();
        lastScale.current = 1;
        lastTranslateX.current = 0;
        lastTranslateY.current = 0;
      } else {
        // Zoom in to 2x
        Animated.spring(scale, { toValue: 2, useNativeDriver: true, friction: 5 }).start();
        lastScale.current = 2;
      }
    } else {
      // Wait for potential double tap
      handleDoubleTap.current = setTimeout(() => {
        handleDoubleTap.current = null;
        // Single tap - could close but we don't want accidental closes
      }, 300);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.98)" />
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header with close button */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {/* Image container with gestures */}
          <View style={styles.imageContainer} {...panResponder.panHandlers}>
            <TouchableOpacity activeOpacity={1} onPress={onTap} style={styles.imageTouchable}>
              <Animated.Image
                source={{ uri: imageUrl }}
                style={[
                  styles.image,
                  {
                    transform: [
                      { scale },
                      { translateX },
                      { translateY },
                    ],
                  },
                ]}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.98)',
  },
  safeArea: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
});

export default ImageViewer;
