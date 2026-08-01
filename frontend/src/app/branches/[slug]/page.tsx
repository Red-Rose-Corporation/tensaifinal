import { Metadata } from 'next';
import BranchClient from './BranchClient';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tensaiconsultancy.com';
const FALLBACK_IMAGE = `${SITE_URL}/tensai-logo.png`;

interface Branch {
  name: string;
  tagline: string | null;
  description: string | null;
  city: string;
  country: string;
  cover_image_url: string | null;
  logo_url: string | null;
}

async function fetchBranch(slug: string): Promise<Branch | null> {
  try {
    const res = await fetch(`${API}/branches/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const branch = await fetchBranch(slug);
  const url = `${SITE_URL}/branches/${slug}`;

  if (!branch) {
    const title = 'Branch — Tensai';
    const description = 'Find a Tensai branch near you — face-to-face guidance from verified consultants.';
    return {
      title,
      description,
      openGraph: { title, description, url, type: 'website', images: [{ url: FALLBACK_IMAGE, width: 512, height: 512, alt: title }] },
      twitter: { card: 'summary', title, description, images: [FALLBACK_IMAGE] },
    };
  }

  const location = `${branch.city}${branch.country && branch.country !== 'Bangladesh' ? `, ${branch.country}` : ''}`;
  const title = `${branch.name} — Tensai`;
  const description = branch.tagline
    ?? branch.description?.slice(0, 160)
    ?? `Tensai's branch in ${location} — face-to-face guidance from verified consultants.`;
  const image = branch.cover_image_url || branch.logo_url || FALLBACK_IMAGE;

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      url,
      title,
      description: `${location} — ${description}`,
      siteName: 'Tensai',
      images: [{ url: image, width: 1200, height: 630, alt: branch.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: `${location} — ${description}`,
      images: [image],
    },
    alternates: { canonical: url },
  };
}

export default async function BranchPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  await params; // consumed by generateMetadata; client component reads slug via useParams
  return <BranchClient />;
}
