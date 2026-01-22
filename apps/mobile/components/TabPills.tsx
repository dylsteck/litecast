import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated, ScrollView } from 'react-native';
import { SystemColors } from '../constants/Colors';

interface TabPillsProps<T extends string> {
  tabs: { id: T; label: string }[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  variant?: 'animated' | 'static';
  align?: 'left' | 'right';
}

// Approximate width of each tab for position swapping
const TAB_WIDTH = 70;
const TAB_GAP = 14;

// Static tabs component (no animation, left-aligned by default)
function StaticTabs<T extends string>({ 
  tabs, 
  activeTab, 
  onTabChange,
  align = 'left'
}: TabPillsProps<T>) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.staticContent,
          align === 'right' && styles.staticContentRight
        ]}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.6}
              style={[styles.staticTabTouchable, index > 0 && styles.staticTabMargin]}
            >
              <View style={styles.tab}>
                <Text style={[
                  styles.text, 
                  isActive && styles.activeText,
                  !isActive && styles.inactiveText
                ]}>
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// Animated tabs component (for home feed)
function AnimatedTabs<T extends string>({ 
  tabs, 
  activeTab, 
  onTabChange 
}: TabPillsProps<T>) {
  const activeIndex = tabs.findIndex(t => t.id === activeTab);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  
  // Animated values for each tab position
  const tab0TranslateX = useRef(new Animated.Value(0)).current;
  const tab1TranslateX = useRef(new Animated.Value(0)).current;
  const tab0Opacity = useRef(new Animated.Value(activeIndex === 0 ? 1 : 0.4)).current;
  const tab1Opacity = useRef(new Animated.Value(activeIndex === 1 ? 1 : 0.4)).current;

  useEffect(() => {
    // Skip animation on initial mount
    if (prevIndex === null) {
      setPrevIndex(activeIndex);
      return;
    }

    const swapDistance = TAB_WIDTH + TAB_GAP;
    
    const goingRight = activeIndex > prevIndex;
    const goingLeft = activeIndex < prevIndex;
    
    if (goingRight) {
      // Trending (tab1) moves left to take For You's position
      // For You (tab0) stays in place but fades
      Animated.parallel([
        Animated.spring(tab1TranslateX, {
          toValue: -swapDistance,
          friction: 7,
          tension: 180,
          useNativeDriver: true,
        }),
        Animated.spring(tab0TranslateX, {
          toValue: 0, // Keep tab0 in place
          friction: 7,
          tension: 180,
          useNativeDriver: true,
        }),
        Animated.timing(tab0Opacity, {
          toValue: 0.4,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(tab1Opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (goingLeft) {
      // Reset to original positions
      Animated.parallel([
        Animated.spring(tab0TranslateX, {
          toValue: 0,
          friction: 7,
          tension: 180,
          useNativeDriver: true,
        }),
        Animated.spring(tab1TranslateX, {
          toValue: 0,
          friction: 7,
          tension: 180,
          useNativeDriver: true,
        }),
        Animated.timing(tab0Opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(tab1Opacity, {
          toValue: 0.4,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    setPrevIndex(activeIndex);
  }, [activeIndex, prevIndex, tab0TranslateX, tab1TranslateX, tab0Opacity, tab1Opacity]);

  const translateXValues = [tab0TranslateX, tab1TranslateX];
  const opacityValues = [tab0Opacity, tab1Opacity];

  return (
    <View style={styles.wrapper}>
      <View style={styles.animatedContent}>
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.6}
              style={[styles.tabTouchable, index === 0 && styles.firstTab]}
            >
              <Animated.View 
                style={[
                  styles.tab,
                  { 
                    opacity: opacityValues[index],
                    transform: [{ translateX: translateXValues[index] }]
                  }
                ]}
              >
                <Text style={[styles.text, isActive && styles.activeText]}>
                  {tab.label}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function TabPills<T extends string>({ 
  tabs, 
  activeTab, 
  onTabChange,
  variant = 'static',
  align = 'left'
}: TabPillsProps<T>) {
  if (variant === 'animated' && tabs.length === 2) {
    return <AnimatedTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />;
  }
  return <StaticTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} align={align} />;
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: SystemColors.background,
  },
  // Static tabs styles
  staticContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  staticContentRight: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingRight: 20,
  },
  staticTabTouchable: {},
  staticTabMargin: {
    marginLeft: 20,
  },
  // Animated tabs styles
  animatedContent: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingLeft: 16,
    paddingRight: 20,
    paddingVertical: 12,
  },
  firstTab: {
    marginRight: TAB_GAP,
  },
  tabTouchable: {},
  tab: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  text: {
    fontFamily: Platform.select({ 
      ios: 'System', 
      android: 'sans-serif', 
      default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui' 
    }),
    fontSize: 16,
    fontWeight: '400',
    color: SystemColors.label,
    letterSpacing: -0.3,
  },
  activeText: {
    fontWeight: '600',
  },
  inactiveText: {
    opacity: 0.4,
  },
});

