import { Metadata } from 'next';
import GalleryClient from './GalleryClient';

const title = 'Student Gallery — Tensai';
const description = 'Success stories, events, and milestones from the Tensai community — students placed in Japan and beyond.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
