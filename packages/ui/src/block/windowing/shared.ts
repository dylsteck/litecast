import { FlashList } from '@shopify/flash-list';
import type { VirtualItem } from '@tanstack/react-virtual';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { ComponentProps, ReactNode } from 'react';

export type WindowingProps<T = unknown> = Pick<
  ComponentProps<typeof FlashList<T>>,
  'data'
> & {
  native: Omit<ComponentProps<typeof FlashList<T>>, 'data'>;
  web: Parameters<typeof useWindowVirtualizer>[0] & {
    renderItem: (
      props: VirtualItem & {
        item: T;
        isLastItem: boolean;
      },
    ) => ReactNode;
  };
};
