import { Metadata } from 'next';
import TermsPageClient from './TermsClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tensaiconsultancy.com';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Tensai',
  description: 'Read Tensai\'s terms and conditions for students, agencies, and institutions. Understand your rights and responsibilities on our platform.',
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/terms`,
    title: 'Terms & Conditions — Tensai',
    description: 'Read Tensai\'s terms and conditions for students, agencies, and institutions.',
    siteName: 'Tensai',
    images: [
      {
        url: `${SITE_URL}/api/og?page=terms`,
        width: 1200,
        height: 630,
        alt: 'Terms & Conditions',
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms & Conditions — Tensai',
    description: 'Read Tensai\'s terms and conditions for all platform users.',
    images: [`${SITE_URL}/api/og?page=terms`]
  },
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default function TermsPage() {
  return <TermsPageClient />;
}
