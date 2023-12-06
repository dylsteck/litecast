import { default as NextImage } from 'next/image';
import React, { forwardRef } from 'react';

import { ImageProps } from './shared';

export const Image = forwardRef<HTMLImageElement | null, ImageProps>(
  function Image({ web }, ref) {
    if (!web) {
      throw Error('You must pass web prop into Image component!');
    }

    return <NextImage ref={ref} {...web} />;
  },
);
