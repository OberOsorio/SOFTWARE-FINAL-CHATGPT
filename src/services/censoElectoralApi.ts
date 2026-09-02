export interface CensoConsultaResult {
  cedula: string;
  encontrado: boolean;
  esCircunscripcionPermitida: boolean;
  circunscripcionCiudadano: string;
  circunscripcionCampana: string;
  nombreCompleto?: string;
  departamento?: string;
  municipio?: string;
  puestoVotacion?: string;
  comunaSector?: string;
  direccionPuesto?: string;
  mesa?: number;
  estadoCedula?: 'Habilitada' | 'Inhabilitada por Sanción' | 'No Inscrita';
  fechaUltimaActualizacion?: string;
  mensajeRespuesta: string;
}

/**
 * Punto de integración con el censo oficial. No genera ciudadanos, municipios,
 * puestos ni mesas de ejemplo cuando el proveedor electoral no está conectado.
 */
export async function consultarCensoElectoralAPI(
  cedula: string,
  circunscripcionCampana: string = '',
): Promise<CensoConsultaResult> {
  const cleanCedula = cedula.trim().replace(/\D/g, '');
  if (!cleanCedula) {
    return {
      cedula: '',
      encontrado: false,
      esCircunscripcionPermitida: false,
      circunscripcionCiudadano: '',
      circunscripcionCampana,
      mensajeRespuesta: 'Número de cédula inválido o no suministrado.',
    };
  }

  const endpoint = String(import.meta.env.VITE_CENSO_ELECTORAL_API_URL || '').trim();
  if (!endpoint) {
    return {
      cedula: cleanCedula,
      encontrado: false,
      esCircunscripcionPermitida: false,
      circunscripcionCiudadano: '',
      circunscripcionCampana,
      mensajeRespuesta: 'El proveedor oficial del censo electoral no está configurado.',
    };
  }

  const token = String(import.meta.env.VITE_CENSO_ELECTORAL_API_TOKEN || '').trim();
  const url = new URL(endpoint, window.location.origin);
  url.searchParams.set('cedula', cleanCedula);
  const response = await fetch(url.toString(), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) throw new Error('No fue posible consultar el proveedor oficial del censo electoral.');

  const payload: any = await response.json();
  const data = payload?.data || payload;
  const departamento = String(data?.departamento || '').trim();
  const municipio = String(data?.municipio || data?.distrito || '').trim();
  const circunscripcionCiudadano = String(
    data?.circunscripcion || [municipio, departamento].filter(Boolean).join(', '),
  ).trim();
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const permitido = Boolean(circunscripcionCampana) && (
    normalize(circunscripcionCiudadano).includes(normalize(circunscripcionCampana)) ||
    normalize(circunscripcionCampana).includes(normalize(municipio))
  );

  return {
    cedula: cleanCedula,
    encontrado: Boolean(data?.encontrado ?? data?.found ?? data?.nombreCompleto ?? data?.nombre),
    esCircunscripcionPermitida: permitido,
    circunscripcionCiudadano,
    circunscripcionCampana,
    nombreCompleto: data?.nombreCompleto || data?.nombre || undefined,
    departamento: departamento || undefined,
    municipio: municipio || undefined,
    puestoVotacion: data?.puestoVotacion || data?.puesto || undefined,
    comunaSector: data?.comunaSector || data?.zona || data?.comuna || undefined,
    direccionPuesto: data?.direccionPuesto || data?.direccion || undefined,
    mesa: Number(data?.mesa) || undefined,
    estadoCedula: data?.estadoCedula || data?.estado || undefined,
    fechaUltimaActualizacion: data?.fechaUltimaActualizacion || data?.updated_at || undefined,
    mensajeRespuesta: data?.mensajeRespuesta || data?.mensaje || 'Consulta oficial completada.',
  };
}

/** Mantiene la firma usada por el módulo mientras se conecta el proveedor CNE. */
export async function verificarActualizacionPuestoAPI(
  cedula: string,
  _forzarActualizacion: boolean = false,
): Promise<{
  trasladadoAMedellin: boolean;
  puestoNuevo?: {
    departamento: string;
    municipio: string;
    puestoVotacion: string;
    comunaSector: string;
    direccionPuesto: string;
    mesa: number;
    fechaInscripcion: string;
  };
  mensaje: string;
}> {
  const cleanCedula = cedula.trim().replace(/\D/g, '');
  return {
    trasladadoAMedellin: false,
    mensaje: `No existe una actualización oficial de puesto disponible para la C.C. ${cleanCedula}.`,
  };
}
