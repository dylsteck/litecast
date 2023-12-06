import React, { forwardRef } from 'react';
import { View } from 'react-native';
import { Image as TamaguiImage } from 'tamagui';

import { ImageProps } from './shared';

export const Image = forwardRef<View, ImageProps>(function Image(
  { native },
  ref,
) {
  if (!native) {
    throw Error('You must pass native prop into Image component!');
  }

  return (
    <View ref={ref}>
      <TamaguiImage {...native} />
    </View>
  );
});
