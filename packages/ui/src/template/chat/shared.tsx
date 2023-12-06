import { GetApiHello200 } from 'api';
import React, { ReactNode } from 'react';
import { Text, YStack } from 'tamagui';

type SharedChatTemplateProps = {
  children?: ReactNode;
} & Partial<GetApiHello200>;

export type SharedChatIndexTemplateProps = {
  children?: ReactNode;
};

export function SharedChatTemplate({
  message,
  createdAt,
  children,
}: SharedChatTemplateProps) {
  return (
    <>
      {children}
      <YStack
        marginHorizontal="$3"
        marginVertical="$4"
        paddingHorizontal="$4"
        paddingVertical="$5"
        borderColor="$gray6"
        borderRadius="$4"
        borderWidth="$0.5"
        backgroundColor="$gray1"
      >
        <Text
          fontSize="$6"
          fontFamily="$body"
          textAlign="center"
          marginBottom="$3"
        >
          🌱 Fresh data 🌱
        </Text>
        <Text fontSize="$6" fontFamily="$body">
          Response time:{' '}
          <Text fontSize="$6" fontFamily="$body" color="$gray11">
            {new Date(createdAt ?? '').toLocaleTimeString()}
          </Text>
        </Text>
        <Text fontSize="$6" fontFamily="$body">
          Message:{' '}
          <Text fontSize="$6" fontFamily="$body" color="$gray11">
            {message}
          </Text>
        </Text>
      </YStack>
    </>
  );
}
