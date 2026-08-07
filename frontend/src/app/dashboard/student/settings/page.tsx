'use client';
import StudentLayout from '@/components/shared/StudentLayout';
import { useLang } from '@/context/LanguageContext';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
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

const inp = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 bg-white transition-shadow';
const lbl = 'block text-xs sm:text-sm font-semibold text-slate-500 mb-1.5';

export default function StudentSettingsPage() {
  const { lang } = useLang();
  const { user } = useAuthStore();
  const router = useRouter();
  const ja = lang === 'ja'; const bn = lang === 'bn';
  const t = (en: string, ja_: string, bn_: string) => ja ? ja_ : bn ? bn_ : en;

  useEffect(() => {
    if (user && user.gateway_type !== 'student') router.replace('/dashboard');
  }, [user, router]);

  const [pw, setPw]         = useState({ current_password: '', password: '', password_confirmation: '' });
  const [pwSaved, setPwSaved] = useState(false);
  const [pwErr, setPwErr]     = useState('');
  const [showPw, setShowPw]   = useState({ current: false, next: false, confirm: false });

  const savePassword = useMutation({
    mutationFn: () => api.patch('/student/account', pw),
    onSuccess: () => { setPwSaved(true); setPwErr(''); setPw({ current_password: '', password: '', password_confirmation: '' }); setTimeout(() => setPwSaved(false), 3000); },
    onError:   (e: unknown) => { const ax = e as { response?: { data?: { message?: string } } }; setPwErr(ax.response?.data?.message ?? 'Failed to update password.'); },
  });

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.password.length < 8) { setPwErr(t('Password must be at least 8 characters.', '8文字以上必要です。', 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।')); return; }
    if (pw.password !== pw.password_confirmation) { setPwErr(t('Passwords do not match.', 'パスワードが一致しません。', 'পাসওয়ার্ড মিলছে না।')); return; }
    setPwErr(''); savePassword.mutate();
  }

  // Password strength: 1–4
  const pwStrength = pw.password.length === 0 ? 0 :
    1 + [/[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(pw.password)).length +
    (pw.password.length >= 12 ? 1 : 0);
  const strengthClamped = Math.min(pwStrength, 4) as 0 | 1 | 2 | 3 | 4;
  const strengthLabel = ['', t('Weak','弱い','দুর্বল'), t('Fair','まあまあ','মাঝারি'), t('Good','良い','ভালো'), t('Strong','強い','শক্তিশালী')][strengthClamped];
  const strengthColor = [,'bg-rose-400','bg-amber-400','bg-green-400','bg-green-600'][strengthClamped];

  const pwValid = pw.current_password.length > 0 && pw.password.length >= 8 && pw.password === pw.password_confirmation;

  if (!user) return null;

  return (
    <StudentLayout title={t('Settings', '設定', 'সেটিংস')}>

      {/* ── Security / Change Password ── */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden max-w-2xl">
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5 border-b border-slate-100 bg-slate-50/60">
          <span className="w-0.5 h-4 bg-green-600 rounded-full shrink-0" />
          <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">{t('Security','セキュリティ','নিরাপত্তা')}</h2>
            <p className="text-[11px] text-slate-400">{t('Change your password','パスワードを変更','পাসওয়ার্ড পরিবর্তন করুন')}</p>
          </div>
        </div>
        <div className="px-4 sm:px-6 py-6">
          {pwSaved && <Alert type="success" msg={t('Password updated successfully','パスワードを更新しました','পাসওয়ার্ড আপডেট হয়েছে')} />}
          {pwErr   && <Alert type="error"   msg={pwErr} />}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current + New on same row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>{t('Current Password','現在のパスワード','বর্তমান পাসওয়ার্ড')}</label>
                <div className="relative">
                  <input type={showPw.current ? 'text' : 'password'} className={`${inp} pr-10`}
                    placeholder="••••••••"
                    value={pw.current_password}
                    onChange={e => setPw(p => ({ ...p, current_password: e.target.value }))} required />
                  <button type="button" onClick={() => setShowPw(s => ({ ...s, current: !s.current }))}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600">
                    <EyeIcon open={showPw.current} />
                  </button>
                </div>
              </div>
              <div>
                <label className={lbl}>{t('New Password','新しいパスワード','নতুন পাসওয়ার্ড')}</label>
                <div className="relative">
                  <input type={showPw.next ? 'text' : 'password'} className={`${inp} pr-10`}
                    placeholder="••••••••"
                    value={pw.password}
                    onChange={e => setPw(p => ({ ...p, password: e.target.value }))} required />
                  <button type="button" onClick={() => setShowPw(s => ({ ...s, next: !s.next }))}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600">
                    <EyeIcon open={showPw.next} />
                  </button>
                </div>
                {pw.password.length > 0 && pw.password.length < 8 && (
                  <p className="text-[11px] text-amber-500 mt-1">
                    {t('At least 8 characters required','8文字以上必要です','কমপক্ষে ৮ অক্ষর প্রয়োজন')}
                  </p>
                )}
              </div>
            </div>

            {/* Confirm — full width */}
            <div>
              <label className={lbl}>{t('Confirm New Password','パスワード確認','পাসওয়ার্ড নিশ্চিত করুন')}</label>
              <div className="relative">
                <input type={showPw.confirm ? 'text' : 'password'}
                  className={`${inp} pr-10 ${
                    pw.password_confirmation && pw.password !== pw.password_confirmation
                      ? 'border-rose-300 focus:ring-rose-400/40'
                      : pw.password_confirmation && pw.password === pw.password_confirmation
                      ? 'border-emerald-300 focus:ring-emerald-400/40'
                      : ''
                  }`}
                  placeholder="••••••••"
                  value={pw.password_confirmation}
                  onChange={e => setPw(p => ({ ...p, password_confirmation: e.target.value }))} required />
                <button type="button" onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600">
                  <EyeIcon open={showPw.confirm} />
                </button>
              </div>
              {pw.password_confirmation && pw.password !== pw.password_confirmation && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {t('Passwords do not match','パスワードが一致しません','পাসওয়ার্ড মিলছে না')}
                </p>
              )}
              {pw.password_confirmation && pw.password === pw.password_confirmation && pw.password.length >= 8 && (
                <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  {t('Passwords match','パスワードが一致しています','পাসওয়ার্ড মিলেছে')}
                </p>
              )}
            </div>

            {/* Strength bar */}
            {pw.password.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= strengthClamped ? strengthColor : 'bg-slate-200'}`} />
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">
                  {t('Password strength','パスワード強度','পাসওয়ার্ড শক্তি')}: <span className="font-semibold text-slate-600">{strengthLabel}</span>
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button type="submit" disabled={savePassword.isPending || !pwValid}
                className="min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-40 shadow-sm">
                {savePassword.isPending ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('Updating…','更新中…','আপডেট হচ্ছে…')}</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{t('Update Password','パスワードを変更','পাসওয়ার্ড আপডেট করুন')}</>
                )}
              </button>
              <button type="button" onClick={() => { setPw({ current_password: '', password: '', password_confirmation: '' }); setPwErr(''); }}
                className="min-h-[44px] px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                {t('Cancel','キャンセル','বাতিল')}
              </button>
            </div>
          </form>
        </div>
      </section>

    </StudentLayout>
  );
}
