import React, { FC } from 'react';
import { DefaultValue } from 'recoil';
import type { RecoilSyncOptions } from 'recoil-sync';
import { RecoilSync } from 'recoil-sync';

import { STORE_KEY } from '../config/constant';
import { MMKVStorage } from '../store/mmkv';

export const WithRecoilSync: FC<RecoilSyncOptions> = ({
  children,
  ...restRecoilSyncProps
}) => {
  return (
    <RecoilSync
      storeKey={STORE_KEY}
      read={itemKey => {
        if (typeof window === 'undefined') {
          return new DefaultValue();
        }

        const gainedValue = MMKVStorage.getString(itemKey);

        if (gainedValue) {
          return JSON.parse(gainedValue);
        } else {
          return new DefaultValue();
        }
      }}
      write={({ diff }) => {
        for (const [key, value] of diff) {
          try {
            MMKVStorage.set(key, JSON.stringify(value));
          } catch (error) {
            console.error(error);
          }
        }
      }}
      {...restRecoilSyncProps}
    >
      {children}
    </RecoilSync>
  );
};
