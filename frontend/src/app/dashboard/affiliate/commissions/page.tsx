'use client';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { useLang } from '@/context/LanguageContext';
import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface Commission {
  id: number;
  type: string;
  amount: string;
  currency: string;
  percent: string | null;
  status: string;
  due_at: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  lead?: { lead_code: string; student?: { name: string } } | null;
  application?: { form_template?: { name: string; country: string } | null; user?: { name: string } | null } | null;
}

interface Summary {
  total: string;
  count: number;
}

interface ServiceEarning {
  form_template_id: number;
  service_name: string;
  country: string;
  visa_type: string;
  referred_count: number;
  converted_count: number;
  pending_count: number;
  commission_per_app: number;
  currency: string;
  earned_total: number;
  pending_total: number;
}

const STATUS_COLOR: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700',
  due:      'bg-blue-100 text-blue-700',
  paid:     'bg-emerald-100 text-emerald-700',
  disputed: 'bg-red-100 text-red-600',
  waived:   'bg-slate-100 text-slate-500',
};

const STATUS_LABEL: Record<string, { en: string; ja: string; bn: string }> = {
  pending:  { en: 'Pending',  ja: '保留中',    bn: 'পেন্ডিং' },
  due:      { en: 'Due',      ja: '支払い待ち', bn: 'বাকি' },
  paid:     { en: 'Paid',     ja: '支払い済み', bn: 'পরিশোধিত' },
  disputed: { en: 'Disputed', ja: '異議あり',   bn: 'বিতর্কিত' },
  waived:   { en: 'Waived',   ja: '免除',       bn: 'মওকুফ' },
};

