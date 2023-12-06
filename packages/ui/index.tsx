'use client';
// eslint-disable-next-line @typescript-eslint/no-unused-vars,import/no-namespace
import * as React from 'react';

export * from './src/tamagui.config';
export * from './src/config/constant';

// server component exports

// client component exports
export * from './src/button';

// block
export * from './src/block/carousel/index';
export * from './src/block/carousel/shared';
export * from './src/block/image/index';
export * from './src/block/image/shared';
export * from './src/block/windowing/index';
export * from './src/block/windowing/shared';
export * from './src/block/appHeader/index';
export * from './src/block/appHeader/shared';
export * from './src/block/bottomNavigation.web';
export * from './src/block/externalLink';

// HOC
export * from './src/HOC/withRecoilSync';

// hook
export * from './src/hook/useAppState';
export * from './src/hook/useOnlineManager';
export * from './src/hook/useRefetchOnFocus';

// layout
export * from './src/layout/appHeader/home';
export * from './src/layout/appHeader/myPage';
export * from './src/layout/tabBar/icons';
export * from './src/layout/tabBar/shared';
export * from './src/layout/toptab/index.web';

// store
export * from './src/store/mmkv';
export * from './src/store/userInfoState';

// template
export * from './src/template/chat/index';
export * from './src/template/chat/shared';
export * from './src/template/home/index';
export * from './src/template/myPage/index/index';
export * from './src/template/myPage/index/topTabHeader';
export * from './src/template/myPage/setting';
export * from './src/template/post/[postId]/index';
export * from './src/template/post/[postId]/shared';
export * from './src/template/notificationList';
export * from './src/template/wip';
