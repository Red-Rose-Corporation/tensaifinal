import { Metadata } from 'next';
import ContactClient from './ContactClient';

const title = 'Contact Tensai';
const description = 'Questions, partnership inquiries, or anything else — reach the Tensai team directly.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
};

export default function ContactPage() {
  return <ContactClient />;
}
