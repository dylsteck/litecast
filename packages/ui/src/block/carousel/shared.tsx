import useEmblaCarousel from 'embla-carousel-react';
import { ComponentProps, HTMLAttributes, ReactNode } from 'react';
// eslint-disable-next-line import/default
import Swiper from 'react-native-swiper';

export interface CarouselProps {
  children: ReactNode;
  native?: ComponentProps<typeof Swiper>;
  web?: {
    carouselProps?: Parameters<typeof useEmblaCarousel>;
    containerStyle?: HTMLAttributes<HTMLDivElement>['style'];
  };
}
