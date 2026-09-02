import React, { useState, useEffect } from 'react';
import { GlobalAdminSystemConfig } from '../../../types/globalAdmin';
import { GlobalAdminService } from '../../../services/globalAdminService';
import {
  Sliders,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Power,
  Shield,
  Clock,
  Mail,
  Smartphone
} from 'lucide-react';

export const GlobalAdminConfig: React.FC = () => {
  const [config, setConfig] = useState<GlobalAdminSystemConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await GlobalAdminService.getConfig();
      setConfig(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    try {
      setSaving(true);
      await GlobalAdminService.updateConfig(config);
      setSuccessMsg('Configuración global del sistema guardada con éxito.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !config) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 font-mono text-xs">
        <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin mr-2" />
        CARGANDO PARÁMETROS GLOBALES...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            PARÁMETROS GLOBALES DEL SISTEMA
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Políticas de expiración de sesión, protección contra fuerza bruta y modo mantenimiento integral.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-lg shadow-cyan-900/30 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Grid */}
      {config && (
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Security & Sessions */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              POLÍTICAS DE SEGURIDAD Y SESIÓN
            </h3>

            <div>
              <label className="block text-slate-300 mb-1">Tiempo de Inactividad de Sesión (Minutos)</label>
              <input
                type="number"
                value={config.sessionTimeoutMinutes}
                onChange={(e) => setConfig({ ...config, sessionTimeoutMinutes: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Intentos Máximos de Login Fallidos (Anti-Brute Force)</label>
              <input
                type="number"
                value={config.maxFailedLoginAttempts}
                onChange={(e) => setConfig({ ...config, maxFailedLoginAttempts: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <span className="text-white font-bold block">Autenticación MFA Obligatoria</span>
                <span className="text-slate-500 text-[11px]">Exigir segundo factor para todos los administradores</span>
              </div>
              <input
                type="checkbox"
                checked={config.requireMfaForAdmins}
                onChange={(e) => setConfig({ ...config, requireMfaForAdmins: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-900 border-slate-700"
              />
            </div>
          </div>

          {/* System Control & Maintenance */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Power className="w-4 h-4 text-cyan-400" />
              CONTROL MAESTRO DE DISPONIBILIDAD
            </h3>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <span className="text-white font-bold block">Modo Mantenimiento Global</span>
                <span className="text-slate-500 text-[11px]">Suspende temporalmente el acceso público a todos los módulos</span>
              </div>
              <input
                type="checkbox"
                checked={config.maintenanceMode}
                onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Mensaje de Mantenimiento Público</label>
              <textarea
                rows={2}
                value={config.maintenanceMessage}
                onChange={(e) => setConfig({ ...config, maintenanceMessage: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Correo de Contacto de Emergencia</label>
              <input
                type="email"
                value={config.emergencyContactEmail}
                onChange={(e) => setConfig({ ...config, emergencyContactEmail: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
