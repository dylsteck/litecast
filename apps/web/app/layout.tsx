import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import './reset.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--f-fa',
  weight: ['400', '700', '800'],
});

export default function RootLayout({
  children,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={inter.variable}
        style={{ backgroundColor: 'var(--gray3)' }}
      >
        {children}
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: {
    default: 'Bandi',
    template: `%s | Bandi`,
  },
};
