import React, { useState, useEffect } from 'react';
import { GlobalAdminApiItem } from '../../../types/globalAdmin';
import { GlobalAdminService } from '../../../services/globalAdminService';
import {
  Zap,
  Globe,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Key,
  Shield,
  Activity,
  Send,
  Loader2,
  Server
} from 'lucide-react';

export const GlobalAdminApis: React.FC = () => {
  const [apis, setApis] = useState<GlobalAdminApiItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pingingApiId, setPingingApiId] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<{ id: string; latency: number; time: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await GlobalAdminService.getApis();
      setApis(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar APIs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTestPing = async (api: GlobalAdminApiItem) => {
    try {
      setPingingApiId(api.id);
      const res = await GlobalAdminService.testPingApi(api.id);
      setPingResult({ id: api.id, latency: res.latencyMs, time: res.pingTime });
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Error al realizar ping a la API');
    } finally {
      setPingingApiId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            SUPERVISIÓN DE APIS Y SERVICIOS EXTERNOS
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Pruebas de conectividad en tiempo real, latencias, límites de tasa y cuotas de consumo.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refrescar Estados</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* APIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
        {apis.map((api) => {
          const isPinging = pingingApiId === api.id;
          return (
            <div
              key={api.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] bg-slate-950 text-cyan-400 px-2 py-0.5 rounded border border-slate-800">
                      {api.provider}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{api.name}</h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 ${
                    api.status === 'ONLINE'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {api.status}
                  </span>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2 mb-4">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Endpoint:</span>
                    <code className="text-slate-200 text-[11px] truncate max-w-[200px]">
                      {api.endpoint}
                    </code>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Llave de API:</span>
                    <code className="text-cyan-300 text-[11px] bg-slate-900 px-1.5 py-0.5 rounded">
                      {api.maskedApiKey}
                    </code>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Límite Rate / Min:</span>
                    <span className="text-white font-bold">{api.rateLimitPerMin} req/min</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Peticiones 24h:</span>
                    <span className="text-cyan-400 font-bold">{api.requests24h?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Quota Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Cuota de Consumo Estimada</span>
                    <span className="text-cyan-400 font-bold">{api.quotaUsedPct}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        api.quotaUsedPct > 80 ? 'bg-rose-500' : api.quotaUsedPct > 50 ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${api.quotaUsedPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Row with Ping Test */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Latencia: <strong className="text-emerald-400">{api.responseTimeMs}ms</strong></span>
                </div>

                <button
                  onClick={() => handleTestPing(api)}
                  disabled={isPinging}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-all disabled:opacity-50"
                >
                  {isPinging ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Ping...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>Test Ping</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
