import { Metadata } from 'next';
import TeamClient from './TeamClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tensaiconsultancy.com';
const title = 'Our Team — Tensai';
const description = 'Meet the founders and team building Tensai — a fraud-proof, tech-enabled platform connecting verified students, agencies, and institutions worldwide.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/team`,
    title,
    description,
    siteName: 'Tensai',
    images: [
      {
        url: `${SITE_URL}/api/og?page=team`,
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
    images: [`${SITE_URL}/api/og?page=team`]
  },
  alternates: { canonical: `${SITE_URL}/team` },
};

export default function TeamPage() {
  return <TeamClient />;
}
