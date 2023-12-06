'use client';
import 'client-only';
import React, { ComponentProps } from 'react';
import { Text, XStack, YStack, Stack } from 'tamagui';
import { Notification } from 'web/app/api/notifications/notification';

import { Image } from '../block/image';
import { Windowing } from '../block/windowing';

const SENDER_IMAGE_SIZE = 40;
export function FixedRow({
  item,
  isLastItem,
  isWeb,
  ...rest
}: { item: Notification } & {
  isLastItem: boolean;
  isWeb?: boolean;
} & ComponentProps<typeof XStack>) {
  return (
    <XStack
      paddingVertical="$4"
      paddingHorizontal="$4"
      borderBottomColor="$gray5"
      borderBottomWidth={isLastItem ? '$0' : '$1'}
      space="$2.5"
      {...(isWeb && {
        left: 0,
        position: 'absolute',
        top: 0,
        width: '100%',
      })}
      {...rest}
    >
      <Stack
        borderRadius="$20"
        overflow="hidden"
        flexShrink={0}
        alignSelf="center"
      >
        <Image
          web={{
            alt: 'Random people faker image',
            height: SENDER_IMAGE_SIZE,
            src: item.img,
            unoptimized: true,
            width: SENDER_IMAGE_SIZE,
          }}
          native={{
            source: {
              height: SENDER_IMAGE_SIZE,
              uri: item.img,
              width: SENDER_IMAGE_SIZE,
            },
          }}
        />
      </Stack>
      <YStack space="$2" flex={1}>
        <Text
          fontFamily="$body"
          fontSize="$4"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.title}
        </Text>
        <Text fontFamily="$body" fontSize="$1" color="$gray10">
          {item.date?.toLocaleString()}
        </Text>
      </YStack>
    </XStack>
  );
}

export const ESTIMATED_ITEM_SIZE = 90;

interface NotificationListTemplateProps {
  data: Notification[];
}

export function NotificationListTemplate({
  data = [],
}: NotificationListTemplateProps) {
  const count = data.length;

  return (
    <Windowing
      data={data}
      native={{
        estimatedItemSize: ESTIMATED_ITEM_SIZE,
        renderItem: ({ item, index }) => (
          <FixedRow item={item} isLastItem={count - 1 === index} />
        ),
      }}
      web={{
        count,
        estimateSize: () => ESTIMATED_ITEM_SIZE,
        renderItem: ({ item, size, start, isLastItem, index }) => (
          <FixedRow
            item={item}
            isLastItem={isLastItem}
            style={{
              height: `${size}px`,
            }}
            y={start}
            isWeb={true}
          >
            {index}
          </FixedRow>
        ),
      }}
    />
  );
}
