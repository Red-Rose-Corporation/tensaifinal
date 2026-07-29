'use client';
import DashboardLayout from '@/components/shared/DashboardLayout';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useLang } from '@/context/LanguageContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ManagedEntity {
  id: number;
  entity_type: 'institution' | 'employee';
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  country: string | null;
  status: 'active' | 'inactive' | 'suspended';
  commission_percent: number | string | null;
}

interface AffiliateUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  affiliate_code: string;
  status: 'pending' | 'active' | 'suspended';
  created_at: string;
  profile: {
    affiliate_type: 'local' | 'global' | null;
    type_confirmed: boolean;
    performance_level: string | null;
    country: string | null;
    organization_name: string | null;
    total_earned: number;
    pending_payout: number;
    bank_name: string | null;
    bank_account_number: string | null;
    bkash_number: string | null;
    local_commission_fixed: number | string | null;
    global_commission_percent: number | string | null;
    managed_entities?: ManagedEntity[];
  } | null;
  commissions: {
    id: number;
    amount: string;
    status: 'pending' | 'due' | 'paid' | 'waived';
    type: string;
    created_at: string;
    paid_at: string | null;
  }[];
  total_referrals: number;
}

const STATUS_COLORS: Record<string, string> = {
  active:    'bg-emerald-100 text-emerald-700',
  pending:   'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
};

const COMM_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  due:     'bg-blue-100 text-blue-700',
  paid:    'bg-emerald-100 text-emerald-700',
  waived:  'bg-slate-100 text-slate-500',
};

const TYPE_BADGE: Record<string, string> = {
  local:  'bg-indigo-100 text-indigo-700',
  global: 'bg-amber-100 text-amber-700',
};

