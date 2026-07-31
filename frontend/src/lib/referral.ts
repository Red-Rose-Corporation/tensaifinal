const REF_STORAGE_KEY = 'tensai_ref';
const REF_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/** Persist a referral code, overwriting any previous one (last-click wins). */
export function storeReferralCode(code: string): void {
  if (typeof window === 'undefined' || !code) return;
  try {
    localStorage.setItem(REF_STORAGE_KEY, JSON.stringify({ code, savedAt: Date.now() }));
  } catch {
    // localStorage unavailable (private mode etc.) — attribution just won't persist.
  }
}

/** Read a stored referral code, if any and not expired. */
export function getStoredReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(REF_STORAGE_KEY);
    if (!raw) return null;
    const { code, savedAt } = JSON.parse(raw) as { code?: string; savedAt?: number };
    if (!code || !savedAt) return null;
    if (Date.now() - savedAt > REF_TTL_MS) {
      localStorage.removeItem(REF_STORAGE_KEY);
      return null;
    }
    return code;
  } catch {
    return null;
  }
}
