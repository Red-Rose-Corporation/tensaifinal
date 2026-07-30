import { Metadata } from 'next';
import PostClient from './PostClient';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tensaiconsultancy.com';
const SITE_NAME = 'Tensai — Study Abroad Guide';
const FALLBACK_IMAGE = `${SITE_URL}/tensai-logo.png`;

async function fetchPost(slug: string) {
  try {
    const res = await fetch(`${API}/feed/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/* ── OG image: upgrade Unsplash URL to 1200×630 ─────────────── */
function ogImage(thumbnail: string | null): string {
  if (!thumbnail) return FALLBACK_IMAGE;
  if (thumbnail.includes('unsplash.com')) {
    const base = thumbnail.split('?')[0];
    return `${base}?w=1200&h=630&fit=crop&q=85&auto=format`;
  }
  return thumbnail;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) {
    // Still return full Open Graph data (using site branding) so a transient API
    // hiccup or bad link never shows up as a bare, image-less URL when shared.
    const title = 'Tensai — Study Abroad Guide';
    const description = 'The Way of Global Career. Verified guides for students moving abroad.';
    const url = `${SITE_URL}/feed/${slug}`;
    return {
      title,
      description,
      openGraph: {
        type: 'website',
        url,
        title,
        description,
        siteName: SITE_NAME,
        images: [{ url: FALLBACK_IMAGE, width: 512, height: 512, alt: title }],
      },
      twitter: {
        card: 'summary',
        title,
        description,
        images: [FALLBACK_IMAGE],
      },
    };
  }

  const title       = `${post.title} — ${SITE_NAME}`;
  const description = post.excerpt?.slice(0, 160) ?? '';
  const image       = ogImage(post.thumbnail);
  const url         = `${SITE_URL}/feed/${slug}`;

  return {
    title,
    description,
    openGraph: {
      type:        'article',
      url,
      title,
      description,
      siteName:    SITE_NAME,
      images: [{
        url:    image,
        width:  1200,
        height: 630,
        alt:    post.title,
      }],
      publishedTime: post.published_at ?? undefined,
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
      images:      [image],
    },
    alternates: { canonical: url },
  };
}

export default async function FeedPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  await params; // consumed by generateMetadata; client component reads slug via useParams
  return <PostClient />;
}
