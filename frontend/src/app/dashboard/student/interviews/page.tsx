'use client';
import StudentLayout from '@/components/shared/StudentLayout';
import { useLang } from '@/context/LanguageContext';
import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { STATUS_COLORS, MEDIUM_LABEL } from '@/lib/constants';

interface Interview {
  id: number;
  status: string;
  medium: string;
  scheduled_at: string | null;
  meeting_link: string | null;
  lead: { lead_code: string };
  institution: { name: string };
}


export default function StudentInterviews() {
  const { t } = useLang();
  const si = t.studentInterviews;
  const statuses = t.statuses;

  const { data, isLoading } = useQuery({
    queryKey: ['student-interviews'],
    queryFn: () => api.get('/student/interviews').then((r) => r.data),
    staleTime: 30_000,
  });

  const interviews: Interview[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

  // Soonest / most relevant first — undated ones (still being arranged) sink to the bottom.
  const sorted = [...interviews].sort((a, b) => {
    if (!a.scheduled_at && !b.scheduled_at) return 0;
    if (!a.scheduled_at) return 1;
    if (!b.scheduled_at) return -1;
    return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
  });

  return (
    <StudentLayout title={si.title}>
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <span className="w-7 h-7 border-2 border-slate-200 border-t-green-600 rounded-full animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 sm:p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h2 className="font-bold text-lg text-slate-800">{si.emptyTitle}</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">{si.emptyDesc}</p>
          <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 px-3.5 py-2 rounded-full">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {si.emptyNotice}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((iv) => (
            <div key={iv.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-900 truncate">
                    {iv.institution?.name ?? 'Institution'}
                  </p>
                  <p className="font-mono text-[11px] text-slate-400 mt-0.5">{iv.lead?.lead_code}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${STATUS_COLORS[iv.status] ?? 'bg-slate-100 text-slate-600'}`}>
                  {statuses[iv.status as keyof typeof statuses] ?? iv.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {MEDIUM_LABEL[iv.medium] ?? iv.medium}
                </span>
                {iv.scheduled_at && (
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(iv.scheduled_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                )}
              </div>

              {iv.meeting_link && (
                <a href={iv.meeting_link} target="_blank" rel="noreferrer"
                  className="mt-4 inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  {si.joinMeeting}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  );
}