export default function CommissionsPage() {
  const { lang } = useLang();
  const ja = lang === 'ja'; const bn = lang === 'bn';
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['affiliate-commissions', statusFilter],
    queryFn: () => api.get(`/affiliate/commissions${statusFilter ? `?status=${statusFilter}` : ''}`).then(r => r.data),
  });

  const { data: serviceData, isLoading: serviceLoading } = useQuery({
    queryKey: ['affiliate-service-earnings'],
    queryFn: () => api.get('/affiliate/service-earnings').then(r => r.data),
    staleTime: 60_000,
  });

  const commissions: Commission[] = Array.isArray(data?.commissions?.data) ? data.commissions.data : [];
  const summary: Record<string, Summary> = data?.summary ?? {};
  const serviceEarnings: ServiceEarning[] = serviceData?.data ?? [];

  const totalEarned = Object.values(summary).reduce((s, v) => s + parseFloat(v.total ?? '0'), 0);
  const paidAmount  = parseFloat(summary.paid?.total ?? '0');
  const pendingAmt  = parseFloat(summary.pending?.total ?? '0') + parseFloat(summary.due?.total ?? '0');

  return (
    <DashboardLayout title={ja ? '収益・コミッション' : bn ? 'কমিশন ও আয়' : 'Commissions & Earnings'}>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
          <div className="text-xl font-black text-purple-700">৳{Number(totalEarned).toLocaleString()}</div>
          <div className="text-xs font-medium text-purple-600 mt-0.5">{ja ? '合計収益' : bn ? 'মোট আয়' : 'Total Earned'}</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
          <div className="text-xl font-black text-emerald-700">৳{Number(paidAmount).toLocaleString()}</div>
          <div className="text-xs font-medium text-emerald-600 mt-0.5">{ja ? '支払い済み' : bn ? 'পরিশোধিত' : 'Paid Out'}</div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <div className="text-xl font-black text-amber-700">৳{Number(pendingAmt).toLocaleString()}</div>
          <div className="text-xs font-medium text-amber-600 mt-0.5">{ja ? '支払い待ち' : bn ? 'বাকি' : 'Pending'}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { value: '',         label: ja ? 'すべて' : bn ? 'সব' : 'All' },
          { value: 'pending',  label: ja ? '保留中' : bn ? 'পেন্ডিং' : 'Pending' },
          { value: 'due',      label: ja ? '支払い待ち' : bn ? 'বাকি' : 'Due' },
          { value: 'paid',     label: ja ? '支払い済み' : bn ? 'পরিশোধিত' : 'Paid' },
          { value: 'disputed', label: ja ? '異議あり' : bn ? 'বিতর্কিত' : 'Disputed' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              statusFilter === f.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-100">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm">
            {ja ? '収益の詳細' : bn ? 'আয়ের বিস্তারিত' : 'Earnings Detail'}
          </h2>
          {commissions.length > 0 && (
            <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full">{data?.commissions?.total ?? commissions.length}</span>
          )}
        </div>

        <div className="p-5">
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : commissions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-3xl mb-2">💳</div>
              <p className="font-medium text-slate-600 mb-1">
                {ja ? '収益はまだありません' : bn ? 'এখনো কোনো আয় নেই' : 'No earnings yet'}
              </p>
              <p className="text-xs text-slate-400">
                {ja ? '紹介や機関登録を通じて収益が発生します。' : bn ? 'রেফারেল বা প্রতিষ্ঠান নিবন্ধনের মাধ্যমে আয় হবে।' : 'Earnings appear when referrals or enrollments are confirmed.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {commissions.map(c => (
                <div key={c.id} className="flex flex-wrap items-start gap-3 py-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${c.status === 'paid' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                    {c.status === 'paid' ? '✓' : '⏳'}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-slate-900">
                        ৳{Number(c.amount).toLocaleString()} {c.currency !== 'BDT' ? c.currency : ''}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[c.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {STATUS_LABEL[c.status]?.[lang as 'en'|'ja'|'bn'] ?? c.status}
                      </span>
                      {c.percent && (
                        <span className="text-xs text-slate-400">{c.percent}%</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {c.type.replace(/_/g, ' ')}
                      {c.lead?.lead_code ? ` · ${c.lead.lead_code}` : ''}
                      {c.lead?.student?.name ? ` · ${c.lead.student.name}` : ''}
                      {c.application?.form_template?.name ? ` · ${c.application.form_template.name}` : ''}
                      {c.application?.user?.name ? ` · ${c.application.user.name}` : ''}
                    </p>
                    {c.notes && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">📝 {c.notes}</p>}
                  </div>

                  {/* Dates */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString()}</p>
                    {c.paid_at && (
                      <p className="text-xs text-emerald-600 font-medium mt-0.5">
                        {ja ? '支払い: ' : bn ? 'পরিশোধ: ' : 'Paid: '}{new Date(c.paid_at).toLocaleDateString()}
                      </p>
                    )}
                    {c.due_at && !c.paid_at && (
                      <p className="text-xs text-amber-600 mt-0.5">
                        {ja ? '期限: ' : bn ? 'ডিউ: ' : 'Due: '}{new Date(c.due_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Per-service breakdown */}
      <div className="bg-white rounded-2xl border border-slate-100 mt-5">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-sm">
            {ja ? 'サービス別の収益内訳' : bn ? 'সার্ভিস অনুযায়ী আয়ের বিস্তারিত' : 'Earnings by Service'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {ja ? 'あなたの紹介リンクから提出された申請ごとの内訳です。' : bn ? 'আপনার লিংক থেকে জমা হওয়া প্রতিটি আবেদনের ব্রেকডাউন।' : 'Broken down by every application submitted through your referral link.'}
          </p>
          <p className="text-xs text-amber-600 mt-1">
            {ja ? '⚠ 予測額です。上記の合計収益には含まれておらず、まだ支払い可能な額ではありません。' : bn ? '⚠ এগুলো আনুমানিক পরিমাণ — উপরের মোট আয়ের মধ্যে অন্তর্ভুক্ত নয় এবং এখনও পরিশোধযোগ্য নয়।' : "⚠ Projected amounts — not included in Total Earned above and not yet a payable commission."}
          </p>
        </div>
        <div className="p-5">
          {serviceLoading ? (
            <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : serviceEarnings.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm text-slate-500">
                {ja ? 'まだ紹介された申請はありません。' : bn ? 'এখনো কোনো রেফার করা আবেদন নেই।' : 'No referred applications yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                    <th className="pb-2 pr-3">{ja ? 'サービス' : bn ? 'সার্ভিস' : 'Service'}</th>
                    <th className="pb-2 pr-3 text-center">{ja ? '紹介数' : bn ? 'রেফার' : 'Referred'}</th>
                    <th className="pb-2 pr-3 text-center">{ja ? '成約' : bn ? 'কনভার্টেড' : 'Converted'}</th>
                    <th className="pb-2 pr-3 text-right">{ja ? '見込み収益' : bn ? 'আনুমানিক আয়' : 'Est. Earnings'}</th>
                    <th className="pb-2 text-right">{ja ? '見込み保留中' : bn ? 'আনুমানিক বাকি' : 'Est. Pending'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {serviceEarnings.map(s => (
                    <tr key={s.form_template_id}>
                      <td className="py-3 pr-3">
                        <p className="font-semibold text-slate-800">{s.service_name}</p>
                        <p className="text-xs text-slate-400">{s.country} · {s.visa_type}</p>
                      </td>
                      <td className="py-3 pr-3 text-center font-semibold text-slate-600">{s.referred_count}</td>
                      <td className="py-3 pr-3 text-center font-semibold text-emerald-600">{s.converted_count}</td>
                      <td className="py-3 pr-3 text-right font-bold text-emerald-700">
                        {s.currency} {Number(s.earned_total).toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-semibold text-amber-600">
                        {s.currency} {Number(s.pending_total).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Note */}
      <div className="mt-4 bg-slate-50 border border-slate-100 rounded-2xl p-4">
        <p className="text-xs text-slate-500">
          💡 {ja
            ? 'コミッションの支払いは毎月末に処理されます。支払い詳細についてはプロフィールページで確認してください。'
            : bn
            ? 'কমিশন পেমেন্ট প্রতি মাসের শেষে প্রক্রিয়া করা হয়। পেমেন্ট পেতে প্রোফাইলে ব্যাংক/মোবাইল ব্যাংকিং তথ্য যোগ করুন।'
            : 'Commission payouts are processed at the end of each month. Ensure your payout details are added in Profile Settings.'}
        </p>
      </div>
    </DashboardLayout>
  );
}
