import React from 'react';
import { EquipoOficialCampana } from '../../types/campana';
import { 
  Briefcase, 
  UserCheck, 
  CreditCard, 
  FileCheck2, 
  Landmark, 
  Phone, 
  Mail, 
  IdCard,
  Building2,
  Calendar,
  Save,
  CheckCircle2
} from 'lucide-react';

interface EquipoCampanaSectionProps {
  equipo: EquipoOficialCampana;
  onChangeEquipo: (updated: EquipoOficialCampana) => void;
  onSaveSection: () => void;
}

export const EquipoCampanaSection: React.FC<EquipoCampanaSectionProps> = ({
  equipo,
  onChangeEquipo,
  onSaveSection
}) => {
  const updateField = (field: keyof EquipoOficialCampana, value: any) => {
    onChangeEquipo({
      ...equipo,
      [field]: value
    });
  };

  return (
    <div className="bg-[#051325]/90 rounded-2xl p-6 border border-cyan-500/30 shadow-xl space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-md text-[10px] font-extrabold uppercase mb-1">
            Paso 5 Equipo & Cuentas CNE
          </div>
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            5. Equipo Oficial de Campaña & Cuenta Bancaria Única (Ley 1475/2011)
          </h3>
        </div>

        <button
          type="button"
          onClick={onSaveSection}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Guardar Sección 5</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        
        {/* ========================================================================= */}
        {/* GERENTE DE CAMPAÑA */}
        {/* ========================================================================= */}
        <div className="bg-[#030d1f] p-5 rounded-2xl border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-2">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="font-black text-white text-sm">Gerente Oficial de Campaña</h4>
            </div>
            <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
              Obligatorio CNE
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-cyan-200 mb-1">Nombre Completo del Gerente *</label>
              <input
                type="text"
                value={equipo.gerenteNombre}
                onChange={(e) => updateField('gerenteNombre', e.target.value)}
                placeholder="Ej. Ing. Rodrigo Echeverri Villa"
                className="w-full bg-[#051833] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-cyan-200 mb-1">Cédula de Ciudadanía *</label>
                <div className="relative">
                  <IdCard className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={equipo.gerenteCedula}
                    onChange={(e) => updateField('gerenteCedula', e.target.value)}
                    placeholder="Ej. 70.892.110"
                    className="w-full bg-[#051833] border border-cyan-500/30 rounded-xl pl-9 pr-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-cyan-200 mb-1">Registro / Acta CNE</label>
                <input
                  type="text"
                  value={equipo.gerenteRegistroCNE}
                  onChange={(e) => updateField('gerenteRegistroCNE', e.target.value)}
                  placeholder="Ej. GER-CNE-2027-0034"
                  className="w-full bg-[#051833] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-cyan-200 mb-1">Teléfono Directo</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={equipo.gerenteTelefono}
                    onChange={(e) => updateField('gerenteTelefono', e.target.value)}
                    placeholder="Ej. +57 315 889 0012"
                    className="w-full bg-[#051833] border border-cyan-500/30 rounded-xl pl-9 pr-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-cyan-200 mb-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={equipo.gerenteEmail}
                    onChange={(e) => updateField('gerenteEmail', e.target.value)}
                    placeholder="Ej. gerencia@campana.co"
                    className="w-full bg-[#051833] border border-cyan-500/30 rounded-xl pl-9 pr-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CONTADOR PÚBLICO OFICIAL */}
        {/* ========================================================================= */}
        <div className="bg-[#030d1f] p-5 rounded-2xl border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-2">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-cyan-400" />
              <h4 className="font-black text-white text-sm">Contador Público Oficial</h4>
            </div>
            <span className="text-[10px] text-cyan-300 font-bold bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
              Con TP Vigente
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-cyan-200 mb-1">Nombre Completo del Contador *</label>
              <input
                type="text"
                value={equipo.contadorNombre}
                onChange={(e) => updateField('contadorNombre', e.target.value)}
                placeholder="Ej. Dra. Martha Lucía Botero"
                className="w-full bg-[#051833] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-cyan-200 mb-1">Cédula de Ciudadanía *</label>
                <div className="relative">
                  <IdCard className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={equipo.contadorCedula}
                    onChange={(e) => updateField('contadorCedula', e.target.value)}
                    placeholder="Ej. 43.789.201"
                    className="w-full bg-[#051833] border border-cyan-500/30 rounded-xl pl-9 pr-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-cyan-200 mb-1">Tarjeta Profesional (JCC) *</label>
                <input
                  type="text"
                  value={equipo.contadorTarjetaProfesional}
                  onChange={(e) => updateField('contadorTarjetaProfesional', e.target.value)}
                  placeholder="Ej. TP-189204-T"
                  className="w-full bg-[#051833] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-cyan-200 mb-1">Teléfono de Contacto</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={equipo.contadorTelefono}
                    onChange={(e) => updateField('contadorTelefono', e.target.value)}
                    placeholder="Ej. +57 301 223 9988"
                    className="w-full bg-[#051833] border border-cyan-500/30 rounded-xl pl-9 pr-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-cyan-200 mb-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={equipo.contadorEmail}
                    onChange={(e) => updateField('contadorEmail', e.target.value)}
                    placeholder="Ej. contabilidad@campana.co"
                    className="w-full bg-[#051833] border border-cyan-500/30 rounded-xl pl-9 pr-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CUENTA BANCARIA EXCLUSIVA */}
        {/* ========================================================================= */}
        <div className="bg-[#030d1f] p-5 rounded-2xl border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-2">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-amber-400" />
              <h4 className="font-black text-white text-sm">Cuenta Bancaria Única de Campaña</h4>
            </div>
            <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
              Ley 1475 / CNE
            </span>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-cyan-200 mb-1">Entidad Bancaria *</label>
                <input
                  type="text"
                  value={equipo.bancoNombre}
                  onChange={(e) => updateField('bancoNombre', e.target.value)}
                  placeholder="Ej. Bancolombia S.A. / Banco de Bogotá"
                  className="w-full bg-[#051833] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block font-bold text-cyan-200 mb-1">Tipo de Cuenta *</label>
                <select
                  value={equipo.bancoTipoCuenta}
                  onChange={(e) => updateField('bancoTipoCuenta', e.target.value as any)}
                  className="w-full bg-[#051833] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-400"
                >
                  <option value="Corriente">Cuenta Corriente</option>
                  <option value="Ahorros">Cuenta de Ahorros</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-cyan-200 mb-1">Número de Cuenta *</label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={equipo.bancoNumeroCuenta}
                    onChange={(e) => updateField('bancoNumeroCuenta', e.target.value)}
                    placeholder="Ej. 304-889102-14"
                    className="w-full bg-[#051833] border border-cyan-500/30 rounded-xl pl-9 pr-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-cyan-200 mb-1">Fecha de Apertura</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={equipo.bancoFechaApertura}
                    onChange={(e) => updateField('bancoFechaApertura', e.target.value)}
                    className="w-full bg-[#051833] border border-cyan-500/30 rounded-xl pl-9 pr-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-cyan-200 mb-1">Titular Oficial Registrado *</label>
              <input
                type="text"
                value={equipo.bancoTitular}
                onChange={(e) => updateField('bancoTitular', e.target.value)}
                placeholder="Ej. Campaña Javier Méndez Alcaldía 2027"
                className="w-full bg-[#051833] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* AUDITOR INTERNO / REVISOR FISCAL */}
        {/* ========================================================================= */}
        <div className="bg-[#030d1f] p-5 rounded-2xl border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              <h4 className="font-black text-white text-sm">Auditor Interno / Revisor Fiscal</h4>
            </div>
            <span className="text-[10px] text-purple-300 font-bold bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
              Control Preventivo
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-cyan-200 mb-1">Nombre del Auditor o Revisor</label>
              <input
                type="text"
                value={equipo.auditorNombre}
                onChange={(e) => updateField('auditorNombre', e.target.value)}
                placeholder="Ej. Dr. Guillermo León Vélez"
                className="w-full bg-[#051833] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-cyan-200 mb-1">Cédula de Ciudadanía</label>
                <input
                  type="text"
                  value={equipo.auditorCedula}
                  onChange={(e) => updateField('auditorCedula', e.target.value)}
                  placeholder="Ej. 15.441.890"
                  className="w-full bg-[#051833] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block font-bold text-cyan-200 mb-1">Tarjeta Profesional (Opcional)</label>
                <input
                  type="text"
                  value={equipo.auditorTarjetaProfesional || ''}
                  onChange={(e) => updateField('auditorTarjetaProfesional', e.target.value)}
                  placeholder="Ej. TP-94512-T"
                  className="w-full bg-[#051833] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-cyan-200 mb-1">Correo Electrónico del Auditor</label>
              <input
                type="email"
                value={equipo.auditorEmail || ''}
                onChange={(e) => updateField('auditorEmail', e.target.value)}
                placeholder="Ej. auditoria@campana.co"
                className="w-full bg-[#051833] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        </div>

      </div>

      <div className="flex items-center justify-end pt-3 border-t border-cyan-500/20">
        <button
          type="button"
          onClick={onSaveSection}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Equipo Oficial & Cuentas</span>
        </button>
      </div>
    </div>
  );
};
