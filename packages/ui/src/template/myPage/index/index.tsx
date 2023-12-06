import { times, map } from 'lodash';
import React from 'react';
import { Text, XStack, YStack } from 'tamagui';

export function MyPageTemplate() {
  return (
    <YStack space={4}>
      {map(times(20), (_, index) => (
        <XStack backgroundColor="$gray1" padding="$5" key={index}>
          <Text fontFamily="$body" fontSize="$3">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Commodi,
            enim?
          </Text>
        </XStack>
      ))}
    </YStack>
  );
}
