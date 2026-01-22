import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { SystemColors } from '../constants/Colors';

export default function LiquidGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // Filter to only show the main tabs
  const visibleRoutes = state.routes.filter(route => 
    ['index', 'explore', 'notifications', 'user'].includes(route.name)
  );

  // Hide tab bar on casts page
  const currentRoute = state.routes[state.index].name;
  if (currentRoute === 'casts' || currentRoute === 'channel') {
    return null;
  }

  const getLabel = (routeName: string) => {
    if (routeName === 'index') return 'Home';
    if (routeName === 'explore') return 'Explore';
    if (routeName === 'notifications') return 'Inbox';
    if (routeName === 'user') return 'Profile';
    return '';
  };

  return (
    <View style={styles.wrapper}>
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

            // Icon mapping with filled/outline variants
            let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'home';
            switch (route.name) {
              case 'index':
                iconName = isFocused ? 'home' : 'home-outline';
                break;
              case 'explore':
                iconName = isFocused ? 'search' : 'search-outline';
                break;
              case 'notifications':
                iconName = isFocused ? 'notifications' : 'notifications-outline';
                break;
              case 'user':
                iconName = isFocused ? 'person' : 'person-outline';
                break;
              default:
                iconName = isFocused ? 'home' : 'home-outline';
            }

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                style={styles.tabItem}
              >
                <Ionicons
                  name={iconName}
                  size={24}
                  color={isFocused ? SystemColors.label : SystemColors.secondaryLabel}
                  style={styles.icon}
                />
              </TouchableOpacity>
            );
          })}
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 100,
    ...Platform.select({
      web: {
        alignItems: 'center',
      },
      default: {
        alignItems: 'flex-start',
        paddingLeft: 20,
      },
    }),
  },
  container: {},
  tabBar: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabBarInner: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  icon: {
    width: 28,
    textAlign: 'center',
  },
});

