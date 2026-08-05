'use client';
import StudentLayout from '@/components/shared/StudentLayout';
import { useLang } from '@/context/LanguageContext';

export default function StudentExperiencePage() {
  const { lang } = useLang();
  const ja = lang === 'ja'; const bn = lang === 'bn';
  const t = (en: string, ja_: string, bn_: string) => ja ? ja_ : bn ? bn_ : en;

  return (
    <StudentLayout title={t('My Experience', '私の体験', 'আমার অভিজ্ঞতা')}>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Hero ── */}
        <div className="bg-gradient-to-br from-green-700 to-emerald-600 rounded-2xl px-6 py-6 flex items-center gap-5">
          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-black text-white leading-tight">
              {t('Share Your Journey', '旅を共有', 'আপনার যাত্রা শেয়ার করুন')}
            </h2>
            <p className="text-green-100 text-sm mt-0.5">
              {t('Post photos, videos and stories from your study abroad experience', '留学体験を投稿しよう', 'বিদেশে পড়াশোনার অভিজ্ঞতা শেয়ার করুন')}
            </p>
          </div>
        </div>

        {/* ── Coming soon: honest single state (no fake compose form) ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-base font-black text-slate-800 mb-2">
              {t('Community Feed — Coming Soon', 'コミュニティフィード — 近日公開', 'কমিউনিটি ফিড — শীঘ্রই আসছে')}
            </p>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              {t(
                "Soon you'll be able to post photos, videos, and stories about your study abroad journey for the Tensai community to see. We'll let you know the moment it's ready.",
                '留学の旅の写真・動画・ストーリーをTensaiコミュニティに投稿できるようになります。準備が整い次第お知らせします。',
                'শীঘ্রই আপনি বিদেশে পড়াশোনার যাত্রার ছবি, ভিডিও ও গল্প Tensai কমিউনিটির সাথে শেয়ার করতে পারবেন। প্রস্তুত হলেই আপনাকে জানানো হবে।'
              )}
            </p>
          </div>
        </div>

      </div>
    </StudentLayout>
  );
}
