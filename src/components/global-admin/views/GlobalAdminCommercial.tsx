import React, { useEffect, useState } from 'react';
import { Check, Contact, Plus, Save, Trash2 } from 'lucide-react';
import {
  LandingCommercialConfig,
  LandingCommercialConfigService,
  LandingPlan,
  DEFAULT_LANDING_COMMERCIAL_CONFIG,
} from '../../../services/landingCommercialConfigService';

const emptyPlan = (): LandingPlan => ({
  id: crypto.randomUUID(), name: '', description: '', monthlyPrice: 0, annualMonthlyPrice: 0,
  currency: 'USD', billingLabel: '/ mes', features: [], buttonLabel: 'Seleccionar plan',
  highlighted: false, badge: '', enabled: true, order: Date.now(),
});

export const GlobalAdminCommercial: React.FC = () => {
  const [config, setConfig] = useState<LandingCommercialConfig>(DEFAULT_LANDING_COMMERCIAL_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    LandingCommercialConfigService.get()
      .then(setConfig)
      .catch((error: any) => setMessage(error?.message || 'No fue posible cargar la configuración comercial.'))
      .finally(() => setLoading(false));
  }, []);

  const updatePlan = (id: string, patch: Partial<LandingPlan>) => {
    setConfig(prev => ({ ...prev, plans: prev.plans.map(plan => plan.id === id ? { ...plan, ...patch } : plan) }));
  };

  const save = async () => {
    setSaving(true); setMessage('');
    try {
      const normalized = { ...config, plans: config.plans.map((plan, index) => ({ ...plan, order: index })) };
      await LandingCommercialConfigService.save(normalized);
      setConfig(normalized); setMessage('Configuración publicada en la landing correctamente.');
    } catch (error: any) {
      setMessage(error?.message || 'No fue posible publicar los cambios.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5 text-sm text-cyan-200">Cargando configuración comercial…</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-xl font-black text-white">Planes y contacto de la landing</h1><p className="mt-1 text-sm text-slate-400">Administra lo que los visitantes verán públicamente.</p></div>
        <button onClick={() => void save()} disabled={saving} className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Publicando…' : 'Publicar cambios'}</button>
      </div>
      {message && <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-4 py-3 text-sm text-cyan-200">{message}</div>}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="mb-5 flex items-center justify-between"><div><h2 className="font-black text-white">Planes comerciales</h2><p className="text-xs text-slate-400">Precios, beneficios y visibilidad.</p></div><button onClick={() => setConfig(prev => ({ ...prev, plans: [...prev.plans, emptyPlan()] }))} className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-300"><Plus className="h-4 w-4" />Agregar plan</button></div>
        {config.plans.length === 0 && <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">No hay planes publicados.</div>}
        <div className="grid gap-5 xl:grid-cols-2">
          {config.plans.map(plan => (
            <article key={plan.id} className="space-y-4 rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
              <div className="flex items-center justify-between gap-3"><input value={plan.name} onChange={e => updatePlan(plan.id, { name: e.target.value })} placeholder="Nombre del plan" className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-bold text-white"/><button onClick={() => setConfig(prev => ({ ...prev, plans: prev.plans.filter(item => item.id !== plan.id) }))} className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button></div>
              <textarea value={plan.description} onChange={e => updatePlan(plan.id, { description: e.target.value })} placeholder="Descripción" className="min-h-20 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
              <div className="grid grid-cols-2 gap-3"><label className="text-xs text-slate-400">Precio mensual<input type="number" min="0" value={plan.monthlyPrice} onChange={e => updatePlan(plan.id, { monthlyPrice: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white" /></label><label className="text-xs text-slate-400">Mensualidad en plan anual<input type="number" min="0" value={plan.annualMonthlyPrice} onChange={e => updatePlan(plan.id, { annualMonthlyPrice: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white" /></label></div>
              <div className="grid grid-cols-2 gap-3"><input value={plan.currency} onChange={e => updatePlan(plan.id, { currency: e.target.value })} placeholder="Moneda" className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"/><input value={plan.badge} onChange={e => updatePlan(plan.id, { badge: e.target.value })} placeholder="Etiqueta: Más popular" className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"/></div>
              <div className="space-y-2"><p className="text-xs font-bold uppercase text-slate-400">Funciones incluidas</p>{plan.features.map((feature, index) => <div key={`${plan.id}-${index}`} className="flex gap-2"><Check className="mt-2.5 h-4 w-4 text-emerald-400"/><input value={feature} onChange={e => updatePlan(plan.id, { features: plan.features.map((item, i) => i === index ? e.target.value : item) })} className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"/><button onClick={() => updatePlan(plan.id, { features: plan.features.filter((_, i) => i !== index) })} className="text-rose-400"><Trash2 className="h-4 w-4"/></button></div>)}<button onClick={() => updatePlan(plan.id, { features: [...plan.features, ''] })} className="text-xs font-bold text-cyan-300">+ Agregar función</button></div>
              <div className="flex flex-wrap gap-5 text-xs"><label className="flex items-center gap-2"><input type="checkbox" checked={plan.enabled} onChange={e => updatePlan(plan.id, { enabled: e.target.checked })}/>Visible en la landing</label><label className="flex items-center gap-2"><input type="checkbox" checked={plan.highlighted} onChange={e => updatePlan(plan.id, { highlighted: e.target.checked })}/>Plan destacado</label></div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="mb-5 flex items-center gap-2"><Contact className="h-5 w-5 text-cyan-400"/><div><h2 className="font-black text-white">Datos de contacto</h2><p className="text-xs text-slate-400">Solo se mostrarán los campos que tengan contenido.</p></div></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {([['email','Correo electrónico'],['phone','Teléfono'],['whatsapp','WhatsApp'],['address','Dirección'],['city','Ciudad / País'],['schedule','Horario de atención']] as const).map(([key,label]) => <label key={key} className="text-xs text-slate-400">{label}<input value={config.contact[key]} onChange={e => setConfig(prev => ({ ...prev, contact: { ...prev.contact, [key]: e.target.value } }))} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"/></label>)}
        </div>
      </section>
    </div>
  );
};
