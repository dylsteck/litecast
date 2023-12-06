import { Stack } from 'expo-router';
import { YStack, Text } from 'tamagui';

export default function NotFoundScreen() {
  return (
    <YStack justifyContent="center" alignItems="center" flex={1} space={true}>
      <Stack.Screen options={{ title: '404' }} />
      <Text>Not Found</Text>
    </YStack>
  );
}
