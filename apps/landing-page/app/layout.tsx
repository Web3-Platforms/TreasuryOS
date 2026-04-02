import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.treasuryos.xyz'),
  title: {
    default: 'TreasuryOS | Compliance-first treasury operations for institutional teams',
    template: '%s | TreasuryOS',
  },
  description:
    'TreasuryOS is the compliance-first operating system for institutional treasury teams coordinating governance, reporting, and phased digital-asset operations on Solana.',
  openGraph: {
    title: 'TreasuryOS',
    description:
      'Compliance-first treasury operations, governance, and reporting workflows for institutional teams moving onto digital-asset rails.',
    siteName: 'TreasuryOS',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TreasuryOS',
    description:
      'Compliance-first treasury operations, governance, and reporting workflows for institutional teams.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground antialiased`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
