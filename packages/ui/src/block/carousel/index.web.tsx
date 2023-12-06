'use client';

import 'client-only';
import useEmblaCarousel from 'embla-carousel-react';
import { map } from 'lodash';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button, Stack, XStack } from 'tamagui';

import { CarouselProps } from './shared';

export function Carousel({ children, web }: CarouselProps) {
  if (!web?.carouselProps) {
    throw Error(
      'You must pass web.carouselProps prop into Carousel component!',
    );
  }
  const {
    carouselProps: [options, plugins],
    containerStyle,
  } = web;
  const [emblaRef, emblaApi] = useEmblaCarousel(options, plugins);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) {
        emblaApi.scrollTo(index);
      }
    },
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }

    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (emblaApi) {
      setScrollSnaps(emblaApi.scrollSnapList());
      emblaApi.on('select', onSelect);
    }

    return () => {
      if (emblaApi) {
        emblaApi.off('select', onSelect);
      }
    };
  }, [emblaApi, onSelect]);

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        ...containerStyle,
      }}
      ref={emblaRef}
    >
      <Stack flex={1} flexDirection="row">
        {children}
      </Stack>
      <XStack
        position="absolute"
        bottom="$6"
        left="50%"
        x="-50%"
        columnGap="$2"
      >
        {map(scrollSnaps, (_, index) => (
          <DotButton
            key={index}
            selected={index === selectedIndex}
            onClick={() => scrollTo(index)}
          />
        ))}
      </XStack>
    </div>
  );
}

type DotButtonPropType = {
  selected: boolean;
  onClick: () => void;
};
export const DotButton: FC<DotButtonPropType> = ({ onClick, selected }) => {
  return (
    <Button
      unstyled={true}
      backgroundColor={selected ? '#007aff' : 'rgba(0,0,0,.2)'}
      onPress={onClick}
      width="$0.75"
      height="$0.75"
      radiused={true}
    />
  );
};