export default function AdminAffiliatesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const { lang } = useLang();
  const ja = lang === 'ja'; const bn = lang === 'bn';

  const isAdmin = user?.roles?.some(r => r === 'admin' || r === 'super_admin');
  useEffect(() => {
    if (user && !isAdmin) router.replace('/dashboard');
  }, [user, isAdmin, router]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [actionOk, setActionOk] = useState('');
  const [actionErr, setActionErr] = useState('');
  const [rateDraft, setRateDraft] = useState<Record<number, { local: string; global: string }>>({});

  const { data, isLoading } = useQuery<AffiliateUser[] | { data: AffiliateUser[] }>({
    queryKey: ['admin-affiliates'],
    queryFn: () => api.get('/admin/affiliates').then(r => r.data),
    enabled: !!isAdmin,
    staleTime: 30_000,
  });

  const affiliates: AffiliateUser[] = Array.isArray(data) ? data : (data as { data: AffiliateUser[] })?.data ?? [];

  const filtered = affiliates.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (typeFilter !== 'all' && a.profile?.affiliate_type !== typeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return a.name.toLowerCase().includes(s) || a.email.toLowerCase().includes(s);
    }
    return true;
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/admin/affiliates/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-affiliates'] });
      setActionOk(ja ? '更新しました' : bn ? 'আপডেট হয়েছে' : 'Updated');
      setTimeout(() => setActionOk(''), 3000);
    },
    onError: () => setActionErr(ja ? '操作に失敗しました。' : bn ? 'ব্যর্থ হয়েছে।' : 'Action failed.'),
  });

  const markPaid = useMutation({
    mutationFn: ({ affiliateId, commissionId }: { affiliateId: number; commissionId: number }) =>
      api.patch(`/admin/affiliates/${affiliateId}/commissions/${commissionId}/mark-paid`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-affiliates'] });
      setActionOk(ja ? '支払い済みにしました' : bn ? 'পেইড করা হয়েছে' : 'Marked as paid');
      setTimeout(() => setActionOk(''), 3000);
    },
    onError: () => setActionErr(ja ? '操作に失敗しました。' : bn ? 'ব্যর্থ হয়েছে।' : 'Action failed.'),
  });

  const markAllDue = useMutation({
    mutationFn: (affiliateId: number) =>
      api.patch(`/admin/affiliates/${affiliateId}/commissions/mark-all-paid`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-affiliates'] });
      setActionOk(ja ? 'すべて支払い済みにしました' : bn ? 'সব পেইড করা হয়েছে' : 'All marked as paid');
      setTimeout(() => setActionOk(''), 3000);
    },
    onError: () => setActionErr(ja ? '操作に失敗しました。' : bn ? 'ব্যর্থ হয়েছে।' : 'Action failed.'),
  });

  const updateRates = useMutation({
    mutationFn: ({ id, local_commission_fixed, global_commission_percent }: { id: number; local_commission_fixed?: number; global_commission_percent?: number }) =>
      api.patch(`/admin/affiliates/${id}/rates`, { local_commission_fixed, global_commission_percent }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-affiliates'] });
      setActionOk(ja ? '料金を更新しました' : bn ? 'রেট আপডেট হয়েছে' : 'Rate updated');
      setTimeout(() => setActionOk(''), 3000);
    },
    onError: () => setActionErr(ja ? '操作に失敗しました。' : bn ? 'ব্যর্থ হয়েছে।' : 'Action failed.'),
  });

  const updateEntityStatus = useMutation({
    mutationFn: ({ affiliateId, entityId, status }: { affiliateId: number; entityId: number; status: string }) =>
      api.patch(`/admin/affiliates/${affiliateId}/entities/${entityId}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-affiliates'] });
      setActionOk(ja ? '更新しました' : bn ? 'আপডেট হয়েছে' : 'Updated');
      setTimeout(() => setActionOk(''), 3000);
    },
    onError: () => setActionErr(ja ? '操作に失敗しました。' : bn ? 'ব্যর্থ হয়েছে।' : 'Action failed.'),
  });

  if (!user || !isAdmin) return null;

  const title = ja ? 'アフィリエイト管理' : bn ? 'অ্যাফিলিয়েট ম্যানেজমেন্ট' : 'Affiliate Management';

  return (
    <DashboardLayout title={title}>

      {/* Search + filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 space-y-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={ja ? '名前またはメールで検索...' : bn ? 'নাম বা ইমেইল খুঁজুন...' : 'Search by name or email...'}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
        />
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'pending', 'suspended'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s ? 'bg-green-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {s === 'all' ? (ja ? 'すべて' : bn ? 'সব' : 'All') : s}
            </button>
          ))}
          <div className="w-px bg-slate-200 mx-1" />
          {[
            { k: 'all',    label: ja ? '全種別' : bn ? 'সব ধরন' : 'All Types' },
            { k: 'local',  label: ja ? 'スチューデント' : bn ? 'স্টুডেন্ট' : 'Student' },
            { k: 'global', label: ja ? '機関' : bn ? 'ইনস্টিটিউশনস' : 'Institutions' },
          ].map(({ k, label }) => (
            <button key={k} onClick={() => setTypeFilter(k)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                typeFilter === k ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-slate-500 mb-3 px-1">
        {filtered.length} {ja ? '件' : bn ? 'জন' : `affiliate${filtered.length !== 1 ? 's' : ''}`}
      </div>

      {(actionOk || actionErr) && (
        <div className={`mb-3 p-3 rounded-xl text-xs font-semibold ${actionOk ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
          {actionOk ? `✓ ${actionOk}` : `⚠️ ${actionErr}`}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          {ja ? '読み込み中...' : bn ? 'লোড হচ্ছে...' : 'Loading...'}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          {ja ? 'アフィリエイトが見つかりません。' : bn ? 'কোনো অ্যাফিলিয়েট পাওয়া যায়নি।' : 'No affiliates found.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(aff => {
            const isOpen = expanded === aff.id;
            const affType = aff.profile?.affiliate_type;
            const pendingComms = aff.commissions?.filter(c => c.status === 'pending' || c.status === 'due') ?? [];
            const totalPending = pendingComms.reduce((s, c) => s + parseFloat(c.amount), 0);

            return (
              <div key={aff.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Row */}
                <div
                  className="flex flex-wrap items-center gap-3 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : aff.id)}
                >
                  <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold shrink-0">
                    {aff.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">{aff.name}</span>
                      {affType && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_BADGE[affType]}`}>
                          {affType === 'local' ? (ja ? 'スチューデント' : bn ? 'স্টুডেন্ট' : 'Student') : (ja ? '機関' : bn ? 'ইনস্টিটিউশনস' : 'Institutions')}
                        </span>
                      )}
                      {aff.profile?.performance_level && (
                        <span className="text-[10px] font-semibold text-slate-500 capitalize">
                          {aff.profile.performance_level}
                        </span>
                      )}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[aff.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {aff.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 truncate">
                      {aff.email}
                      {aff.profile?.country && ` · ${aff.profile.country}`}
                      {aff.profile?.organization_name && ` · ${aff.profile.organization_name}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0">
                    <div className="text-center hidden sm:block">
                      <div className="font-bold text-slate-700">{aff.total_referrals ?? 0}</div>
                      <div>{ja ? '紹介数' : bn ? 'রেফারেল' : 'Referrals'}</div>
                    </div>
                    <div className="text-center hidden sm:block">
                      <div className={`font-bold ${totalPending > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                        {totalPending > 0 ? `৳${totalPending.toLocaleString()}` : '—'}
                      </div>
                      <div>{ja ? '未払い' : bn ? 'বাকি' : 'Pending'}</div>
                    </div>
                    <span className="text-slate-300">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50">

                    {/* Profile details */}
                    <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border-b border-slate-100">
                      {[
                        { label: ja ? 'メール' : bn ? 'ইমেইল' : 'Email', value: aff.email },
                        { label: ja ? '電話' : bn ? 'ফোন' : 'Phone', value: aff.phone },
                        { label: ja ? '紹介コード' : bn ? 'রেফারেল কোড' : 'Ref Code', value: aff.affiliate_code },
                        { label: ja ? '銀行' : bn ? 'ব্যাংক' : 'Bank', value: aff.profile?.bank_name ? `${aff.profile.bank_name} ···${(aff.profile.bank_account_number ?? '').slice(-4)}` : null },
                        { label: 'bKash', value: aff.profile?.bkash_number },
                        { label: ja ? '総収益' : bn ? 'মোট আয়' : 'Total Earned', value: aff.profile?.total_earned ? `৳${Number(aff.profile.total_earned).toLocaleString()}` : '৳0' },
                        { label: ja ? '登録日' : bn ? 'যোগদান' : 'Joined', value: new Date(aff.created_at).toLocaleDateString() },
                      ].map(row => row.value ? (
                        <div key={row.label}>
                          <div className="text-slate-400 font-medium mb-0.5">{row.label}</div>
                          <div className="text-slate-700 font-semibold truncate">{row.value}</div>
                        </div>
                      ) : null)}
                    </div>

                    {/* Commission rate */}
                    <div className="px-5 py-4 border-b border-slate-100">
                      <div className="text-xs font-semibold text-slate-500 mb-2">
                        {ja ? 'コミッション率' : bn ? 'কমিশন রেট' : 'Commission Rate'}
                      </div>
                      <div className="flex flex-wrap items-end gap-3">
                        {affType !== 'global' && (
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">
                              {ja ? '固定額 (BDT)' : bn ? 'ফিক্সড পরিমাণ (BDT)' : 'Fixed amount (BDT) per enrolled student'}
                            </label>
                            <input
                              type="number" min="0"
                              value={rateDraft[aff.id]?.local ?? String(aff.profile?.local_commission_fixed ?? '')}
                              onChange={e => setRateDraft(p => ({ ...p, [aff.id]: { local: e.target.value, global: p[aff.id]?.global ?? String(aff.profile?.global_commission_percent ?? '') } }))}
                              className="w-36 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-300"
                            />
                          </div>
                        )}
                        {affType === 'global' && (
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">
                              {ja ? '割合 (%) — 成約ごと' : bn ? 'শতাংশ (%) — প্রতি enrollment' : 'Percent (%) per enrollment'}
                            </label>
                            <input
                              type="number" min="0" max="100"
                              value={rateDraft[aff.id]?.global ?? String(aff.profile?.global_commission_percent ?? '')}
                              onChange={e => setRateDraft(p => ({ ...p, [aff.id]: { global: e.target.value, local: p[aff.id]?.local ?? String(aff.profile?.local_commission_fixed ?? '') } }))}
                              className="w-28 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-300"
                            />
                          </div>
                        )}
                        <button
                          onClick={() => {
                            const draft = rateDraft[aff.id];
                            updateRates.mutate({
                              id: aff.id,
                              local_commission_fixed: Number(draft?.local ?? aff.profile?.local_commission_fixed ?? 0),
                              global_commission_percent: Number(draft?.global ?? aff.profile?.global_commission_percent ?? 0),
                            });
                          }}
                          disabled={updateRates.isPending}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors disabled:opacity-50"
                        >
                          {ja ? '保存' : bn ? 'সেভ করুন' : 'Save rate'}
                        </button>
                      </div>
                    </div>

                    {/* Account actions */}
                    <div className="px-5 py-3 flex flex-wrap gap-2 border-b border-slate-100">
                      {aff.status !== 'active' && (
                        <button
                          onClick={() => updateStatus.mutate({ id: aff.id, status: 'active' })}
                          disabled={updateStatus.isPending}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors disabled:opacity-50"
                        >
                          {ja ? 'アクティブにする' : bn ? 'সক্রিয় করুন' : 'Activate'}
                        </button>
                      )}
                      {aff.status !== 'suspended' && (
                        <button
                          onClick={() => {
                            if (!window.confirm(ja ? `「${aff.name}」を停止しますか？` : bn ? `"${aff.name}" সাসপেন্ড করবেন?` : `Suspend "${aff.name}"?`)) return;
                            updateStatus.mutate({ id: aff.id, status: 'suspended' });
                          }}
                          disabled={updateStatus.isPending}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          {ja ? '停止する' : bn ? 'সাসপেন্ড করুন' : 'Suspend'}
                        </button>
                      )}
                      {pendingComms.length > 0 && (
                        <button
                          onClick={() => {
                            if (!window.confirm(ja ? `৳${totalPending.toLocaleString()} を全額支払い済みにしますか？` : bn ? `৳${totalPending.toLocaleString()} সব পেইড মার্ক করবেন?` : `Mark all ৳${totalPending.toLocaleString()} as paid?`)) return;
                            markAllDue.mutate(aff.id);
                          }}
                          disabled={markAllDue.isPending}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50"
                        >
                          {ja ? `৳${totalPending.toLocaleString()} を全額支払済にする` : bn ? `৳${totalPending.toLocaleString()} সব পেইড করুন` : `Mark all ৳${totalPending.toLocaleString()} paid`}
                        </button>
                      )}
                    </div>

                    {/* Managed institutions / employees (Global affiliates only) */}
                    {affType === 'global' && (
                      <div className="px-5 py-3 border-b border-slate-100">
                        <div className="text-xs font-semibold text-slate-500 mb-2">
                          {ja ? '管理エンティティ' : bn ? 'ম্যানেজড এনটিটি' : 'Managed Institutions & Employees'}
                          {(aff.profile?.managed_entities?.length ?? 0) > 0 && (
                            <span className="ml-1 text-slate-400">({aff.profile?.managed_entities?.length})</span>
                          )}
                        </div>
                        {!aff.profile?.managed_entities?.length ? (
                          <p className="text-xs text-slate-400 italic">
                            {ja ? 'エンティティなし' : bn ? 'কোনো এনটিটি নেই' : 'None declared yet'}
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {aff.profile.managed_entities.map(ent => (
                              <div key={ent.id} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-slate-100">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-sm text-slate-800">{ent.name}</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">{ent.entity_type}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      ent.status === 'active' ? 'bg-emerald-100 text-emerald-700' : ent.status === 'suspended' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                      {ent.status}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-400 mt-0.5 truncate">
                                    {ent.country ?? '—'}
                                    {ent.contact_email && ` · ${ent.contact_email}`}
                                    {ent.commission_percent != null && ` · ${ent.commission_percent}%`}
                                  </div>
                                </div>
                                <div className="flex gap-1.5 shrink-0">
                                  {ent.status !== 'active' && (
                                    <button
                                      onClick={() => updateEntityStatus.mutate({ affiliateId: aff.id, entityId: ent.id, status: 'active' })}
                                      disabled={updateEntityStatus.isPending}
                                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors disabled:opacity-50"
                                    >
                                      {ja ? '有効化' : bn ? 'সক্রিয়' : 'Activate'}
                                    </button>
                                  )}
                                  {ent.status !== 'suspended' && (
                                    <button
                                      onClick={() => {
                                        if (!window.confirm(ja ? `「${ent.name}」を停止しますか？` : bn ? `"${ent.name}" সাসপেন্ড করবেন?` : `Suspend "${ent.name}"?`)) return;
                                        updateEntityStatus.mutate({ affiliateId: aff.id, entityId: ent.id, status: 'suspended' });
                                      }}
                                      disabled={updateEntityStatus.isPending}
                                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                                    >
                                      {ja ? '停止' : bn ? 'সাসপেন্ড' : 'Suspend'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Commissions list */}
                    <div className="px-5 py-3">
                      <div className="text-xs font-semibold text-slate-500 mb-2">
                        {ja ? 'コミッション履歴' : bn ? 'কমিশন ইতিহাস' : 'Commission History'}
                        {aff.commissions?.length > 0 && (
                          <span className="ml-1 text-slate-400">({aff.commissions.length})</span>
                        )}
                      </div>
                      {!aff.commissions?.length ? (
                        <p className="text-xs text-slate-400 italic">
                          {ja ? 'コミッションなし' : bn ? 'কোনো কমিশন নেই' : 'No commissions yet'}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {aff.commissions.map(c => (
                            <div key={c.id} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-slate-100">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm text-slate-800">৳{Number(c.amount).toLocaleString()}</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${COMM_STATUS_COLORS[c.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                    {c.status}
                                  </span>
                                  <span className="text-xs text-slate-400 capitalize">{c.type.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="text-xs text-slate-400 mt-0.5">
                                  {new Date(c.created_at).toLocaleDateString()}
                                  {c.paid_at && ` · ${ja ? '支払い: ' : bn ? 'পেইড: ' : 'Paid: '}${new Date(c.paid_at).toLocaleDateString()}`}
                                </div>
                              </div>
                              {(c.status === 'pending' || c.status === 'due') && (
                                <button
                                  onClick={() => markPaid.mutate({ affiliateId: aff.id, commissionId: c.id })}
                                  disabled={markPaid.isPending}
                                  className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors disabled:opacity-50"
                                >
                                  {ja ? '支払済' : bn ? 'পেইড' : 'Mark paid'}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
