import { Metadata } from 'next';
import HomePageClient from './PageClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tensaiconsultancy.com';

export const metadata: Metadata = {
  title: 'Tensai — The Way of Global Career',
  description: 'The Way of Global Career. Tensai connects verified students with global institutions through a transparent, fraud-proof digital ecosystem.',
  keywords: ['global career', 'study abroad', 'Japan', 'student visa', 'agency', 'Tensai'],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'Tensai — The Way of Global Career',
    description: 'The Way of Global Career. Tensai connects verified students with global institutions through a transparent, fraud-proof digital ecosystem.',
    siteName: 'Tensai',
    images: [
      {
        url: `${SITE_URL}/api/og?page=home`,
        width: 1200,
        height: 630,
        alt: 'Tensai — The Way of Global Career',
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tensai — The Way of Global Career',
    description: 'The Way of Global Career. Connect. Verify. Succeed.',
    images: [`${SITE_URL}/api/og?page=home`],
  },
  alternates: { canonical: SITE_URL },
};

export default function HomePage() {
  return <HomePageClient />;
}
