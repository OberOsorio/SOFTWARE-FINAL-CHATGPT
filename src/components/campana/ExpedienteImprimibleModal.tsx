import React from 'react';
import { CampanaDossier } from '../../types/campana';
import { 
  Printer, 
  X, 
  FileText, 
  Building2, 
  User, 
  Award, 
  Calendar, 
  Briefcase, 
  Users, 
  ShieldCheck,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

interface ExpedienteImprimibleModalProps {
  dossier: CampanaDossier;
  isOpen: boolean;
  onClose: () => void;
}

export const ExpedienteImprimibleModal: React.FC<ExpedienteImprimibleModalProps> = ({
  dossier,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const handlePrintPDF = () => {
    window.print();
  };

  const cneLimitMap: Record<string, number> = {
    Alcaldía: 1250000000,
    Gobernación: 3500000000,
    Concejo: 450000000,
    Asamblea: 950000000,
    JAL: 120000000
  };
  const estimatedLimit = cneLimitMap[dossier.corporacion] || 1000000000;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      {/* Print Styles for clean PDF Rendering */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-dossier-root, #printable-dossier-root * {
            visibility: visible;
          }
          #printable-dossier-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: #ffffff !important;
            color: #0f172a !important;
            font-size: 11pt !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            background: #ffffff !important;
            border: 1px solid #cbd5e1 !important;
            color: #0f172a !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          .print-text-dark {
            color: #0f172a !important;
          }
          .print-text-muted {
            color: #475569 !important;
          }
          .print-badge {
            background: #f1f5f9 !important;
            color: #0f172a !important;
            border: 1px solid #94a3b8 !important;
          }
        }
      `}</style>

      <div className="bg-[#030e21] rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-cyan-500/40 space-y-5 text-white max-h-[90vh] overflow-y-auto">
        
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/20 rounded-xl text-cyan-400 border border-cyan-500/30 shrink-0">
              <FileCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">
                Expediente Oficial de Campaña (Informe Ejecutivo en PDF)
              </h3>
              <p className="text-[11px] text-slate-400">
                Documento legal consolidado para radicación ante CNE, Registraduría y Comité de Campaña
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrintPDF}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Generar / Imprimir PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[#081f3d] text-slate-400 hover:text-white cursor-pointer ml-1"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area Container (PDF layout) */}
        <div id="printable-dossier-root" className="bg-[#020712] p-4 sm:p-6 rounded-2xl border border-cyan-500/20 space-y-6 text-xs text-slate-200">
          
          {/* Official Institutional Header */}
          <div className="print-card border-b border-slate-700/80 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={dossier.fotoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'}
                alt={dossier.nombreCandidato}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-cyan-400/40 shrink-0 shadow-md"
              />
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400 print-text-dark flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>CONSEJO NACIONAL ELECTORAL • REGISTRADURÍA NACIONAL</span>
                </div>
                <h2 className="text-base sm:text-xl font-black text-white print-text-dark mt-0.5">
                  {dossier.nombreCandidato || 'CANDIDATO NO REGISTRADO'}
                </h2>
                <p className="text-slate-400 print-text-muted text-xs font-semibold">
                  Expediente de Candidatura a {dossier.corporacion} de {dossier.municipio || dossier.departamento} ({dossier.departamento})
                </p>
                <div className="text-[10px] text-cyan-300 print-text-dark mt-1">
                  ID Expediente: <span className="font-mono">{dossier.id}</span> • Proceso: <strong>{dossier.tipoProcesoEleccion}</strong>
                </div>
              </div>
            </div>

            <div className="text-right space-y-1 self-stretch sm:self-auto bg-[#041325] print-card p-3 rounded-xl border border-cyan-500/30">
              <div className="text-[10px] text-slate-400 print-text-muted font-bold uppercase">Fecha de Elecciones (Día E)</div>
              <div className="text-sm sm:text-base font-black text-amber-300 print-text-dark font-mono">{dossier.fechaEleccion}</div>
              <div className="text-[10px] text-emerald-400 print-text-dark font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                Tope Legal CNE: ${estimatedLimit.toLocaleString()} COP
              </div>
            </div>
          </div>

          {/* Section 1 & 2: Parameters & Candidate Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Parámetros Electorales */}
            <div className="p-4 bg-[#041021] print-card rounded-xl border border-cyan-500/20 space-y-2.5">
              <div className="font-extrabold text-cyan-300 print-text-dark flex items-center gap-1.5 text-xs border-b border-slate-700/50 pb-1.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>1. Parámetros Electorales & Tarjetón</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div><span className="text-slate-500 print-text-muted block text-[10px]">Corporación:</span> <strong className="text-white print-text-dark">{dossier.corporacion}</strong></div>
                <div><span className="text-slate-500 print-text-muted block text-[10px]">Circunscripción:</span> <strong className="text-white print-text-dark">{dossier.circunscripcionTerritorial}</strong></div>
                <div><span className="text-slate-500 print-text-muted block text-[10px]">Departamento:</span> <strong className="text-white print-text-dark">{dossier.departamento}</strong></div>
                <div><span className="text-slate-500 print-text-muted block text-[10px]">Municipio / Distrito:</span> <strong className="text-white print-text-dark">{dossier.municipio || 'Departamental'}</strong></div>
                <div><span className="text-slate-500 print-text-muted block text-[10px]">Modalidad:</span> <strong className="text-white print-text-dark">{dossier.modalidadCandidatura}</strong></div>
                <div><span className="text-slate-500 print-text-muted block text-[10px]">Posición Tarjetón:</span> <strong className="text-amber-300 print-text-dark font-mono">{dossier.posicionTarjeton || 'Por Asignar'}</strong></div>
              </div>
            </div>

            {/* 2. Ficha Técnica del Candidato */}
            <div className="p-4 bg-[#041021] print-card rounded-xl border border-cyan-500/20 space-y-2.5">
              <div className="font-extrabold text-cyan-300 print-text-dark flex items-center gap-1.5 text-xs border-b border-slate-700/50 pb-1.5">
                <User className="w-4 h-4 text-emerald-400" />
                <span>2. Ficha Técnica del Candidato</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div><span className="text-slate-500 print-text-muted block text-[10px]">Nombre Completo:</span> <strong className="text-white print-text-dark">{dossier.nombreCandidato}</strong></div>
                <div><span className="text-slate-500 print-text-muted block text-[10px]">Cédula de Ciudadanía:</span> <strong className="text-white print-text-dark font-mono">{dossier.cedulaCandidato}</strong></div>
                <div><span className="text-slate-500 print-text-muted block text-[10px]">Nombre Político:</span> <strong className="text-cyan-300 print-text-dark">{dossier.seudonimoPolitico || 'N/A'}</strong></div>
                <div><span className="text-slate-500 print-text-muted block text-[10px]">Profesión:</span> <strong className="text-white print-text-dark">{dossier.profesionCandidato || 'N/A'}</strong></div>
                <div><span className="text-slate-500 print-text-muted block text-[10px]">Teléfono / WhatsApp:</span> <strong className="text-white print-text-dark font-mono">{dossier.telefonoCandidato || 'N/A'}</strong></div>
                <div><span className="text-slate-500 print-text-muted block text-[10px]">Correo Oficial:</span> <strong className="text-white print-text-dark">{dossier.emailCandidato || 'N/A'}</strong></div>
              </div>
            </div>
          </div>

          {/* Section 3 & 4: Endorsement & Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 3. Respaldo Político & Aval */}
            <div className="p-4 bg-[#041021] print-card rounded-xl border border-cyan-500/20 space-y-2.5">
              <div className="font-extrabold text-cyan-300 print-text-dark flex items-center gap-1.5 text-xs border-b border-slate-700/50 pb-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>3. Respaldo Político & Aval Oficial CNE</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div><span className="text-slate-500 print-text-muted block text-[10px]">Modalidad de Respaldo:</span> <strong className="text-emerald-400 print-text-dark font-bold">{dossier.modalidadAval}</strong></div>
                {dossier.modalidadAval === 'Partido' && (
                  <>
                    <div><span className="text-slate-500 print-text-muted block text-[10px]">Partido Avalista con Personería:</span> <strong className="text-white print-text-dark">{dossier.partidoUnico}</strong></div>
                    <div><span className="text-slate-500 print-text-muted block text-[10px]">Radicado Aval CNE:</span> <strong className="text-cyan-300 print-text-dark font-mono">{dossier.numeroAvalCNE || 'En trámite'}</strong></div>
                  </>
                )}
                {dossier.modalidadAval === 'Firmas' && (
                  <>
                    <div><span className="text-slate-500 print-text-muted block text-[10px]">Grupo Significativo de Ciudadanos:</span> <strong className="text-white print-text-dark">{dossier.nombreGrupoFirmas}</strong></div>
                    <div><span className="text-slate-500 print-text-muted block text-[10px]">Radicado Registraduría:</span> <strong className="text-cyan-300 print-text-dark font-mono">{dossier.radicadoRegistraduria}</strong></div>
                    <div><span className="text-slate-500 print-text-muted block text-[10px]">Meta de Firmas Validadas:</span> <strong className="text-white print-text-dark font-mono">{dossier.metaFirmas.toLocaleString()} firmas</strong></div>
                  </>
                )}
                {dossier.modalidadAval === 'Coalición' && (
                  <>
                    <div><span className="text-slate-500 print-text-muted block text-[10px]">Nombre Oficial de Coalición:</span> <strong className="text-white print-text-dark">{dossier.nombreCoalicion}</strong></div>
                    <div><span className="text-slate-500 print-text-muted block text-[10px]">Partidos Miembros:</span> <strong className="text-cyan-300 print-text-dark">{dossier.partidosCoalicion?.join(', ')}</strong></div>
                    <div><span className="text-slate-500 print-text-muted block text-[10px]">Partido Responsable ante CNE:</span> <strong className="text-emerald-400 print-text-dark font-bold">{dossier.partidoResponsableCNE}</strong></div>
                  </>
                )}
              </div>
            </div>

            {/* 4. Calendario & Póliza */}
            <div className="p-4 bg-[#041021] print-card rounded-xl border border-cyan-500/20 space-y-2.5">
              <div className="font-extrabold text-cyan-300 print-text-dark flex items-center gap-1.5 text-xs border-b border-slate-700/50 pb-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>4. Calendario & Póliza de Seriedad</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div><span className="text-slate-500 print-text-muted block text-[10px]">Apertura de Urnas:</span> <strong className="text-white print-text-dark font-mono">{dossier.horaApertura} AM</strong></div>
                <div><span className="text-slate-500 print-text-muted block text-[10px]">Cierre de Urnas:</span> <strong className="text-white print-text-dark font-mono">{dossier.horaCierre} PM</strong></div>
                <div className="col-span-2"><span className="text-slate-500 print-text-muted block text-[10px]">Número de Póliza de Seriedad:</span> <strong className="text-amber-300 print-text-dark font-mono">{dossier.polizaNumero || 'N/A'}</strong></div>
                <div className="col-span-2"><span className="text-slate-500 print-text-muted block text-[10px]">Compañía Aseguradora Emisora:</span> <strong className="text-white print-text-dark">{dossier.aseguradora || 'N/A'}</strong></div>
              </div>
            </div>
          </div>

          {/* Section 5: Official Campaign Team (Law 1475/2011) */}
          <div className="p-4 bg-[#041021] print-card rounded-xl border border-cyan-500/20 space-y-3">
            <div className="font-extrabold text-cyan-300 print-text-dark flex items-center justify-between text-xs border-b border-slate-700/50 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                5. Equipo Oficial de Campaña & Cuenta Bancaria Única (Ley 1475 de 2011)
              </span>
              <span className="text-[10px] text-emerald-400 print-text-dark font-bold bg-emerald-500/20 print-badge px-2 py-0.5 rounded border border-emerald-500/30">
                Auditoría CNE
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
              <div className="p-3 bg-[#020712] print-card rounded-lg border border-slate-800">
                <span className="text-slate-500 print-text-muted block font-bold text-[10px] uppercase">Gerente de Campaña</span>
                <strong className="text-white print-text-dark block mt-0.5">{dossier.equipo?.gerenteNombre || 'Sin asignar'}</strong>
                <span className="text-slate-400 print-text-muted text-[10px] block font-mono">CC: {dossier.equipo?.gerenteCedula || 'N/A'}</span>
                <span className="text-cyan-300 print-text-dark text-[10px] block font-mono">Reg CNE: {dossier.equipo?.gerenteRegistroCNE || 'N/A'}</span>
              </div>

              <div className="p-3 bg-[#020712] print-card rounded-lg border border-slate-800">
                <span className="text-slate-500 print-text-muted block font-bold text-[10px] uppercase">Contador Público Oficial</span>
                <strong className="text-white print-text-dark block mt-0.5">{dossier.equipo?.contadorNombre || 'Sin asignar'}</strong>
                <span className="text-slate-400 print-text-muted text-[10px] block font-mono">CC: {dossier.equipo?.contadorCedula || 'N/A'}</span>
                <span className="text-emerald-400 print-text-dark text-[10px] block font-mono font-bold">TP: {dossier.equipo?.contadorTarjetaProfesional || 'N/A'}</span>
              </div>

              <div className="p-3 bg-[#020712] print-card rounded-lg border border-slate-800">
                <span className="text-slate-500 print-text-muted block font-bold text-[10px] uppercase">Cuenta Bancaria Única CNE</span>
                <strong className="text-white print-text-dark block mt-0.5">{dossier.equipo?.bancoNombre || 'Sin banco'}</strong>
                <span className="text-amber-300 print-text-dark text-[10px] block font-mono font-bold">{dossier.equipo?.bancoTipoCuenta} No. {dossier.equipo?.bancoNumeroCuenta || 'N/A'}</span>
                <span className="text-slate-400 print-text-muted text-[10px] block truncate">Titular: {dossier.equipo?.bancoTitular || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Section 6: Allied Campaigns & Lists */}
          <div className="p-4 bg-[#041021] print-card rounded-xl border border-cyan-500/20 space-y-3">
            <div className="font-extrabold text-cyan-300 print-text-dark flex items-center justify-between text-xs border-b border-slate-700/50 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                6. Co-Candidaturas & Listas Aliadas Vinculadas ({dossier.campanasAliadas?.length || 0} Listas)
              </span>
              <span className="text-[10px] text-cyan-300 print-text-dark font-bold bg-cyan-500/20 print-badge px-2 py-0.5 rounded border border-cyan-500/30">
                Concejo • Asamblea • JAL
              </span>
            </div>

            {dossier.campanasAliadas && dossier.campanasAliadas.length > 0 ? (
              <div className="space-y-2 text-[11px]">
                {dossier.campanasAliadas.map((aliada, idx) => (
                  <div key={aliada.id} className="p-2.5 bg-[#020712] print-card rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-white print-text-dark">{idx + 1}. {aliada.nombreLista}</span>
                      <span className="text-[10px] text-slate-400 print-text-muted block">
                        {aliada.corporacion} • {aliada.partidoOLista} • {aliada.modalidad} • Meta: {aliada.metaVotosEsperada?.toLocaleString()} votos
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 print-text-dark bg-emerald-500/10 print-badge px-2 py-0.5 rounded border border-emerald-500/20 shrink-0 self-start sm:self-auto">
                      {aliada.candidatos?.length || 0} candidatos inscritos
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 print-text-muted text-[11px] italic">No hay listas aliadas registradas actualmente en este expediente.</p>
            )}
          </div>

          {/* Official Signatures Box for Legal Certification */}
          <div className="p-4 bg-[#041021] print-card rounded-xl border border-cyan-500/20 space-y-6 pt-6 mt-4">
            <div className="text-[10px] font-bold text-center text-slate-400 print-text-muted uppercase tracking-wider">
              Certificación de Veracidad de la Información & Responsabilidad Legal (Ley 1475 de 2011)
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-center text-[10px]">
              
              <div className="space-y-1">
                <div className="border-t border-slate-600 print-card pt-2 w-4/5 mx-auto"></div>
                <strong className="block text-white print-text-dark text-[11px]">{dossier.nombreCandidato}</strong>
                <span className="text-slate-400 print-text-muted block">Candidato Oficial</span>
                <span className="text-slate-500 print-text-muted block font-mono">CC: {dossier.cedulaCandidato}</span>
              </div>

              <div className="space-y-1">
                <div className="border-t border-slate-600 print-card pt-2 w-4/5 mx-auto"></div>
                <strong className="block text-white print-text-dark text-[11px]">{dossier.equipo?.gerenteNombre || 'Gerente de Campaña'}</strong>
                <span className="text-slate-400 print-text-muted block">Gerente Oficial CNE</span>
                <span className="text-slate-500 print-text-muted block font-mono">CC: {dossier.equipo?.gerenteCedula || '__________________'}</span>
              </div>

              <div className="space-y-1">
                <div className="border-t border-slate-600 print-card pt-2 w-4/5 mx-auto"></div>
                <strong className="block text-white print-text-dark text-[11px]">{dossier.equipo?.contadorNombre || 'Contador Público'}</strong>
                <span className="text-slate-400 print-text-muted block">Contador Público JCC</span>
                <span className="text-slate-500 print-text-muted block font-mono">TP: {dossier.equipo?.contadorTarjetaProfesional || '__________________'}</span>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-cyan-500/20 no-print">
          <div className="text-[11px] text-slate-400 text-center sm:text-left">
            * Para generar el archivo <strong className="text-emerald-400">PDF</strong>, haga clic en el botón y seleccione <em>"Guardar como PDF"</em> en el destino de impresión.
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrintPDF}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Generar PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#051833] hover:bg-[#09254d] text-slate-300 font-bold text-xs rounded-xl border border-cyan-500/30 transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
