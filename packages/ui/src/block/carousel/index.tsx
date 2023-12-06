'use client';

import 'client-only';
import React from 'react';
// eslint-disable-next-line import/default
import Swiper from 'react-native-swiper';

import { CarouselProps } from './shared';

export function Carousel({ children, native }: CarouselProps) {
  return <Swiper {...native}>{children}</Swiper>;
}
