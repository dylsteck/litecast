import React, { ComponentProps, ReactNode } from 'react';
import { Text } from 'tamagui';

export interface AppHeaderProps {
  title?: string | { (props: ComponentProps<typeof Text>): ReactNode };
  headerLeft?: (props: {
    tintColor?: string;
    pressColor?: string;
    pressOpacity?: number;
  }) => React.ReactNode;
  headerRight?: (props: {
    tintColor?: string;
    pressColor?: string;
    pressOpacity?: number;
  }) => React.ReactNode;
}

export interface HeaderBackButtonProps {
  fallbackUrl: string;
}
