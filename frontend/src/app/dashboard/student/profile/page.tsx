'use client';
import StudentLayout from '@/components/shared/StudentLayout';
import { useLang } from '@/context/LanguageContext';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

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

export default function StudentProfilePage() {
  const { t } = useLang();
  const { user } = useAuthStore();
  const p = t.studentProfile;

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
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800 disabled:opacity-50 transition-colors shrink-0"
          >
            {saving ? p.saving : p.saveBtn}
          </button>
          {savedMsg && <span className="text-sm text-emerald-600 min-w-0">{savedMsg}</span>}
          {errorMsg && <span className="text-sm text-red-500 min-w-0">{errorMsg}</span>}
        </div>
      )}

    </StudentLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 mb-5">
      <h2 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
