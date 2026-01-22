import type { Metadata } from 'next';
import { Providers } from '../components/Providers';
import { LiquidGlassNav } from '../components/LiquidGlassNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Litecast',
  description: 'A lightweight Farcaster client',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-system-background">
        <Providers>
          <main className="max-w-[600px] mx-auto min-h-screen border-x border-system-separator pb-24">
            {children}
          </main>
          <LiquidGlassNav />
        </Providers>
      </body>
    </html>
  );
}
