import {
  getSharedHomeTabIconOptions,
  getSharedCrewTabBarIconOptions,
  getSharedChatTabBarIconOptions,
  getSharedMyPageTabBarIconOptions,
} from './shared';
import type { TabBarIcon } from './shared';

export const getHomeTabIconOptions: TabBarIcon = () => ({
  ...getSharedHomeTabIconOptions(),
  activation: segment => segment === '',
  href: '/',
});
export const getCrewTabBarIconOptions: TabBarIcon = () => ({
  ...getSharedCrewTabBarIconOptions(),
  activation: segment => segment === 'crew',
  href: '/crew',
});
export const getChatTabBarIconOptions: TabBarIcon = () => ({
  ...getSharedChatTabBarIconOptions(),
  activation: segment => segment === 'chat',
  href: '/chat',
});
export const getMyPageTabBarIconOptions: TabBarIcon = () => ({
  ...getSharedMyPageTabBarIconOptions(),
  activation: segment => segment === 'myPage',
  href: '/myPage',
});
