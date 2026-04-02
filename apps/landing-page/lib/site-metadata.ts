import type { Metadata } from 'next';

export const siteName = 'TreasuryOS';
export const siteUrl = 'https://www.treasuryos.xyz';
export const defaultTitle = `${siteName} | Compliance-first treasury operations for institutional teams`;
export const defaultDescription =
  'TreasuryOS is the compliance-first operating system for institutional treasury teams coordinating governance, reporting, and phased digital-asset operations on Solana.';
export const socialImageUrl = `${siteUrl}/og`;

type PageMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
};

function normalizePath(path: string): string {
  if (!path || path === '/') {
    return '/';
  }

  const prefixedPath = path.startsWith('/') ? path : `/${path}`;
  return prefixedPath.endsWith('/') ? prefixedPath.slice(0, -1) : prefixedPath;
}

export function buildPageMetadata({
  title,
  description = defaultDescription,
  path = '/',
}: PageMetadataOptions): Metadata {
  const canonicalPath = normalizePath(path);
  const pageUrl = new URL(canonicalPath, siteUrl).toString();
  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle;

  return {
    ...(title ? { title } : {}),
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: pageUrl,
      siteName,
      type: 'website',
      images: [
        {
          url: socialImageUrl,
          width: 1200,
          height: 630,
          alt: 'TreasuryOS social preview',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [socialImageUrl],
    },
  };
}
