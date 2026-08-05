'use client';
import StudentLayout from '@/components/shared/StudentLayout';
import { useLang } from '@/context/LanguageContext';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function StudentCVPage() {
  const { lang } = useLang();
  const { user } = useAuthStore();
  const ja = lang === 'ja'; const bn = lang === 'bn';
  const t = (en: string, ja_: string, bn_: string) => ja ? ja_ : bn ? bn_ : en;

  const initials = (user?.name ?? '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <StudentLayout title={t('My CV', '私の履歴書', 'আমার সিভি')}>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── CV Profile Hero ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-green-700 to-emerald-600 px-6 py-8 text-center relative">
            {/* Avatar */}
            <div className="relative inline-block mb-3">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={`${user?.name ?? 'User'} profile photo`} className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg mx-auto" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-white/20 border-4 border-white shadow-lg flex items-center justify-center text-white text-2xl font-black mx-auto">
                  {initials}
                </div>
              )}
              <Link href="/dashboard/student/settings"
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center hover:bg-slate-50 transition-colors"
                title={t('Edit profile photo', '写真を編集', 'ছবি পরিবর্তন করুন')}
              >
                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </Link>
            </div>
            <h2 className="text-xl font-black text-white">{user?.name ?? '—'}</h2>
            <p className="text-green-100 text-sm mt-0.5">{user?.email ?? ''}</p>
          </div>
        </div>

        {/* ── Coming soon: single, honest state (no fake interactive cards) ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-base font-black text-slate-800 mb-2">
              {t('CV Builder — Coming Soon', 'CV作成機能 — 近日公開', 'সিভি বিল্ডার — শীঘ্রই আসছে')}
            </p>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              {t(
                "We're building an easy CV builder — personal info, education, work experience, skills and more, with one-click PDF download. We'll let you know the moment it's ready.",
                'CV作成機能を準備中です。個人情報、学歴、職歴、スキルなどを入力し、PDFで簡単にダウンロードできるようになります。準備が整い次第お知らせします。',
                'সহজে CV তৈরি করার একটি ফিচার আমরা তৈরি করছি — ব্যক্তিগত তথ্য, শিক্ষা, কর্মঅভিজ্ঞতা, দক্ষতা ইত্যাদি দিয়ে এক ক্লিকে PDF ডাউনলোড করা যাবে। প্রস্তুত হলেই আপনাকে জানানো হবে।'
              )}
            </p>
          </div>
        </div>

      </div>
    </StudentLayout>
  );
}
