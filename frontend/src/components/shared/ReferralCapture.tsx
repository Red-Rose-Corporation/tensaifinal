'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { storeReferralCode } from '@/lib/referral';

/**
 * Captures ?ref=CODE from any page (not just /auth/register) and persists it
 * for 30 days, so an affiliate gets credit even if the visitor reads a guide
 * first and registers later. Renders nothing.
 */
export default function ReferralCapture() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) storeReferralCode(ref);
  }, [searchParams, pathname]);

  return null;
}
