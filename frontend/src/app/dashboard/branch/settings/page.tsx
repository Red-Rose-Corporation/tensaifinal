'use client';
import BranchLayout from '@/components/shared/BranchLayout';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface BranchSettings {
  address: string | null;
  phone: string | null;
  phone_2: string | null;
  email: string | null;
  whatsapp: string | null;
  google_maps_url: string | null;
  working_hours: Record<string, string> | null;
  social_links: Record<string, string> | null;
  logo_url: string | null;
  cover_image_url: string | null;
}

const inp = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white';

export default function BranchSettingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  const isBranchAdmin = user?.roles?.some(r => r === 'branch_admin' || r === 'branch_manager');
  useEffect(() => {
    if (user && !isBranchAdmin) router.replace(`/dashboard/${user.gateway_type ?? ''}`);
  }, [user, isBranchAdmin, router]);

  const [form, setForm] = useState({ address: '', phone: '', phone_2: '', email: '', whatsapp: '', google_maps_url: '' });
  const [workingHours, setWorkingHours] = useState<Record<string, string>>({});
  const [socialLinks, setSocialLinks]   = useState<Record<string, string>>({});
  const [logoFile, setLogoFile]     = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [coverFile, setCoverFile]   = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [saved, setSaved]   = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const logoRef  = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const { data: settings, isLoading } = useQuery<BranchSettings>({
    queryKey: ['branch-settings'],
    queryFn: () => api.get('/branch-admin/settings').then(r => r.data),
    enabled: !!isBranchAdmin,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        address:         settings.address         ?? '',
        phone:           settings.phone           ?? '',
        phone_2:         settings.phone_2         ?? '',
        email:           settings.email           ?? '',
        whatsapp:        settings.whatsapp        ?? '',
        google_maps_url: settings.google_maps_url ?? '',
      });
      setWorkingHours(settings.working_hours ?? { 'Mon – Fri': '9:00 AM – 6:00 PM', Saturday: '10:00 AM – 2:00 PM', Sunday: 'Closed' });
      setSocialLinks(settings.social_links ?? {});
      setLogoPreview(settings.logo_url ?? '');
      setCoverPreview(settings.cover_image_url ?? '');
    }
  }, [settings]);

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoFile(f); setLogoPreview(URL.createObjectURL(f));
  }
  function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setCoverFile(f); setCoverPreview(URL.createObjectURL(f));
  }

  const save = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      Object.entries(workingHours).forEach(([day, hours]) => fd.append(`working_hours[${day}]`, hours));
      Object.entries(socialLinks).forEach(([platform, url]) => fd.append(`social_links[${platform}]`, url));
      if (logoFile)  fd.append('logo', logoFile);
      if (coverFile) fd.append('cover_image', coverFile);
      return api.post('/branch-admin/settings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branch-settings'] });
      qc.invalidateQueries({ queryKey: ['my-branch'] });
      setLogoFile(null); setCoverFile(null);
      setSaved(true); setSaveErr('');
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      setSaveErr(err.response?.data?.message ?? 'Failed to save settings.');
    },
  });

  function updateHourKey(old: string, nw: string) {
    setWorkingHours(p => { const n: Record<string,string> = {}; for (const [k,v] of Object.entries(p)) n[k===old?nw:k]=v; return n; });
  }
  function updateHourVal(key: string, val: string) { setWorkingHours(p => ({ ...p, [key]: val })); }
  function addHourRow()  { setWorkingHours(p => ({ ...p, '': '' })); }
  function removeHourRow(key: string) { setWorkingHours(p => { const n={...p}; delete n[key]; return n; }); }

  function updateSocialKey(old: string, nw: string) {
    setSocialLinks(p => { const n: Record<string,string> = {}; for (const [k,v] of Object.entries(p)) n[k===old?nw:k]=v; return n; });
  }
  function updateSocialVal(key: string, val: string) { setSocialLinks(p => ({ ...p, [key]: val })); }
  function addSocialRow()  { setSocialLinks(p => ({ ...p, '': '' })); }
  function removeSocialRow(key: string) { setSocialLinks(p => { const n={...p}; delete n[key]; return n; }); }

  if (!user || !isBranchAdmin) return null;

  return (
    <BranchLayout title="Settings">
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading…</div>
      ) : (
        <>
        {/* Page header */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.12em] mb-1.5">Branch Portal</p>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 mt-1.5">Manage your branch contact info, working hours and social links</p>
        </div>

        <form onSubmit={e => { e.preventDefault(); save.mutate(); }} className="max-w-2xl space-y-5">

          {saved && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-900 font-medium flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Settings saved successfully
            </div>
          )}
          {saveErr && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {saveErr}
            </div>
          )}

          {/* Branding */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-[0.08em]">Branding</h2>
              <p className="text-xs text-slate-400 mt-1">Logo and cover photo shown on your public branch page</p>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Cover Photo</label>
                <div
                  onClick={() => coverRef.current?.click()}
                  className="relative w-full aspect-[3/1] rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 hover:border-green-400 hover:bg-green-50/40 transition-all cursor-pointer flex items-center justify-center overflow-hidden group"
                >
                  {coverPreview
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={coverPreview} alt="cover preview" className="w-full h-full object-cover" />
                    : (
                      <div className="text-center px-6">
                        <svg className="w-8 h-8 text-slate-300 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs font-semibold text-slate-500">Click to upload cover photo</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WebP — max 8MB</p>
                      </div>
                    )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 bg-black/50 px-3 py-1.5 rounded-full transition-opacity">Click to change</span>
                  </div>
                </div>
                <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCover} />
              </div>
              <div className="flex items-center gap-4">
                <div
                  onClick={() => logoRef.current?.click()}
                  className="relative w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 hover:border-green-400 hover:bg-green-50/40 transition-all cursor-pointer flex items-center justify-center overflow-hidden shrink-0 group"
                >
                  {logoPreview
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={logoPreview} alt="logo preview" className="w-full h-full object-cover" />
                    : <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <span className="text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Change</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Logo</p>
                  <button type="button" onClick={() => logoRef.current?.click()} className="text-xs font-semibold text-green-700 hover:text-green-800">
                    Upload logo
                  </button>
                  <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WebP — max 2MB</p>
                </div>
                <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogo} />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-[0.08em]">Contact</h2>
              <p className="text-xs text-slate-400 mt-1">Your branch&apos;s public-facing contact information</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Address</label>
                <textarea className={`${inp} resize-none`} rows={2}
                  value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Branch office address" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Phone</label>
                  <input className={inp} placeholder="+880 1XXX XXXXXX"
                    value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Phone 2 <span className="text-slate-400 font-normal">optional</span></label>
                  <input className={inp} placeholder="+880 1XXX XXXXXX"
                    value={form.phone_2} onChange={e => setForm(f => ({ ...f, phone_2: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
                  <input className={inp} type="email" placeholder="branch@tensai.com"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">WhatsApp</label>
                  <input className={inp} placeholder="8801XXXXXXXXX"
                    value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Google Maps URL</label>
                <input className={inp} type="url" placeholder="https://maps.google.com/…"
                  value={form.google_maps_url} onChange={e => setForm(f => ({ ...f, google_maps_url: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-[0.08em]">Working Hours</h2>
                <p className="text-xs text-slate-400 mt-1">Days and hours your branch is open</p>
              </div>
              <button type="button" onClick={addHourRow}
                className="text-xs font-semibold text-green-700 hover:text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors">
                + Add row
              </button>
            </div>
            <div className="space-y-2">
              {Object.entries(workingHours).map(([day, hours]) => (
                <div key={day} className="flex gap-2 items-center">
                  <input className={`${inp} flex-1`} value={day} placeholder="Day"
                    onChange={e => updateHourKey(day, e.target.value)} />
                  <input className={`${inp} flex-1`} value={hours} placeholder="Hours"
                    onChange={e => updateHourVal(day, e.target.value)} />
                  <button type="button" onClick={() => removeHourRow(day)}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 text-lg">×</button>
                </div>
              ))}
              {Object.keys(workingHours).length === 0 && (
                <p className="text-xs text-slate-500 py-1">No hours set. Click + Add row.</p>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-[0.08em]">Social Links</h2>
                <p className="text-xs text-slate-400 mt-1">Facebook, Instagram, LinkedIn, etc.</p>
              </div>
              <button type="button" onClick={addSocialRow}
                className="text-xs font-semibold text-green-700 hover:text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors">
                + Add link
              </button>
            </div>
            <div className="space-y-2">
              {Object.entries(socialLinks).map(([platform, url], idx) => {
                const platformLooksLikeUrl = /^https?:\/\//i.test(platform.trim());
                return (
                  <div key={idx}>
                    <div className="flex gap-2 items-center">
                      <input className={`${inp} !w-32 shrink-0 ${platformLooksLikeUrl ? 'border-red-300 focus:ring-red-400' : ''}`}
                        value={platform} placeholder="e.g. facebook"
                        onChange={e => updateSocialKey(platform, e.target.value)} />
                      <input className={`${inp} flex-1`} value={url} placeholder="https://facebook.com/…"
                        onChange={e => updateSocialVal(platform, e.target.value)} />
                      <button type="button" onClick={() => removeSocialRow(platform)}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 text-lg">×</button>
                    </div>
                    {platformLooksLikeUrl && (
                      <p className="text-[11px] text-red-500 mt-1 ml-1">
                        ⚠ This looks like a link — put the platform name (e.g. &quot;facebook&quot;) on the left, and the full link on the right →
                      </p>
                    )}
                  </div>
                );
              })}
              {Object.keys(socialLinks).length === 0 && (
                <p className="text-xs text-slate-500 py-1">No social links yet. Click + Add link.</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={save.isPending}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 shadow-sm hover:shadow-md">
              {save.isPending ? 'Saving…' : 'Save Settings'}
            </button>
          </div>

        </form>
        </>
      )}
    </BranchLayout>
  );
}
