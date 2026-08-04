import { Metadata } from 'next';
import FeedClient from './FeedClient';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tensaiconsultancy.com';
const FALLBACK_IMAGE = `${SITE_URL}/tensai-logo.png`;

async function fetchLatestPost() {
  try {
    const res = await fetch(`${API}/feed?limit=1`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.[0] ?? null;
  } catch {
    return null;
  }
}

function ogImage(thumbnail: string | null): string {
  if (!thumbnail) return FALLBACK_IMAGE;
  if (thumbnail.includes('unsplash.com')) {
    const base = thumbnail.split('?')[0];
    return `${base}?w=1200&h=630&fit=crop&q=85&auto=format`;
  }
  return thumbnail;
}

export async function generateMetadata(): Promise<Metadata> {
  const latestPost = await fetchLatestPost();
  const image = ogImage(latestPost?.thumbnail ?? null);

  const title = '📖 বিদেশে যাওয়ার আগে যা জানা জরুরি — Tensai';
  const description = 'বিদেশে উচ্চশিক্ষা, কেয়ারগিভার ও ওয়ার্ক ভিসা পরামর্শের বিশ্বস্ত প্রতিষ্ঠান';

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/feed`,
      title,
      description,
      siteName: 'Tensai',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: latestPost?.title ?? title,
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: { canonical: `${SITE_URL}/feed` },
  };
}

export default function FeedPage() {
  return <FeedClient />;
}
