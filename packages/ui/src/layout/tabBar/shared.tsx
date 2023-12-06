import type { IconProps } from '@tamagui/helpers-icon';
import { Home, Search, Bell, User, PlusSquare } from '@tamagui/lucide-icons';
import { Tabs } from 'expo-router';
import React, { NamedExoticComponent } from 'react';
import { useTheme } from 'tamagui';

import { ACTIVE_TINT_COLOR } from '../../config/constant';

type TabBarIconReturn = Required<
  Pick<
    NonNullable<Parameters<typeof Tabs.Screen>[0]['options']>,
    'tabBarIcon' | 'title'
  >
> & {
  href?: string;
  activation?: (segment: string) => boolean;
};
export type TabBarIcon = () => TabBarIconReturn;

function getTabBarIcon(SVG: NamedExoticComponent<IconProps>) {
  return function TabBarIcon({
    size,
    focused,
  }: Omit<Parameters<TabBarIconReturn['tabBarIcon']>[0], 'color'>) {
    const theme = useTheme();

    return (
      <SVG
        width={size}
        height={size}
        color={focused ? ACTIVE_TINT_COLOR : theme.gray11.val}
      />
    );
  };
}

export const getSharedHomeTabIconOptions: TabBarIcon = () => {
  return {
    tabBarIcon: getTabBarIcon(Home),
    title: 'Home',
  };
};

export const getSharedCrewTabBarIconOptions: TabBarIcon = () => {
  return {
    tabBarIcon: getTabBarIcon(Search),
    title: 'Crew',
  };
};

export const getSharedCastTabBarIconOptions: TabBarIcon = () => {
  return {
    tabBarIcon: getTabBarIcon(PlusSquare),
    title: 'Cast',
  };
};

export const getSharedChatTabBarIconOptions: TabBarIcon = () => {
  return {
    tabBarIcon: getTabBarIcon(Bell),
    title: 'Chat',
  };
};

export const getSharedMyPageTabBarIconOptions: TabBarIcon = () => {
  return {
    tabBarIcon: getTabBarIcon(User),
    title: 'MyPage',
  };
};
