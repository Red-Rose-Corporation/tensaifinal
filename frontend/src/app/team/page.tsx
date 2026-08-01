import { Metadata } from 'next';
import TeamClient from './TeamClient';

const title = 'Our Team — Tensai';
const description = 'Meet the founders and team building Tensai — a fraud-proof, tech-enabled platform connecting verified students, agencies, and institutions worldwide.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
};

export default function TeamPage() {
  return <TeamClient />;
}
