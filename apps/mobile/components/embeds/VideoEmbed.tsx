import React, { useState, useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NeynarEmbed } from '@litecast/types';
import { SystemColors } from '../../constants/Colors';
import { getVideoAspectRatio } from './utils';

// Lazy load expo-av to prevent import errors
let Video: any = null;
let ResizeMode: any = null;

try {
  const expoAv = require('expo-av');
  Video = expoAv.Video;
  ResizeMode = expoAv.ResizeMode;
} catch (e) {
  console.warn('expo-av not available:', e);
}

interface VideoEmbedProps {
  embed: NeynarEmbed;
}

const VideoEmbed = ({ embed }: VideoEmbedProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<any>(null);
  const videoUrl = embed.url || '';

  // Get aspect ratio from metadata, fallback to 16:9 if not available
  const aspectRatio = useMemo(() => {
    const ratio = getVideoAspectRatio(embed);
    return ratio || 16 / 9; // Default to 16:9 if no metadata available
  }, [embed]);

  // If expo-av isn't available, show a placeholder
  if (!Video) {
    return (
      <View style={styles.container}>
        <View style={[styles.videoContainer, styles.placeholder, { aspectRatio }]}>
          <Ionicons name="play-circle-outline" size={48} color={SystemColors.secondaryLabel} />
          <Text style={styles.placeholderText}>Video</Text>
        </View>
      </View>
    );
  }

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await videoRef.current.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const handleLoad = () => {
    setShowControls(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.videoContainer, { aspectRatio }]}
        activeOpacity={1}
        onPress={handlePlayPause}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          resizeMode={ResizeMode?.CONTAIN || 'contain'}
          isLooping={false}
          shouldPlay={false}
          useNativeControls={false}
          onLoad={handleLoad}
          onPlaybackStatusUpdate={(status: any) => {
            if (status.isLoaded) {
              setIsPlaying(status.isPlaying && !status.didJustFinish);
            }
          }}
        />
        {showControls && !isPlaying && (
          <View style={styles.playButtonOverlay}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={32} color={SystemColors.background} />
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: SystemColors.separator,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SystemColors.separator,
  },
  videoContainer: {
    width: '100%',
    maxHeight: 600,
    position: 'relative',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: SystemColors.secondaryLabel,
    fontSize: 14,
    marginTop: 8,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4, // Slight offset for play icon
  },
});

export default VideoEmbed;
