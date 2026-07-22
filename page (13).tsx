import './globals.css';
import type { Metadata } from 'next';
import { Inter, Cairo } from 'next/font/google';
import { Providers } from '@/lib/providers';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://cedar.market'),
  title: {
    default: 'Cedar — Premium Marketplace, Delivered',
    template: '%s | Cedar',
  },
  description:
    'Cedar is a premium dropshipping marketplace. Shop electronics, fashion, home, beauty and more with Cash on Delivery across the region.',
  keywords: [
    'Cedar',
    'marketplace',
    'dropshipping',
    'online shopping',
    'cash on delivery',
    'electronics',
    'fashion',
  ],
  authors: [{ name: 'Cedar' }],
  openGraph: {
    title: 'Cedar — Premium Marketplace, Delivered',
    description: 'Shop thousands of curated products with Cash on Delivery.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Cedar',
    images: [
      {
        url: 'https://images.pexels.com/photos/5076516/pexels-photo-5076516.jpeg?auto=compress&cs=tinysrgb&w=1200',
        width: 1200,
        height: 630,
        alt: 'Cedar Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cedar — Premium Marketplace, Delivered',
    description: 'Shop thousands of curated products with Cash on Delivery.',
    images: [
      'https://images.pexels.com/photos/5076516/pexels-photo-5076516.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon.png',
  },
  manifest: '/manifest.webmanifest',
  themeColor: '#0f5e3a',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${inter.variable} ${cairo.variable} font-sans antialiased`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
