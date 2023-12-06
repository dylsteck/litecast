import { config } from '@tamagui/config';
import { createTamagui } from 'tamagui';

export const tamaguiConfig = createTamagui(config);

export type TamaguiConfig = typeof tamaguiConfig;
