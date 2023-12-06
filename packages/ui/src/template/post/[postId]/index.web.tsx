'use client';

import 'client-only';
import { replace } from 'lodash';
import React from 'react';
import { Stack } from 'tamagui';

import { Image } from '../../../block/image';

import { PostIdTemplateProps, PostDetail } from './shared';

export function PostIdTemplate({
  data: { img, meta, title, description },
}: PostIdTemplateProps) {
  return (
    <>
      <Stack position="relative" width="100%" aspectRatio={16 / 9}>
        <Image
          web={{
            alt: 'Random animal faker image',
            fill: true,
            priority: true,
            src: replace(img, '160/160', '600/600'),
            unoptimized: true,
          }}
        />
      </Stack>
      <PostDetail title={title} description={description} meta={meta} />
    </>
  );
}
