import { replace } from 'lodash';
import React from 'react';
import { Image } from 'react-native';
import Animated from 'react-native-reanimated';
import { useWindowDimensions } from 'tamagui';

import { PostIdTemplateProps, PostDetail } from './shared';

const AnimatedImage = Animated.createAnimatedComponent(Image);

export function PostIdTemplate({
  data: { img, title, description, meta },
  native,
}: PostIdTemplateProps) {
  const { width } = useWindowDimensions();

  return (
    <>
      <AnimatedImage
        sharedTransitionTag={native?.sharedTransitionTag}
        source={{
          uri: replace(img, '160/160', '600/600'),
        }}
        style={{
          aspectRatio: 16 / 9,
          width,
        }}
      />
      <PostDetail title={title} description={description} meta={meta} />
    </>
  );
}
