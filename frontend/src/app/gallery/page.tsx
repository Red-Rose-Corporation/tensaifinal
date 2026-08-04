import { Metadata } from 'next';
import GalleryClient from './GalleryClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tensaiconsultancy.com';
const title = 'Student Gallery — Tensai';
const description = 'Success stories, events, and milestones from the Tensai community — students placed in Japan and beyond.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/gallery`,
    title,
    description,
    siteName: 'Tensai',
    images: [
      {
        url: `${SITE_URL}/api/og?page=gallery`,
        width: 1200,
        height: 630,
        alt: title,
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [`${SITE_URL}/api/og?page=gallery`]
  },
  alternates: { canonical: `${SITE_URL}/gallery` },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
