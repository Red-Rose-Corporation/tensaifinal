import { Metadata } from 'next';
import AboutClient from './AboutClient';

const title = 'About Tensai — The Way of Global Career';
const description = 'Tensai is a trust engine for global education and healthcare careers — AI-verified documents, escrow-protected payments, and zero fake profiles.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
};

export default function AboutPage() {
  return <AboutClient />;
}
