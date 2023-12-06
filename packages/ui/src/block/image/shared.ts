import { default as NextImage } from 'next/image';
import { ComponentProps } from 'react';
import { Image as TamaguiImage } from 'tamagui';

export interface ImageProps {
  native?: ComponentProps<typeof TamaguiImage>;
  web?: ComponentProps<typeof NextImage>;
}
