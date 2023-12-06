'use client';

import 'client-only';
import { Settings } from '@tamagui/lucide-icons';
import { ReactNode } from 'react';
import { Link } from 'solito/link';
import { Text } from 'tamagui';
import {
  AppHeader,
  AppHeaderProps,
  HEADER_ICON_SIZE,
  MyPageTopTabHeaderTemplate,
  TopTab,
} from 'ui';

interface LayoutProps {
  children: ReactNode;
}

const Title: AppHeaderProps['title'] = styles => (
  <Text {...styles}>MyPage</Text>
);
const HeaderLeft: AppHeaderProps['headerRight'] = () => (
  <Link href="/myPage/setting">
    <Settings width={HEADER_ICON_SIZE} height={HEADER_ICON_SIZE} />
  </Link>
);

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <AppHeader title={Title} headerRight={HeaderLeft} />
      <MyPageTopTabHeaderTemplate />
      <TopTab
        links={[
          { href: '/myPage', title: 'My Post' },
          { href: '/myPage/likes', title: 'Likes' },
        ]}
      />
      {children}
    </>
  );
}
