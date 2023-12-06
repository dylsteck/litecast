'use client';

import 'client-only';
import { AppHeader, AppHeaderProps, HeaderBackButton } from 'ui';

const HeaderLeft: AppHeaderProps['headerRight'] = () => (
  <HeaderBackButton fallbackUrl="/" />
);

export default function ClientBoundary() {
  return <AppHeader headerLeft={HeaderLeft} />;
}
