import React from 'react';
import { H1, Text, YStack } from 'tamagui';

export function Wip() {
  return (
    <YStack justifyContent="center" alignItems="center" flex={1} space={true}>
      <H1 fontFamily="$body">WIP</H1>
      <Text fontFamily="$body">Bandi is a work in progress</Text>
    </YStack>
  );
}
