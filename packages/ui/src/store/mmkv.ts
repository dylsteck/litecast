import { Platform } from 'react-native';
import { MMKV } from 'react-native-mmkv';

import { STORE_KEY } from '../config/constant';

export const MMKVStorage = new MMKV({
  id: STORE_KEY,
  ...Platform.select({
    native: { encryptionKey: '<YOUR_ENCRYPTION_KEY>' },
  }),
});
