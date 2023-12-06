'use client';

import 'client-only';
import { ChevronLeft } from '@tamagui/lucide-icons';
import { isFunction } from 'lodash';
import { Route } from 'next';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Button, Stack, Text, XStack } from 'tamagui';

import { ACTIVE_TINT_COLOR, HEADER_ICON_SIZE } from '../../config/constant';

import { AppHeaderProps, HeaderBackButtonProps } from './shared';

const styles = {
  floatingCenterTitle: {
    left: 0,
    position: 'absolute',
    right: 0,
    textAlign: 'center',
  },
  pressColor: '#00ae77',
  pressOpacity: 0.8,
  tintColor: ACTIVE_TINT_COLOR,
} as const;

export function AppHeader({ title, headerRight, headerLeft }: AppHeaderProps) {
  const hasLeftItem = isFunction(headerLeft);
  const titleStyle = {
    fontFamily: '$body',
    pointerEvents: 'box-none',
    ...(hasLeftItem && styles.floatingCenterTitle),
  } as const;

  return (
    <XStack
      testID="appHeader"
      // @ts-expect-error Tamagui-unsupported-web-only-type
      position="sticky"
      top={0}
      left={0}
      zIndex={1}
      right={0}
      backgroundColor="$gray1"
      height="$4.5"
      alignItems="center"
      paddingHorizontal="$2.5"
      columnGap="$3"
      borderBottomColor="$gray4"
      borderBottomWidth="$1"
    >
      {headerLeft?.({
        pressColor: styles.pressColor,
        pressOpacity: styles.pressOpacity,
        tintColor: styles.tintColor,
      })}
      {isFunction(title) ? (
        title(titleStyle)
      ) : (
        <Text {...titleStyle}>{title}</Text>
      )}
      <Stack marginLeft="auto">
        {headerRight?.({
          pressColor: styles.pressColor,
          pressOpacity: styles.pressOpacity,
          tintColor: styles.tintColor,
        })}
      </Stack>
    </XStack>
  );
}

export function HeaderBackButton({ fallbackUrl }: HeaderBackButtonProps) {
  const { back, push } = useRouter();

  return (
    <Button
      unstyled
      onPress={() => {
        const canGoBack =
          // @ts-expect-error navigation type definition is nowhere to be found yet
          window.navigation?.canGoBack ?? window.history.length > 2;

        if (canGoBack) {
          back();
        } else {
          push(fallbackUrl as Route);
        }
      }}
    >
      <ChevronLeft width={HEADER_ICON_SIZE} height={HEADER_ICON_SIZE} />
    </Button>
  );
}
