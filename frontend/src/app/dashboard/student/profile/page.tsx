'use client';
import StudentLayout from '@/components/shared/StudentLayout';
import { useLang } from '@/context/LanguageContext';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

const QUALIFICATIONS = ['SSC', 'HSC', 'Diploma', 'Bachelor', 'Master', 'PhD', 'Other'] as const;

interface ProfileData {
  full_name?: string;
  full_name_japanese?: string;
  headline?: string;
  highest_qualification?: string;
  institution_name?: string;
  passing_year?: string | number;
  is_data_locked?: boolean;
}

function Alert({ type, msg }: { type: 'success' | 'error'; msg: string }) {
  return (
    <div className={`mb-4 flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border ${
      type === 'success'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
        : 'bg-rose-50 border-rose-200 text-rose-600'
    }`}>
      {type === 'success'
        ? <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
        : <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>}
      {msg}
    </div>
  );
}

export default function StudentProfilePage() {
  const { t, lang } = useLang();
  const { user, fetchMe } = useAuthStore();
  const p = t.studentProfile;
  const ja = lang === 'ja'; const bn = lang === 'bn';
  const tr = (en: string, ja_: string, bn_: string) => ja ? ja_ : bn ? bn_ : en;

  const { data, isLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => api.get('/student/profile').then((r) => r.data),
    staleTime: 60_000,
  });

  const profile: ProfileData = data?.profile ?? {};
  const locked = profile.is_data_locked ?? false;

  const [form, setForm] = useState<ProfileData>({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (data?.profile) {
      setForm({
        full_name: data.profile.full_name ?? '',
        full_name_japanese: data.profile.full_name_japanese ?? '',
        headline: data.profile.headline ?? '',
        highest_qualification: data.profile.highest_qualification ?? '',
        institution_name: data.profile.institution_name ?? '',
        passing_year: data.profile.passing_year ?? '',
      });
    }
  }, [data]);

  function set(key: keyof ProfileData, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    setSavedMsg('');
    setErrorMsg('');
    try {
      await api.put('/student/profile', form);
      setSavedMsg(p.saved);
      setTimeout(() => setSavedMsg(''), 4000);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setErrorMsg(err.response?.data?.message ?? 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  /* ── Profile picture upload ──────────────────────────────── */
  const fileInputRef    = useRef<HTMLInputElement>(null);
  const avatarObjectUrl = useRef<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarErr, setAvatarErr]         = useState('');
  const [avatarSaved, setAvatarSaved]     = useState(false);

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('avatar', file);
      return api.post('/student/account/avatar', fd, { headers: { 'Content-Type': undefined } });
    },
    onSuccess: () => {
      // Wait for the store's user.avatar_url to refresh before dropping the
      // local blob preview - otherwise avatarSrc briefly falls back to the
      // stale pre-upload URL (or null) between these two updates.
      fetchMe().catch(() => {}).finally(() => {
        setAvatarPreview(null);
        if (avatarObjectUrl.current) { URL.revokeObjectURL(avatarObjectUrl.current); avatarObjectUrl.current = null; }
      });
      setAvatarSaved(true); setAvatarErr('');
      setTimeout(() => setAvatarSaved(false), 3000);
    },
    onError: (e: unknown) => {
      const ax = e as { response?: { data?: { message?: string } } };
      setAvatarErr(ax.response?.data?.message ?? 'Upload failed.');
      if (avatarObjectUrl.current) { URL.revokeObjectURL(avatarObjectUrl.current); avatarObjectUrl.current = null; }
      setAvatarPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setAvatarErr(tr('File must be under 2 MB.', 'ファイルは2MB以内にしてください。', 'ফাইল ২ MB এর মধ্যে হতে হবে।')); return; }
    setAvatarErr('');
    if (avatarObjectUrl.current) URL.revokeObjectURL(avatarObjectUrl.current);
    avatarObjectUrl.current = URL.createObjectURL(file);
    setAvatarPreview(avatarObjectUrl.current);
    uploadAvatar.mutate(file);
  }

  /* ── Contact (phone) ─────────────────────────────────────── */
  const [phone, setPhone]               = useState('');
  const [contactSaved, setContactSaved] = useState(false);
  const [contactErr, setContactErr]     = useState('');
  useEffect(() => { setPhone(user?.phone ?? ''); }, [user?.phone]);

  const saveContact = useMutation({
    mutationFn: () => api.patch('/student/account', { phone }),
    onSuccess: () => { fetchMe().catch(() => {}); setContactSaved(true); setContactErr(''); setTimeout(() => setContactSaved(false), 3000); },
    onError:   (e: unknown) => { const ax = e as { response?: { data?: { message?: string } } }; setContactErr(ax.response?.data?.message ?? 'Failed to save.'); },
  });

  const initials  = (user?.name ?? '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const avatarSrc = avatarPreview ?? user?.avatar_url ?? null;

  if (isLoading) {
    return (
      <StudentLayout title={p.title}>
        <div className="py-16 flex justify-center">
          <span className="w-7 h-7 border-2 border-slate-200 border-t-green-600 rounded-full animate-spin" />
        </div>
      </StudentLayout>
    );
  }

  const inputCls = (disabled?: boolean) =>
    `w-full border rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-white transition-colors placeholder:text-slate-400 ${
      disabled
        ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
        : 'border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent'
    }`;

  return (
    <StudentLayout title={p.title}>

      {locked && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
          🔒 {p.locked}
        </div>
      )}

      {/* Profile Picture */}
      <Section title={tr('Profile Picture', 'プロフィール写真', 'প্রোফাইল ছবি')}>
        {avatarSaved && <Alert type="success" msg={tr('Photo updated successfully', '写真を更新しました', 'ছবি আপডেট হয়েছে')} />}
        {avatarErr   && <Alert type="error"   msg={avatarErr} />}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative shrink-0">
            {avatarSrc ? (
              <img src={avatarSrc} alt={`${user?.name} profile photo`} className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-sm" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center text-white text-3xl font-black shadow-sm select-none">
                {initials}
              </div>
            )}
            {uploadAvatar.isPending && (
              <div className="absolute inset-0 rounded-2xl bg-black/30 flex items-center justify-center">
                <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 mb-0.5">{user?.name}</p>
            <p className="text-xs text-slate-400 mb-3">{user?.email}</p>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadAvatar.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 shadow-sm min-h-[44px]">
              {uploadAvatar.isPending ? (
                <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />{tr('Uploading…','アップロード中…','আপলোড হচ্ছে…')}</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>{tr('Change Photo','写真を変更','ছবি পরিবর্তন করুন')}</>
              )}
            </button>
            <p className="text-[11px] text-slate-400 mt-2">JPG, PNG or WebP · max 2 MB</p>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
          </div>
        </div>
      </Section>

      {/* Account Info */}
      <Section title={tr('Account Info', 'アカウント情報', 'অ্যাকাউন্টের তথ্য')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <Field label={tr('Name', '氏名', 'নাম')}>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="truncate flex-1">{user?.name}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{tr('Contact support to change','変更はサポートへ','পরিবর্তনের জন্য সাপোর্টে যোগাযোগ করুন')}</p>
          </Field>
          <Field label={tr('Email Address', 'メールアドレス', 'ইমেইল')}>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="truncate flex-1 text-xs">{user?.email}</span>
              {user?.email_verified_at && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
                  ✓ {tr('Verified','認証済み','যাচাই হয়েছে')}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{tr('Contact support to change','変更はサポートへ','পরিবর্তনের জন্য সাপোর্টে যোগাযোগ করুন')}</p>
          </Field>
        </div>

        <div>
          {contactSaved && <Alert type="success" msg={tr('Phone number saved','保存しました','ফোন নম্বর সংরক্ষিত হয়েছে')} />}
          {contactErr   && <Alert type="error"   msg={contactErr} />}
          <label className="block text-xs sm:text-sm font-medium text-slate-500 mb-1.5">{tr('Phone Number','電話番号','ফোন নম্বর')}</label>
          <form onSubmit={e => { e.preventDefault(); saveContact.mutate(); }} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
              <input type="tel" className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 bg-white transition-shadow" placeholder="+880 1XXX XXXXXX"
                disabled={saveContact.isPending}
                value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <button type="submit" disabled={saveContact.isPending}
              className="min-h-[44px] w-full sm:w-auto px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 shadow-sm">
              {saveContact.isPending ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
              ) : tr('Save','保存','সংরক্ষণ')}
            </button>
          </form>
        </div>
      </Section>

      {/* Identity & Headline */}
      <Section title="Your Profile">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={p.fullName}>
            <input className={inputCls(locked)} disabled={locked} value={form.full_name ?? ''} onChange={(e) => set('full_name', e.target.value)} />
          </Field>
          <Field label={p.fullNameJapanese}>
            <input className={inputCls(locked)} disabled={locked} value={form.full_name_japanese ?? ''} onChange={(e) => set('full_name_japanese', e.target.value)} placeholder="例：田中 太郎（カタカナ）" />
          </Field>
          <Field label="Headline" className="sm:col-span-2">
            <input className={inputCls(locked)} disabled={locked} value={form.headline ?? ''} onChange={(e) => set('headline', e.target.value)} placeholder="e.g. 3rd Year Engineering Student, Preparing for Japan" />
            <p className="text-xs text-slate-400 mt-1">A short headline about your current status (visible to others)</p>
          </Field>
        </div>
      </Section>

      {/* Education Summary */}
      <Section title="Education">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={p.highestQualification}>
            <select className={inputCls(locked)} disabled={locked} value={form.highest_qualification ?? ''} onChange={(e) => set('highest_qualification', e.target.value)}>
              <option value="">—</option>
              {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </Field>
          <Field label={p.institutionName}>
            <input className={inputCls(locked)} disabled={locked} value={form.institution_name ?? ''} onChange={(e) => set('institution_name', e.target.value)} />
          </Field>
          <Field label={p.passingYear}>
            <input type="number" min="1990" max="2030" className={inputCls(locked)} disabled={locked} value={form.passing_year ?? ''} onChange={(e) => set('passing_year', e.target.value)} placeholder="1990–2030" />
          </Field>
        </div>
        <p className="text-xs text-slate-400 mt-3">For detailed education history, visit your Application Profile</p>
      </Section>

      {/* Save bar */}
      {!locked && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800 disabled:opacity-50 transition-colors"
          >
            {saving ? p.saving : p.saveBtn}
          </button>
          {savedMsg && <span className="text-sm text-emerald-600">{savedMsg}</span>}
          {errorMsg && <span className="text-sm text-red-500">{errorMsg}</span>}
        </div>
      )}

    </StudentLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 mb-5">
      <h2 className="font-semibold text-slate-500 mb-4 text-xs sm:text-sm uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs sm:text-sm font-medium text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
