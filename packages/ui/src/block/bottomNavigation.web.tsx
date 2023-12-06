'use client';

import 'client-only';
import { map } from 'lodash';
import { useSelectedLayoutSegments } from 'next/navigation';
import React from 'react';
import { Link } from 'solito/link';
import { Text, XStack, YStack } from 'tamagui';

import { ACTIVE_TINT_COLOR } from '../config/constant';
import {
  getHomeTabIconOptions,
  getCrewTabBarIconOptions,
  getChatTabBarIconOptions,
  getMyPageTabBarIconOptions,
} from '../layout/tabBar/icons';

const TAB_LIST = [
  getHomeTabIconOptions(),
  getCrewTabBarIconOptions(),
  getChatTabBarIconOptions(),
  getMyPageTabBarIconOptions(),
];

export function BottomNavigation() {
  const [firstSegment] = useSelectedLayoutSegments();

  return (
    <XStack
      // @ts-expect-error Tamagui-unsupported-web-only-type
      position="fixed"
      paddingLeft="$3"
      paddingRight="$3"
      justifyContent="space-between"
      alignItems="center"
      bottom={0}
      left={0}
      right={0}
      borderTopColor="$gray5"
      backgroundColor="$gray1"
      borderTopWidth={1}
      height="$5"
    >
      {map(TAB_LIST, ({ tabBarIcon, title, href, activation }) => {
        const isActiveLink = activation?.(firstSegment ?? '');

        return (
          <Link href={href ?? ''} key={title}>
            <YStack alignItems="center" rowGap="$1.5" paddingHorizontal="$2.5">
              {tabBarIcon({
                color: 'transparent',
                focused: isActiveLink ?? false,
                size: 20,
              })}
              <Text
                textDecorationLine="none"
                fontFamily="$body"
                fontSize={10}
                color={isActiveLink ? ACTIVE_TINT_COLOR : '$gray11'}
              >
                {title}
              </Text>
            </YStack>
          </Link>
        );
      })}
    </XStack>
  );
}
