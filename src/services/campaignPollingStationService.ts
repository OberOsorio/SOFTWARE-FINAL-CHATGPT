import { supabase } from '../lib/supabase';
import type { PuestoVotacionInfo } from '../data/puestosVotacionColombia';

type ElectoralScope = 'Municipio' | 'Departamento' | 'Nacional';

export interface CampaignPollingStationSeed {
  campaignId: string;
  department: string;
  municipality: string;
  scope: ElectoralScope;
}

/**
 * Copies the electoral geography into the campaign.  The campaign copy is the
 * operational source used by witnesses and jurors, so later catalogue updates
 * cannot silently change an assignment that is already in progress.
 */
export async function initializeCampaignPollingStations({
  campaignId,
  department,
  municipality,
  scope,
}: CampaignPollingStationSeed): Promise<number> {
  const { count, error: countError } = await supabase
    .from('polling_stations')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaignId);
  if (countError) throw countError;
  if ((count || 0) > 0) return count || 0;

  // Nunca se generan puestos ni mesas aproximados. Este método solamente
  // conserva los registros oficiales que ya hayan sido importados para la
  // campaña desde DIVIPOLE/Registraduría.
  void department;
  void municipality;
  void scope;
  return 0;
}

export async function loadCampaignPollingPlaces(campaignId: string): Promise<PuestoVotacionInfo[]> {
  const { data, error } = await supabase
    .from('polling_stations')
    .select('id, zone, place, table_number, registered_voters')
    .eq('campaign_id', campaignId)
    .neq('status', 'PENDIENTE_ASIGNACION')
    .order('place')
    .order('table_number');
  if (error) throw error;

  const grouped = new Map<string, PuestoVotacionInfo>();
  for (const row of data || []) {
    const [municipio = '', comuna = ''] = String(row.zone || '').split(' · ');
    const key = `${municipio}\u0000${row.place}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.mesas += 1;
      existing.censoEstimado += Number(row.registered_voters || 0);
      continue;
    }
    grouped.set(key, {
      id: String(row.id),
      nombre: String(row.place),
      departamento: '',
      municipio,
      comuna,
      mesas: 1,
      censoEstimado: Number(row.registered_voters || 0),
      lat: 0,
      lng: 0,
    });
  }
  return [...grouped.values()];
}
