import { GetApiPostPostId200 } from 'api';
import React from 'react';
import { Heading, YStack, Text, XStack } from 'tamagui';

export interface PostIdTemplateProps {
  data: GetApiPostPostId200;
  native?: {
    sharedTransitionTag: string;
  };
  web?: unknown;
}

export function PostDetail({
  title,
  description,
  meta: { location, createdAt },
}: Omit<PostIdTemplateProps['data'], 'id' | 'img'>) {
  return (
    <YStack paddingHorizontal="$3" paddingVertical="$4">
      <YStack>
        <Heading
          numberOfLines={2}
          ellipsizeMode="tail"
          fontFamily="$body"
          fontSize="$5"
          lineHeight="$3"
        >
          {title}
        </Heading>
        <XStack space="$1.5" marginTop="$2">
          <Text fontSize="$3" color="$gray11" fontFamily="$body">
            {location}
          </Text>
          <Text fontSize="$3" color="$gray11" fontFamily="$body">
            {createdAt.toLocaleString()}
          </Text>
        </XStack>
      </YStack>
      <Text marginTop="$3" fontFamily="$body" fontSize="$4" lineHeight="$2">
        {description}
      </Text>
    </YStack>
  );
}
