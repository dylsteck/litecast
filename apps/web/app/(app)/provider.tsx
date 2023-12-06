'use client';

import 'client-only';
import { NextThemeProvider, useRootTheme } from '@tamagui/next-theme';
import { useServerInsertedHTML } from 'next/navigation';
import React, { ReactNode, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { RecoilRoot } from 'recoil';
import '@tamagui/polyfill-dev';
import { createTamagui, Stack, TamaguiProvider } from 'tamagui';
import { WithRecoilSync } from 'ui';

import configBase from '../../tamagui.config';

const tamaguiConfig = createTamagui({
  ...configBase,
  themeClassNameOnRoot: false,
});

interface ProviderProps {
  children: ReactNode;
}

export default function Provider({ children }: ProviderProps) {
  const [theme, setTheme] = useRootTheme();

  useServerInsertedHTML(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const rnwStyle = StyleSheet.getSheet();
    return (
      <>
        <style
          dangerouslySetInnerHTML={{ __html: rnwStyle.textContent }}
          id={rnwStyle.id}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: tamaguiConfig.getCSS({
              ...(process.env['NODE_ENV'] === 'production'
                ? {
                    exclude: 'design-system',
                  }
                : {}),
            }),
          }}
        />
      </>
    );
  });

  useEffect(function logDevOnlyThemeConfig() {
    if (process.env['NODE_ENV'] === 'development') {
      console.log('tamaguiConfig', tamaguiConfig);
    }
  }, []);

  return (
    <NextThemeProvider
      onChangeTheme={next => {
        setTheme(next as 'dark' | 'light');
      }}
    >
      <TamaguiProvider
        config={tamaguiConfig}
        themeClassNameOnRoot
        defaultTheme={theme}
      >
        <RecoilRoot>
          <WithRecoilSync>
            <Stack width="100%">
              {children}
              <Stack
                height="$5"
                key="placeholderOfBottomNavigation"
                pointerEvents="box-none"
              />
            </Stack>
          </WithRecoilSync>
        </RecoilRoot>
      </TamaguiProvider>
    </NextThemeProvider>
  );
}
