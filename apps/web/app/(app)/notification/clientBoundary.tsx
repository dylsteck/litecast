'use client';

import 'client-only';
import { Text } from 'tamagui';
import { HeaderBackButton, AppHeader, AppHeaderProps } from 'ui';

const Title: AppHeaderProps['title'] = styles => (
  <Text {...styles}>Notification</Text>
);
const HeaderLeft: AppHeaderProps['headerRight'] = () => (
  <HeaderBackButton fallbackUrl="/"></HeaderBackButton>
);

export default function ClientBoundary() {
  return <AppHeader title={Title} headerLeft={HeaderLeft} />;
}
