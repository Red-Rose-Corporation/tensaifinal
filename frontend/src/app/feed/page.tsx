import { Metadata } from 'next';
import FeedClient from './FeedClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tensaiconsultancy.com';

export const metadata: Metadata = {
  title: '📖 বিদেশে যাওয়ার আগে যা জানা জরুরি — Tensai',
  description: 'বিদেশে উচ্চশিক্ষা, কেয়ারগিভার ও ওয়ার্ক ভিসা পরামর্শের বিশ্বস্ত প্রতিষ্ঠান',
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/feed`,
    title: '📖 বিদেশে যাওয়ার আগে যা জানা জরুরি — Tensai',
    description: 'বিদেশে উচ্চশিক্ষা, কেয়ারগিভার ও ওয়ার্ক ভিসা পরামর্শের বিশ্বস্ত প্রতিষ্ঠান',
    siteName: 'Tensai',
  },
  twitter: {
    card: 'summary_large_image',
    title: '📖 বিদেশে যাওয়ার আগে যা জানা জরুরি — Tensai',
    description: 'বিদেশে উচ্চশিক্ষা, কেয়ারগিভার ও ওয়ার্ক ভিসা পরামর্শের বিশ্বস্ত প্রতিষ্ঠান',
  },
  alternates: { canonical: `${SITE_URL}/feed` },
};

export default function FeedPage() {
  return <FeedClient />;
}
