import { nullable, object, string, bool, optional } from '@recoiljs/refine';
import { atom } from 'recoil';
import { syncEffect } from 'recoil-sync';

import { STORE_KEY } from '../config/constant';

type UserInfoState = {
  auth: boolean;
  userID?: string;
  userName?: string;
  userPhoneNumber?: string;
};

const userInfoState = atom<UserInfoState | null | undefined>({
  default: {
    auth: false,
  },
  effects: [
    syncEffect({
      refine: nullable(
        object({
          auth: bool(),
          userID: optional(string()),
          userName: optional(string()),
          userPhoneNumber: optional(string()),
        }),
      ),
      storeKey: STORE_KEY,
    }),
  ],
  key: 'userInfo',
});

export { userInfoState };
