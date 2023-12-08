import { Stack } from 'expo-router';
import React from 'react';

import HomeHeaderLeft from '../../../components/HomeHeaderLeft';
import HomeHeaderRight from '../../../components/HomeHeaderRight';

export default function Layout() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Stack
        screenOptions={{
          animation: 'fade',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerLeft: HomeHeaderLeft,
            headerRight: HomeHeaderRight,
            headerShadowVisible: false,
            title: '',
          }}
        />
      </Stack>
    </>
  );
}