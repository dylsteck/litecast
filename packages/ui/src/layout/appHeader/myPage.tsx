import { Settings } from '@tamagui/lucide-icons';
import React from 'react';
import { Link } from 'solito/link';

import { HEADER_ICON_SIZE } from '../../config/constant';

export function MyPageHeaderRight() {
  return (
    <Link href="/setting">
      <Settings
        width={HEADER_ICON_SIZE}
        height={HEADER_ICON_SIZE}
        color="#000"
      />
    </Link>
  );
}
