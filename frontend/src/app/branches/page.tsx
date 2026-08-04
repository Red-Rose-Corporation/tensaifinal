import { Metadata } from 'next';
import BranchesClient from './BranchesClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tensaiconsultancy.com';
const title = 'Our Branches — Tensai';
const description = 'Get face-to-face guidance from verified Tensai consultants at branch offices across Bangladesh.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/branches`,
    title,
    description,
    siteName: 'Tensai',
    images: [
      {
        url: `${SITE_URL}/api/og?page=branches`,
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
    images: [`${SITE_URL}/api/og?page=branches`]
  },
  alternates: { canonical: `${SITE_URL}/branches` },
};

export default function BranchesPage() {
  return <BranchesClient />;
}
