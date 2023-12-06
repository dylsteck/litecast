import { Bell } from '@tamagui/lucide-icons';
import React from 'react';
import { Link } from 'solito/link';

import { HEADER_ICON_SIZE } from '../../config/constant';

export function HomeHeaderRight() {
  return (
    <Link href="/modal">
      <Bell width={HEADER_ICON_SIZE} height={HEADER_ICON_SIZE} />
    </Link>
  );
}
