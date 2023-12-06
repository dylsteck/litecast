'use client';

import 'client-only';
import { Bell } from '@tamagui/lucide-icons';
import { Link } from 'solito/link';
import { Text } from 'tamagui';
import { AppHeader, AppHeaderProps, HEADER_ICON_SIZE } from 'ui';

const Title: AppHeaderProps['title'] = styles => <Text {...styles}>Home</Text>;
const HeaderRight: AppHeaderProps['headerRight'] = () => (
  <Link href="/notification">
    <Bell width={HEADER_ICON_SIZE} height={HEADER_ICON_SIZE} />
  </Link>
);

export default function ClientBoundary() {
  return <AppHeader title={Title} headerRight={HeaderRight} />;
}
