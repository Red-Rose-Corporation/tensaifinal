'use client';
import { useLang } from '@/context/LanguageContext';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface SiteSettings {
  support_whatsapp?: string;
  support_phone?: string;
  support_email?: string;
  office_address?: string;
}

const DEFAULT_WHATSAPP = '8801961770211';
const DEFAULT_PHONE = '+880 1961-770211';
const DEFAULT_EMAIL = 'hello@tensaiconsultancy.com';

export default function ContactPage() {
  const { t, lang, toggle } = useLang();
  const l = t.landing;
  const ja = lang === 'ja';
  const bn = lang === 'bn';

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ['public-settings'],
    queryFn: () => api.get('/settings/public').then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const phone = settings?.support_phone || DEFAULT_PHONE;
  const whatsappNumber = settings?.support_whatsapp || DEFAULT_WHATSAPP;
  const whatsappHref = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;
  const email = settings?.support_email || DEFAULT_EMAIL;

  const toggleLabel     = lang === 'en' ? 'বাংলা' : lang === 'bn' ? '日本語' : 'English';
  const toggleAriaLabel = lang === 'en' ? 'Switch to Bangla' : lang === 'bn' ? '日本語に切り替える' : 'Switch to English';
  const navAbout = ja ? '会社概要' : bn ? 'আমাদের সম্পর্কে' : 'About';
  const navTeam  = ja ? 'チーム' : bn ? 'টিম' : 'Team';
  const termsText = l.terms;
  const privText  = l.privacy;

  const pageTitle = ja ? 'お問い合わせ' : bn ? 'যোগাযোগ করুন' : 'Contact Us';
  const pageDesc = ja
    ? 'ご質問、ご相談、パートナーシップのお問い合わせはこちらから。私たちのチームが直接対応します。'
    : bn ? 'প্রশ্ন, পরামর্শ বা পার্টনারশিপ সংক্রান্ত যেকোনো বিষয়ে সরাসরি আমাদের সাথে যোগাযোগ করুন।'
    : 'Questions, partnership inquiries, or anything else — reach us directly and our team will respond.';

  return (
    <div className="min-h-screen bg-[#0d1117]">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav
        aria-label={ja ? 'メインナビゲーション' : bn ? 'প্রধান নেভিগেশন' : 'Main navigation'}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-nav' : 'bg-transparent'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image src="/tensai-logo.png" alt="Tensai" width={36} height={36} className="rounded-full object-contain" priority />
            <div>
              <div className="text-base font-bold text-white tracking-tight leading-none">Tensai</div>
              <div className="text-[9px] text-white/35 tracking-wider leading-none mt-0.5 hidden sm:block">
                {ja ? 'グローバルキャリアへの道' : bn ? 'বৈশ্বিক ক্যারিয়ারের পথ' : 'THE WAY OF GLOBAL CAREER'}
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={toggle}
              aria-label={toggleAriaLabel}
              className="text-xs font-semibold px-2.5 py-1 rounded-full border border-white/10 text-white/60 hover:border-green-500/40 hover:text-green-400 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
            >
              {toggleLabel}
            </button>
            <Link href="/about"    className="text-sm text-white/50 hover:text-white transition-colors px-2 py-1 hidden md:inline">{navAbout}</Link>
            <Link href="/team"     className="text-sm text-white/50 hover:text-white transition-colors px-2 py-1 hidden md:inline">{navTeam}</Link>
            <Link href="/branches" className="text-sm text-white/50 hover:text-white transition-colors px-2 py-1 hidden md:inline">{ja ? '支局' : bn ? 'শাখা' : 'Branches'}</Link>
            <Link href="/contact"  className="text-sm font-semibold text-green-400 px-2 py-1 hidden md:inline border-b border-green-500/50">{pageTitle}</Link>
            <Link href="/auth/login" className="text-sm text-white/65 hover:text-white transition-colors px-3 py-1.5 hidden sm:inline">{l.login}</Link>
            <Link href="/auth/register" className="text-sm bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-full font-semibold transition-all glow-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 hidden sm:inline">
              {l.getStarted}
            </Link>
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.08] transition-all"
              aria-label="Menu"
            >
              {mobileOpen
                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
              }
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden bg-[#0d1117]/95 backdrop-blur-md border-t border-white/[0.08] px-4 py-4 flex flex-col gap-1">
            <Link href="/about"    onClick={() => setMobileOpen(false)} className="text-sm text-white/60 hover:text-white px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-all">{navAbout}</Link>
            <Link href="/team"     onClick={() => setMobileOpen(false)} className="text-sm text-white/60 hover:text-white px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-all">{navTeam}</Link>
            <Link href="/branches" onClick={() => setMobileOpen(false)} className="text-sm text-white/60 hover:text-white px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-all">{ja ? '支局' : bn ? 'শাখা' : 'Branches'}</Link>
            <Link href="/contact"  onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-green-400 px-3 py-2.5 rounded-xl bg-green-500/10">{pageTitle}</Link>
            <div className="border-t border-white/[0.08] mt-2 pt-3 flex gap-2">
              <Link href="/auth/login"    onClick={() => setMobileOpen(false)} className="flex-1 text-center text-sm text-white/70 hover:text-white border border-white/10 hover:border-white/25 px-4 py-2.5 rounded-full transition-all">{l.login}</Link>
              <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center text-sm bg-green-600 hover:bg-green-500 text-white px-4 py-2.5 rounded-full font-semibold transition-all">{l.getStarted}</Link>
            </div>
          </div>
        )}
      </nav>

      <main>

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="hero-mesh relative overflow-hidden pt-32 pb-16 px-4 text-center">
          <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-green-600/10 rounded-full blur-[160px] pointer-events-none" aria-hidden="true" />
          <div className="absolute bottom-0 right-[5%] w-[350px] h-[350px] bg-cyan-500/7 rounded-full blur-[130px] pointer-events-none" aria-hidden="true" />
          <div className="relative z-10 max-w-2xl mx-auto animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" aria-hidden="true" />
              {ja ? 'いつでもご連絡ください' : bn ? 'আমরা সবসময় পাশে আছি' : "We're here to help"}
            </div>
            <h1 className="text-fluid-hero font-black text-white leading-[1.06] tracking-tight mb-5">
              {pageTitle}
            </h1>
            <p className="text-fluid-base text-white/50 max-w-xl mx-auto leading-relaxed">
              {pageDesc}
            </p>
          </div>
        </section>

        {/* ── Contact Cards ──────────────────────────────────── */}
        <section className="py-8 sm:py-12 px-4">
          <div className="max-w-4xl mx-auto grid gap-4 sm:grid-cols-3">

            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="glass-card border border-white/[0.08] rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:border-green-500/35 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center text-2xl">📞</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-white/40">
                {ja ? '電話' : bn ? 'ফোন' : 'Phone'}
              </div>
              <div className="text-white font-semibold text-sm" dir="ltr">{phone}</div>
            </a>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500/10 border border-green-500/25 rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:bg-green-500/20 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center text-2xl">💬</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-green-400/80">WhatsApp</div>
              <div className="text-green-400 font-semibold text-sm" dir="ltr">+{whatsappNumber.replace(/[^0-9]/g, '')}</div>
            </a>

            <a
              href={`mailto:${email}`}
              className="glass-card border border-white/[0.08] rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:border-green-500/35 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center text-2xl">✉️</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-white/40">
                {ja ? 'メール' : bn ? 'ইমেইল' : 'Email'}
              </div>
              <div className="text-white font-semibold text-sm break-all">{email}</div>
            </a>

          </div>

          {settings?.office_address && (
            <div className="max-w-4xl mx-auto mt-4">
              <div className="glass-card border border-white/[0.08] rounded-2xl p-6 flex items-center gap-3 justify-center text-center">
                <span className="text-xl">📍</span>
                <span className="text-white/60 text-sm">{settings.office_address}</span>
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto mt-8 text-center">
            <p className="text-white/35 text-xs">
              {ja
                ? 'または各支局を直接訪問することもできます。'
                : bn ? 'অথবা সরাসরি আমাদের যেকোনো শাখায় দেখা করতে পারেন।'
                : 'Or visit one of our branches in person.'}
              {' '}
              <Link href="/branches" className="text-green-400 hover:underline">
                {ja ? '支局一覧を見る →' : bn ? 'শাখাগুলো দেখুন →' : 'See branches →'}
              </Link>
            </p>
          </div>
        </section>

      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-8 px-4 bg-alt-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/tensai-logo.png" alt="Tensai" width={26} height={26} className="rounded-full object-contain opacity-70" />
              <span className="text-sm font-bold text-white/50">Tensai</span>
            </Link>
            <nav aria-label={ja ? 'フッターナビゲーション' : bn ? 'ফুটার নেভিগেশন' : 'Footer navigation'}>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/35">
                <Link href="/about"   className="hover:text-white/65 transition-colors">{navAbout}</Link>
                <Link href="/team"    className="hover:text-white/65 transition-colors">{navTeam}</Link>
                <Link href="/contact" className="text-green-400 font-medium">{pageTitle}</Link>
                <Link href="/terms"   className="hover:text-white/65 transition-colors">{termsText}</Link>
                <Link href="/privacy" className="hover:text-white/65 transition-colors">{privText}</Link>
              </div>
            </nav>
            <p className="text-xs text-white/30">{l.footer}</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
