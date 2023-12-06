import type { TamaguiConfig } from 'ui';

declare module 'tamagui' {
  // overrides TamaguiCustomConfig so your custom types
  // work everywhere you import `tamagui`
  type TamaguiCustomConfig = TamaguiConfig;
}
