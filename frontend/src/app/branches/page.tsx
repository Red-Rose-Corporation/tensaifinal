import { Metadata } from 'next';
import BranchesClient from './BranchesClient';

const title = 'Our Branches — Tensai';
const description = 'Get face-to-face guidance from verified Tensai consultants at branch offices across Bangladesh.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
};

export default function BranchesPage() {
  return <BranchesClient />;
}
