import React, { useState, useEffect } from 'react';
import { GlobalAdminAuditLog } from '../../../types/globalAdmin';
import { GlobalAdminService } from '../../../services/globalAdminService';
import {
  FileText,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Shield,
  Clock,
  User,
  Activity
} from 'lucide-react';

export const GlobalAdminAudit: React.FC = () => {
  const [logs, setLogs] = useState<GlobalAdminAuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('ALL');
  const [severity, setSeverity] = useState<string>('ALL');
  const [status, setStatus] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<GlobalAdminAuditLog | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await GlobalAdminService.getAuditLogs({
        search: search || undefined,
        category: category !== 'ALL' ? category : undefined,
        severity: severity !== 'ALL' ? severity : undefined,
        status: status !== 'ALL' ? status : undefined,
        limit: 200
      });
      setLogs(res.logs);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar logs de auditoría');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [category, severity, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const exportLogsAsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `auditoria-global-electoral-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            REGISTRO DE AUDITORÍA INMUTABLE & TRAZABILIDAD
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Historial criptográficamente ordenado de operaciones administrativas, cambios de roles y alertas de seguridad.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </button>
          <button
            onClick={exportLogsAsJson}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-lg shadow-cyan-900/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar JSON</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 backdrop-blur-md">
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por actor, acción, IP..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">Todas las Categorías</option>
            <option value="AUTH">Autenticación (AUTH)</option>
            <option value="USERS">Usuarios (USERS)</option>
            <option value="ROLES">Roles (ROLES)</option>
            <option value="CAMPAIGNS">Campañas (CAMPAIGNS)</option>
            <option value="MODULES">Módulos (MODULES)</option>
            <option value="SECURITY">Seguridad (SECURITY)</option>
            <option value="CONFIG">Configuración (CONFIG)</option>
          </select>
        </div>

        <div>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">Toda Severidad</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="SECURITY">SECURITY</option>
          </select>
        </div>

        <div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="ÉXITO">ÉXITO</option>
            <option value="DENEGADO">DENEGADO</option>
            <option value="FALLO">FALLO</option>
          </select>
        </div>
      </form>

      {/* Logs Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 bg-slate-950/60">
                <th className="py-3 px-4">TIMESTAMP / ID</th>
                <th className="py-3 px-4">ACTOR / ROL</th>
                <th className="py-3 px-4">ACCIÓN & CATEGORÍA</th>
                <th className="py-3 px-4">RECURSO AFECTADO</th>
                <th className="py-3 px-4">ESTADO</th>
                <th className="py-3 px-4">IP / DISPOSITIVO</th>
                <th className="py-3 px-4 text-right">DETALLE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No se encontraron registros de auditoría que cumplan los criterios.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-white font-bold block">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-slate-200 font-semibold block">{log.actorName}</span>
                      <span className="text-[10px] text-slate-400">{log.actorEmail}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block mb-1 ${
                        log.severity === 'SECURITY' ? 'bg-purple-950 text-purple-300 border border-purple-500/40' :
                        log.severity === 'WARNING' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Cat: {log.category}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-300 max-w-[200px] truncate">
                      {log.resource}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                        log.status === 'ÉXITO' ? 'text-emerald-400' :
                        log.status === 'DENEGADO' ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        {log.status === 'ÉXITO' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {log.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                      <span className="block text-slate-300">{log.ipAddress}</span>
                      <span className="text-[10px] text-slate-500 max-w-[120px] truncate block">
                        {log.userAgent}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                DETALLE DE EVENTO DE AUDITORÍA
              </h3>
              <span className="text-xs text-slate-400">{selectedLog.id}</span>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px]">
                <div><span className="text-slate-500 block">FECHA & HORA:</span> {new Date(selectedLog.timestamp).toLocaleString()}</div>
                <div><span className="text-slate-500 block">SEVERIDAD:</span> {selectedLog.severity}</div>
                <div><span className="text-slate-500 block">ACTOR:</span> {selectedLog.actorName}</div>
                <div><span className="text-slate-500 block">ROL:</span> {selectedLog.actorRole}</div>
                <div><span className="text-slate-500 block">IP ORIGEN:</span> {selectedLog.ipAddress}</div>
                <div><span className="text-slate-500 block">ESTADO:</span> {selectedLog.status}</div>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px] mb-1">DETALLES DEL EVENTO:</span>
                <p className="text-slate-200 bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs">
                  {selectedLog.details}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] mb-0.5">USER AGENT CLIENTE:</span>
                <code className="text-slate-400 text-[10px] break-all">
                  {selectedLog.userAgent}
                </code>
              </div>
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
            >
              Cerrar Detalle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
