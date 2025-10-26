import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesome } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export default function LiquidGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // Filter to only show the main tabs
  const visibleRoutes = state.routes.filter(route => 
    ['index', 'explore', 'notifications', 'user'].includes(route.name)
  );

  return (
    <View style={styles.container}>
      <BlurView intensity={100} tint="systemMaterial" style={styles.tabBar}>
        <View style={styles.tabBarInner}>
          {visibleRoutes.map((route) => {
            const routeIndex = state.routes.findIndex(r => r.key === route.key);
            const isFocused = state.index === routeIndex;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            // Icon mapping
            let iconName: React.ComponentProps<typeof FontAwesome>['name'] = 'home';
            if (route.name === 'index') iconName = 'home';
            else if (route.name === 'explore') iconName = 'compass';
            else if (route.name === 'notifications') iconName = 'bell';
            else if (route.name === 'user') iconName = 'user';

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                style={styles.tabItem}
              >
                {isFocused && (
                  <BlurView
                    intensity={50}
                    tint="light"
                    style={styles.activeIndicator}
                  />
                )}
                <FontAwesome
                  name={iconName}
                  size={24}
                  color={isFocused ? '#8B5CF6' : '#666'}
                  style={styles.icon}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    zIndex: 100,
    alignItems: 'center',
  },
  tabBar: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabBarInner: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 32,
    justifyContent: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  icon: {
    width: 28,
    textAlign: 'center',
    zIndex: 1,
  },
});

