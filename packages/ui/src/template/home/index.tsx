'use client';

import 'client-only';
import { Heart } from '@tamagui/lucide-icons';
import { GetApiPostResult, GetApiPost200Item } from 'api';
import React, { ComponentProps } from 'react';
import { Platform, Image as ReactNativeImage } from 'react-native';
import Animated from 'react-native-reanimated';
import { Link } from 'solito/link';
import { getVariable, Text, XStack, YStack, useTheme } from 'tamagui';

import { Image } from '../../block/image';
import { Windowing } from '../../block/windowing';

const AnimatedImage = Animated.createAnimatedComponent(ReactNativeImage);

export const POST_IMAGE_SIZE = 80;
function FixedRow({
  item,
  isLastItem,
  isWeb,
  transitionTag,
  ...rest
}: {
  item: GetApiPost200Item;
} & {
  isLastItem: boolean;
  isWeb?: boolean;
  transitionTag?: string;
} & ComponentProps<typeof XStack>) {
  const theme = useTheme();

  return (
    <XStack
      paddingVertical="$4"
      paddingHorizontal="$4"
      borderBottomColor="$gray5"
      borderBottomWidth={isLastItem ? '$0' : '$1'}
      space="$4"
      flex={1}
      {...rest}
      {...(isWeb && {
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        width: '100%',
      })}
    >
      <Link
        viewProps={{
          style: {
            display: 'flex',
            flexDirection: 'row',
            gap: 15,
            overflow: 'hidden',
            width: '100%',
          },
        }}
        href={
          Platform.select({
            native: `/home/post/${item.id}?sharedTransitionTag=${transitionTag}`,
            web: `/post/${item.id}`,
          }) ?? ''
        }
      >
        {Platform.select({
          native: (
            <AnimatedImage
              sharedTransitionTag={transitionTag}
              source={{ uri: item.img }}
              borderRadius={10}
              style={{
                height: POST_IMAGE_SIZE,
                width: POST_IMAGE_SIZE,
              }}
            />
          ),
          web: (
            <Image
              web={{
                alt: 'Random animal faker image',
                height: POST_IMAGE_SIZE,
                src: item.img,
                style: {
                  borderRadius: '10px',
                  flexShrink: 0,
                  overflow: 'hidden',
                },
                unoptimized: true,
                width: POST_IMAGE_SIZE,
              }}
            />
          ),
        })}
        <YStack space="$2" flex={1}>
          <Text
            fontFamily="$body"
            fontSize="$4"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item?.title}
          </Text>
          <Text
            fontFamily="$body"
            fontSize="$3"
            numberOfLines={1}
            ellipsizeMode="tail"
            color="$gray11"
          >
            {item?.description}
          </Text>
          <XStack space="$2" alignItems="center" marginTop="$1">
            <Text fontFamily="$body" fontSize="$1" color="$gray10">
              {item?.meta.location}
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$gray10">
              {item?.meta.createdAt?.toLocaleString()}
            </Text>
            <XStack space="$2" alignItems="center" marginLeft="auto">
              <Heart width={14} height={14} color={getVariable(theme.gray9)} />
              <Text fontFamily="$body" fontSize="$1" color="$gray10">
                1
              </Text>
            </XStack>
          </XStack>
        </YStack>
      </Link>
    </XStack>
  );
}

const ESTIMATED_ITEM_SIZE = 120;
interface HomeTemplateProps {
  data: GetApiPostResult;
}
export function HomeTemplate({ data }: HomeTemplateProps) {
  const count = data.length;

  return (
    <Windowing
      data={data}
      native={{
        estimatedItemSize: ESTIMATED_ITEM_SIZE,
        renderItem: ({ item, index }) => (
          <FixedRow
            item={item}
            isLastItem={count - 1 === index}
            transitionTag={'postThumbnail' + index}
          />
        ),
        testID: 'homeTabScreen',
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
          />
        ),
      }}
    />
  );
}
