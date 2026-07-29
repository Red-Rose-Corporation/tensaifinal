'use client';
import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Application, FormTemplateData, isFieldVisible, colSpan, inp, lbl, invalidInp, EDU_LABELS, FieldIcon } from './ApplicationFormShared';

interface ListTemplate { id: number; name: string; country: string; visa_type?: string; }

interface Props {
  role?: string;
  onCreated: (app: Application) => void;
  onCancel?: () => void;
  queryKey: string;
}

// ── Section header theme (keeps the four sections visually distinct while scanning) ──
const THEME = {
  green:  { card: 'bg-green-50/50 border-green-100', head: 'bg-green-100/50 border-green-100', bar: 'bg-green-600',  icon: 'text-green-600' },
  sky:    { card: 'bg-white border-slate-200',        head: 'bg-sky-50 border-slate-200',       bar: 'bg-sky-500',    icon: 'text-sky-600' },
  violet: { card: 'bg-white border-slate-200',        head: 'bg-violet-50 border-slate-200',     bar: 'bg-violet-500', icon: 'text-violet-600' },
  amber:  { card: 'bg-white border-slate-200',        head: 'bg-amber-50 border-slate-200',      bar: 'bg-amber-500',  icon: 'text-amber-600' },
} as const;

function SectionHeader({ theme, icon, title, hint }: { theme: keyof typeof THEME; icon: React.ReactNode; title: string; hint?: string }) {
  const t = THEME[theme];
  return (
    <div className={`flex items-center gap-3 px-5 py-3.5 border-b ${t.head}`}>
      <span className={`w-0.5 h-4 rounded-full shrink-0 ${t.bar}`} />
      <span className={`shrink-0 ${t.icon}`}>{icon}</span>
      <span className="text-sm font-semibold text-slate-800">{title}</span>
      {hint && <span className="text-xs text-slate-400 hidden sm:inline">{hint}</span>}
    </div>
  );
}

