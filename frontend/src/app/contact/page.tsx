import { Metadata } from 'next';
import ContactClient from './ContactClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tensaiconsultancy.com';
const title = 'Contact Tensai';
const description = 'Questions, partnership inquiries, or anything else — reach the Tensai team directly.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/contact`,
    title,
    description,
    siteName: 'Tensai',
    images: [
      {
        url: `${SITE_URL}/api/og?page=contact`,
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
    images: [`${SITE_URL}/api/og?page=contact`]
  },
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  return <ContactClient />;
}
