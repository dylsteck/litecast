import { ReactNode } from 'react';
import { BottomNavigation } from 'ui';

import Provider from './provider';

export default function RootLayout({
  modal,
  children,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <Provider>
      {children}
      <BottomNavigation />
      {modal}
    </Provider>
  );
}
