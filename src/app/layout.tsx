import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { ServiceWorkerRegistration } from '@/components/shared/ServiceWorkerRegistration';
import './globals.css';

export const metadata: Metadata = {
  title: 'Habit Tracker',
  description: 'A local-first habit tracker PWA',
  manifest: '/manifest.json'
};

export const viewport: Viewport = {
  themeColor: '#155e75'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
