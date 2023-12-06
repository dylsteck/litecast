'use client';

import 'client-only';
import { map } from 'lodash';
import React, { ComponentProps } from 'react';
import { Stack, Text } from 'tamagui';
import { AppHeader, AppHeaderProps, Carousel, ChatIndexTemplate } from 'ui';

const CAROUSEL_OPTION: ComponentProps<typeof Carousel>['web'] = {
  carouselProps: [{ loop: true }],
  containerStyle: {
    maxHeight: '160px',
  },
};

const Title: AppHeaderProps['title'] = styles => <Text {...styles}>Chat</Text>;
export default function Page() {
  return (
    <ChatIndexTemplate>
      <AppHeader title={Title} />
      <Carousel web={CAROUSEL_OPTION}>
        {map([1, 2, 3], (item, index) => (
          <Stack
            key={index}
            display="flex"
            minWidth="0"
            flexGrow={1}
            flexShrink={0}
            flexBasis="100%"
            alignItems="center"
            backgroundColor="#98cae5"
            justifyContent="center"
          >
            <Text color="#fff" fontSize="$10" fontWeight="200">
              Slide {++index}
            </Text>
          </Stack>
        ))}
      </Carousel>
    </ChatIndexTemplate>
  );
}
