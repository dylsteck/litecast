import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { XStack, Text, Switch, YStack, useTheme } from 'tamagui';

const DATA = [
  {
    description: 'we will send you informative notification',
    title: 'Push notification',
  },
];

export function SettingTemplate() {
  const theme = useTheme();

  return (
    <FlashList
      contentContainerStyle={{
        backgroundColor: theme.gray1.val,
      }}
      data={DATA}
      renderItem={({ item }) => (
        <XStack
          paddingVertical="$4"
          paddingHorizontal="$4"
          borderBottomColor="$gray5"
          borderBottomWidth="$1"
          space="$2.5"
        >
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
              {item.description}
            </Text>
          </YStack>
          <Switch size="$2">
            <Switch.Thumb animation="bouncy" />
          </Switch>
        </XStack>
      )}
      estimatedItemSize={100}
    />
  );
}