export default function ApplicationStarter({ onCreated, onCancel, queryKey }: Props) {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [studentInfo, setStudentInfo] = useState({ student_name: '', student_email: '', student_phone: '', whatsapp_no: '', permanent_address: '' });
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [openEdu, setOpenEdu] = useState<Record<string, boolean>>({});
  const [err, setErr] = useState('');
  const [attempted, setAttempted] = useState(false);

  const [countryQuery, setCountryQuery] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const countryWrapRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  function set(k: string, v: string) { setFormData(p => ({ ...p, [k]: v })); }
  function si(k: keyof typeof studentInfo, v: string) { setStudentInfo(p => ({ ...p, [k]: v })); setErr(''); }

  const { data: templates = [], isLoading: loadingTemplates, isError: templatesError, refetch: retryTemplates } = useQuery<ListTemplate[]>({
    queryKey: ['form-templates-list'],
    queryFn: () => api.get('/form-templates').then(r => r.data),
    staleTime: 60_000,
  });

  const { data: template, isLoading: loadingTemplate } = useQuery<FormTemplateData | null>({
    queryKey: ['starter-template', selectedId],
    queryFn: () => api.get(`/form-templates/${selectedId}`).then(r => r.data),
    enabled: !!selectedId,
    staleTime: 300_000,
  });

  const selectedTemplate = templates.find(t => t.id === selectedId) ?? null;
  const filteredTemplates = templates.filter(t => {
    const q = countryQuery.trim().toLowerCase();
    if (!q) return true;
    return `${t.country} ${t.name} ${t.visa_type ?? ''}`.toLowerCase().includes(q);
  });

  function selectTemplate(t: ListTemplate) {
    setSelectedId(t.id);
    setErr('');
    setAttempted(false);
    setCountryOpen(false);
    setCountryQuery('');
  }

  // Close the country dropdown on outside click (mousedown, not blur, so option clicks still register)
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (countryWrapRef.current && !countryWrapRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
        setCountryQuery('');
      }
    }
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  // Move focus straight into Full Name once a country form has finished loading
  useEffect(() => {
    if (template && !loadingTemplate) nameInputRef.current?.focus();
  }, [template, loadingTemplate]);

  function missingRequiredFieldLabels(): string[] {
    if (!template) return [];
    const missing: string[] = [];
    template.groups.forEach(g => g.boxes.forEach(b => b.fields.forEach(f => {
      if (f.field_type === 'file' || !f.is_required || !isFieldVisible(f, formData)) return;
      if (!(formData[f.field_key] ?? '').trim()) missing.push(f.label);
    })));
    return missing;
  }

  function validate() {
    if (!selectedId) { setErr('Please select a Country Form first.'); return false; }
    if (!studentInfo.student_name.trim()) { setErr('Full Name is required.'); return false; }
    if (!studentInfo.student_phone.trim()) { setErr('Contact Number is required.'); return false; }
    const missing = missingRequiredFieldLabels();
    if (missing.length > 0) {
      setErr(`Please fill required field${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`);
      return false;
    }
    return true;
  }

  const createMut = useMutation({
    mutationFn: () => api.post('/applications', {
      form_template_id: selectedId,
      student_name:      studentInfo.student_name      || null,
      student_email:     studentInfo.student_email.trim() || null,
      student_phone:     studentInfo.student_phone     || null,
      whatsapp_no:       studentInfo.whatsapp_no       || null,
      permanent_address: studentInfo.permanent_address || null,
      form_data:         formData,
    }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: [queryKey] });
      const app = res.data?.application ?? res.data;
      if (app?.id) {
        onCreated(app);
      } else {
        setErr('Application created but no ID returned. Please refresh and try again.');
      }
    },
    onError: (e: unknown) => {
      const ax = e as { response?: { data?: { message?: string } } };
      setErr(ax.response?.data?.message ?? 'Failed to create — please try again.');
    },
  });

  const visibleEdu = (template?.educations ?? []).filter(e => e.requirement !== 'none');
  const nameInvalid  = attempted && !studentInfo.student_name.trim();
  const phoneInvalid = attempted && !studentInfo.student_phone.trim();

  return (
    <div className="px-4 sm:px-6 py-5 space-y-4">

      {/* ── Country / Program selector ── */}
      <div className={`rounded-xl overflow-hidden shadow-sm border ${THEME.green.card}`}>
        <SectionHeader theme="green" title="Country & Program" icon={<FieldIcon name="flag" className="w-4 h-4" />} />
        <div className="px-5 py-4" ref={countryWrapRef}>
          <label className={lbl}>Select Destination <span className="text-rose-400">*</span></label>
          {templatesError ? (
            <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 mt-1">
              <FieldIcon name="alert" className="w-4 h-4 text-rose-400 shrink-0" strokeWidth={2} />
              <p className="text-xs font-semibold text-rose-700 flex-1">Could not load country forms — check your connection.</p>
              <button onClick={() => retryTemplates()} className="shrink-0 text-xs font-bold text-rose-600 hover:text-rose-800 underline underline-offset-2">Retry</button>
            </div>
          ) : !loadingTemplates && templates.length === 0 ? (
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-1">
              <FieldIcon name="alert" className="w-4 h-4 text-amber-500 shrink-0" strokeWidth={2} />
              <p className="text-xs font-semibold text-amber-700">No country forms available yet. Please contact your administrator.</p>
            </div>
          ) : (
            <div className="relative">
              <input
                className={inp}
                placeholder={loadingTemplates ? 'Loading country forms…' : 'Type to search country / visa type…'}
                disabled={loadingTemplates}
                value={countryOpen ? countryQuery : (selectedTemplate ? `${selectedTemplate.country} — ${selectedTemplate.name}${selectedTemplate.visa_type ? ` (${selectedTemplate.visa_type})` : ''}` : '')}
                onFocus={() => { setCountryOpen(true); setCountryQuery(''); }}
                onChange={e => { setCountryQuery(e.target.value); setCountryOpen(true); }}
                onKeyDown={e => { if (e.key === 'Escape') { setCountryOpen(false); setCountryQuery(''); } }}
              />
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <FieldIcon name="chevronDown" className={`w-4 h-4 text-slate-400 transition-transform ${countryOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
              </span>
              {countryOpen && (
                <div className="absolute z-20 mt-1.5 w-full max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg py-1">
                  {filteredTemplates.length === 0 ? (
                    <p className="px-4 py-3 text-xs text-slate-400">No match found.</p>
                  ) : filteredTemplates.map(t => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => selectTemplate(t)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 transition-colors flex items-center justify-between gap-2 min-h-[40px] ${t.id === selectedId ? 'bg-green-50 text-green-700 font-semibold' : 'text-slate-700'}`}
                    >
                      <span>{t.country} — {t.name}{t.visa_type ? ` (${t.visa_type})` : ''}</span>
                      {t.id === selectedId && <FieldIcon name="check" className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-slate-400 mt-2">After saving, you can fill in all remaining fields on the edit page.</p>
        </div>
      </div>

      {/* ── Loading skeleton ── */}
      {selectedId && loadingTemplate && (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map(i => <div key={i} className="bg-slate-100 rounded-xl h-20" />)}
          <div className="flex items-center gap-2 text-xs text-slate-400 justify-center py-2">
            <span className="w-3.5 h-3.5 border-2 border-slate-200 border-t-green-600 rounded-full animate-spin" />
            Loading form…
          </div>
        </div>
      )}

      {/* ── Personal Information ── */}
      {template && !loadingTemplate && (
        <div className={`rounded-xl overflow-hidden shadow-sm border ${THEME.sky.card}`}>
          <SectionHeader theme="sky" title="Personal Information" icon={<FieldIcon name="user" className="w-4 h-4" />} />
          <div className="px-5 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Full Name <span className="text-rose-400">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <FieldIcon name="user" className="w-4 h-4 text-slate-400" />
                  </span>
                  <input ref={nameInputRef} className={`${inp} pl-10 ${nameInvalid ? invalidInp : ''}`} placeholder="Student full name" aria-required="true"
                    value={studentInfo.student_name} onChange={e => si('student_name', e.target.value)} />
                </div>
              </div>
              <div>
                <label className={lbl}>Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <FieldIcon name="mail" className="w-4 h-4 text-slate-400" />
                  </span>
                  <input className={`${inp} pl-10`} type="text" placeholder="email@example.com"
                    value={studentInfo.student_email} onChange={e => si('student_email', e.target.value)} />
                </div>
              </div>
              <div>
                <label className={lbl}>Contact Number <span className="text-rose-400">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <FieldIcon name="phone" className="w-4 h-4 text-slate-400" />
                  </span>
                  <input className={`${inp} pl-10 ${phoneInvalid ? invalidInp : ''}`} type="tel" placeholder="+880..." aria-required="true"
                    value={studentInfo.student_phone} onChange={e => si('student_phone', e.target.value)} />
                </div>
              </div>
              <div>
                <label className={lbl}>WhatsApp Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <FieldIcon name="whatsapp" className="w-4 h-4 text-slate-400" />
                  </span>
                  <input className={`${inp} pl-10`} type="tel" placeholder="+880..."
                    value={studentInfo.whatsapp_no} onChange={e => si('whatsapp_no', e.target.value)} />
                </div>
              </div>
              <div>
                <label className={lbl}>Date of Birth</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <FieldIcon name="calendar" className="w-4 h-4 text-slate-400" />
                  </span>
                  <input className={`${inp} pl-10`} type="date"
                    value={formData.birth_date ?? ''} onChange={e => set('birth_date', e.target.value)} />
                </div>
              </div>
              <div>
                <label className={lbl}>Passport Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <FieldIcon name="passport" className="w-4 h-4 text-slate-400" />
                  </span>
                  <input className={`${inp} pl-10`} placeholder="e.g. AB1234567"
                    value={formData.passport_no ?? ''} onChange={e => set('passport_no', e.target.value)} />
                </div>
              </div>
              {template.intake_options?.length > 0 && (
                <div>
                  <label className={lbl}>Select Intake</label>
                  <select className={inp} value={formData.intake ?? ''} onChange={e => set('intake', e.target.value)}>
                    <option value="">Choose intake…</option>
                    {(template.intake_options ?? []).map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              )}
              <div className="sm:col-span-2">
                <label className={lbl}>Permanent Address</label>
                <textarea className={`${inp} resize-none`} rows={2} placeholder="House, Road, Area, City, Postcode"
                  value={studentInfo.permanent_address} onChange={e => si('permanent_address', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Dynamic template groups ── */}
      {template && !loadingTemplate && template.groups.filter(g => g.label !== 'Application Form Info').filter(g =>
        g.boxes.some(b => b.fields.some(f => isFieldVisible(f, formData) && f.field_type !== 'file'))
      ).map(group => (
        <div key={group.id} className={`rounded-xl overflow-hidden shadow-sm border ${THEME.violet.card}`}>
          <SectionHeader theme="violet" title={group.label} hint={group.hint} icon={<FieldIcon name="doc" className="w-4 h-4" />} />
          <div className="px-5 py-5 space-y-4">
            {group.boxes.map(box => {
              const visible = box.fields.filter(f => isFieldVisible(f, formData) && f.field_type !== 'file');
              if (visible.length === 0) return null;
              return (
                <div key={box.id}>
                  {box.name && <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">{box.name}</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {visible.map(field => {
                      const val = formData[field.field_key] ?? '';
                      const invalid = attempted && field.is_required && !val.trim();
                      return (
                        <div key={field.field_key} className={colSpan(field.box_size)}>
                          <label className={lbl}>
                            {field.label}{field.is_required && <span className="text-rose-400 ml-0.5">*</span>}
                          </label>
                          {field.field_type === 'select' ? (
                            <select className={`${inp} ${invalid ? invalidInp : ''}`} value={val} onChange={e => set(field.field_key, e.target.value)}>
                              <option value="">{field.placeholder || 'Select…'}</option>
                              {(field.options ?? []).map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : field.field_type === 'textarea' ? (
                            <textarea className={`${inp} resize-none ${invalid ? invalidInp : ''}`} rows={3} value={val}
                              placeholder={field.placeholder ?? ''} onChange={e => set(field.field_key, e.target.value)} />
                          ) : (
                            <input className={`${inp} ${invalid ? invalidInp : ''}`}
                              type={field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : field.field_type === 'email' ? 'email' : field.field_type === 'tel' ? 'tel' : 'text'}
                              value={val} placeholder={field.placeholder ?? ''}
                              onChange={e => set(field.field_key, e.target.value)} />
                          )}
                          {field.helper_text && <p className="text-xs text-slate-400 mt-1">{field.helper_text}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* ── Education Certificates ── */}
      {template && !loadingTemplate && visibleEdu.length > 0 && (
        <div className={`rounded-xl overflow-hidden shadow-sm border ${THEME.amber.card}`}>
          <SectionHeader theme="amber" title="Education Certificates" icon={<FieldIcon name="cap" className="w-4 h-4" />} />
          <div className="px-5 py-4 space-y-3">
            {visibleEdu.map((edu, i) => {
              const label     = EDU_LABELS[edu.level] ?? edu.level;
              const mandatory = edu.requirement === 'mandatory';
              const isOpen    = openEdu[edu.level] ?? (i === 0);
              const docKey    = `edu_${edu.level}`;
              return (
                <div key={edu.level} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenEdu(p => ({ ...p, [edu.level]: !(p[edu.level] ?? (i === 0)) }))}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-green-500/40"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-medium text-slate-800">{label}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mandatory ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                        {mandatory ? 'Required' : 'Optional'}
                      </span>
                    </div>
                    <FieldIcon name="chevronDown" className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100">
                      <div className="px-4 pt-4 pb-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className={lbl}>Institution / Board</label>
                          <input className={inp} placeholder="e.g. Dhaka Education Board"
                            value={formData[`${docKey}_institution`] ?? ''} onChange={e => set(`${docKey}_institution`, e.target.value)} />
                        </div>
                        <div>
                          <label className={lbl}>GPA / Grade</label>
                          <input className={inp} placeholder="e.g. 5.00 / A+"
                            value={formData[`${docKey}_gpa`] ?? ''} onChange={e => set(`${docKey}_gpa`, e.target.value)} />
                        </div>
                        <div>
                          <label className={lbl}>Passing Year</label>
                          <input className={inp} placeholder="e.g. 2022"
                            value={formData[`${docKey}_year`] ?? ''} onChange={e => set(`${docKey}_year`, e.target.value)} />
                        </div>
                      </div>
                      <div className="px-4 pb-4">
                        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <p className="text-xs text-slate-500">
                            <span className="font-semibold">Certificate uploads</span> are available after saving the application.
                            {mandatory && <span className="text-rose-600 font-semibold ml-1">This document is required before submitting.</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Action bar ── */}
      {template && !loadingTemplate && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-100">
          {err
            ? <p aria-live="assertive" className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                <FieldIcon name="alert" className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                {err}
              </p>
            : <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <FieldIcon name="alert" className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                After saving, you can fill in all remaining fields.
              </p>
          }
          <div className="flex items-center gap-2.5">
            {onCancel && (
              <button type="button" onClick={onCancel}
                className="flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/40">
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={() => { setAttempted(true); if (validate()) createMut.mutate(); }}
              disabled={createMut.isPending}
              className="flex-1 sm:flex-none min-h-[44px] flex items-center justify-center gap-2 px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/60"
            >
              {createMut.isPending
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <FieldIcon name="check" className="w-4 h-4" strokeWidth={2} />}
              {createMut.isPending ? 'Creating…' : 'Create Application'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
