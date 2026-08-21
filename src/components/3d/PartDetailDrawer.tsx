/**
 * OCHE / CARCHECK AI — Part Detail Drawer Component (FASE 7)
 * Displays deep automotive knowledge for a selected 3D part:
 * ELI5 / Advanced toggle, failure modes, inspection guide, dynamic country costs,
 * and contextual bridges to Chat Assistant and Vehicle Scan Report.
 */

import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  Search,
  Euro,
  MessageSquare,
  FileText,
  ShieldAlert,
  Info,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  MapPin,
  Clock
} from 'lucide-react';
import {
  PartKnowledgeCard,
  ExplanationLevel
} from '../../types/vehicle3D';

interface PartDetailDrawerProps {
  card: PartKnowledgeCard | null;
  isLoading: boolean;
  vehicleName: string;
  hasScanObservation: boolean;
  onAskOche: (card: PartKnowledgeCard) => void;
  onViewInReport?: () => void;
}

type DrawerTab = 'OVERVIEW' | 'FAILURES' | 'INSPECTION' | 'COST';

export const PartDetailDrawer: React.FC<PartDetailDrawerProps> = ({
  card,
  isLoading,
  vehicleName,
  hasScanObservation,
  onAskOche,
  onViewInReport
}) => {
  const [explanationLevel, setExplanationLevel] = useState<ExplanationLevel>('BASIC');
  const [activeTab, setActiveTab] = useState<DrawerTab>('OVERVIEW');

  if (isLoading) {
    return (
      <div className="bg-[#14141A] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center min-h-[380px] text-center space-y-3">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-white/60 uppercase tracking-wider">
          Consultando Base de Conocimiento OCHE...
        </p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="bg-[#14141A] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center min-h-[380px] text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <Wrench className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black text-white uppercase tracking-tight">
          Selecciona una pieza en el 3D
        </h3>
        <p className="text-xs text-white/50 max-w-xs leading-relaxed">
          Toca cualquier punto interactivo del coche para ver qué hace, qué puede fallar, cómo revisarlo y su coste de reparación.
        </p>
      </div>
    );
  }

  const {
    part,
    system,
    basicExplanation,
    advancedExplanation,
    knownProblems,
    inspectionGuide,
    costBreakdown,
    observationStatus,
    observationEvidence,
    riskLevel
  } = card;

  // Severity color mapping
  const riskBadgeClass =
    riskLevel === 'critical'
      ? 'bg-red-950/80 text-red-400 border-red-800'
      : riskLevel === 'high'
      ? 'bg-amber-950/80 text-amber-400 border-amber-800'
      : 'bg-blue-950/80 text-blue-400 border-blue-800';

  return (
    <div className="bg-[#14141A] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 animate-fade-in">
      {/* Top Header: Badge, Part Name, Risk, Observation Tag */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider">
              {system?.name || part.systemId}
            </span>
            <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${riskBadgeClass}`}>
              Riesgo: {riskLevel.toUpperCase()}
            </span>
          </div>

          {/* Observation pill if detected in scan */}
          {observationStatus === 'OBSERVED' ? (
            <span className="px-2.5 py-1 rounded-lg bg-red-600/30 border border-red-500 text-red-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span>OBSERVACIÓN DETECTADA</span>
            </span>
          ) : observationStatus === 'POSSIBLE' ? (
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Info className="w-3 h-3 text-amber-400" />
              <span>PUNTO PRIORITARIO</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/50 text-[10px] font-black uppercase tracking-wider">
              ESTADO CONOCIDO
            </span>
          )}
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight">
            {part.name}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-white/50 font-bold mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>{part.location || card.zone?.name || 'Vano motor'}</span>
          </div>
        </div>

        {/* Scan Evidence Callout (if matching report defect) */}
        {observationEvidence && (
          <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>HALLAZGO DE ESCANEO ACTIVO</span>
              </span>
              {onViewInReport && (
                <button
                  onClick={onViewInReport}
                  className="text-[10px] font-black text-red-300 hover:text-white underline uppercase cursor-pointer"
                >
                  Ver en mi informe →
                </button>
              )}
            </div>
            <p className="text-white/90 font-bold leading-relaxed">
              {observationEvidence.details}
            </p>
          </div>
        )}

        {/* Level Toggle: ELI5 vs Advanced */}
        <div className="flex items-center justify-between p-1.5 rounded-2xl bg-black/60 border border-white/10">
          <span className="text-[10px] font-extrabold text-white/40 uppercase tracking-wider ml-2">
            Nivel Explicativo:
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExplanationLevel('BASIC')}
              className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                explanationLevel === 'BASIC'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
              id="btn-level-basic"
            >
              Fácil (ELI5)
            </button>
            <button
              onClick={() => setExplanationLevel('ADVANCED')}
              className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                explanationLevel === 'ADVANCED'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
              id="btn-level-advanced"
            >
              Detallado
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-black/50 rounded-2xl border border-white/10">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'OVERVIEW'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-white/60 hover:text-white'
          }`}
          id="tab-part-overview"
        >
          <Info className="w-3.5 h-3.5" />
          <span>¿Qué hace?</span>
        </button>

        <button
          onClick={() => setActiveTab('FAILURES')}
          className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'FAILURES'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-white/60 hover:text-white'
          }`}
          id="tab-part-failures"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>¿Qué falla?</span>
        </button>

        <button
          onClick={() => setActiveTab('INSPECTION')}
          className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'INSPECTION'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-white/60 hover:text-white'
          }`}
          id="tab-part-inspection"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Comprobar</span>
        </button>

        <button
          onClick={() => setActiveTab('COST')}
          className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'COST'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-white/60 hover:text-white'
          }`}
          id="tab-part-cost"
        >
          <Euro className="w-3.5 h-3.5" />
          <span>Coste</span>
        </button>
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-3 text-xs animate-fade-in">
          <div className="bg-black/50 p-4 rounded-2xl border border-white/5 space-y-1.5">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider block">
              💡 {explanationLevel === 'BASIC' ? 'En palabras sencillas:' : 'Principio de Funcionamiento:'}
            </span>
            <p className="text-white/90 font-bold leading-relaxed text-sm">
              {explanationLevel === 'BASIC' ? basicExplanation : advancedExplanation}
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-2xl border border-white/5 space-y-1.5">
            <span className="text-[10px] font-black text-white/50 uppercase tracking-wider block">
              ⚙️ Función Técnica Principal:
            </span>
            <p className="text-white/80 font-bold leading-relaxed">
              {part.function}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: WHAT CAN FAIL? */}
      {activeTab === 'FAILURES' && (
        <div className="space-y-3 text-xs animate-fade-in">
          {knownProblems && knownProblems.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                ⚠️ Problemas Conocidos del Modelo ({knownProblems.length}):
              </span>
              {(knownProblems || []).map((prob) => (
                <div key={prob.id} className="bg-black/50 p-3.5 rounded-2xl border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-white uppercase">{prob.title}</h4>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase">
                      {prob.severity}
                    </span>
                  </div>
                  <p className="text-white/80 font-bold leading-relaxed">{prob.description}</p>

                  {prob.symptoms && prob.symptoms.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[9px] font-bold text-amber-400/80 uppercase block mb-1">
                        Síntomas habituales:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-white/70">
                        {(prob.symptoms || []).map((sym, idx) => (
                          <li key={idx}>{sym}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-black/50 p-4 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                ⚠️ Modos de fallo y síntomas generales:
              </span>
              <ul className="list-disc list-inside space-y-1 text-white/80 font-bold leading-relaxed">
                {(part?.failureModes || []).map((fm, idx) => (
                  <li key={idx}>{fm}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warning Signs */}
          {part?.symptoms && part.symptoms.length > 0 && (
            <div className="bg-black/50 p-3.5 rounded-2xl border border-white/5 space-y-1.5">
              <span className="text-[10px] font-black text-white/50 uppercase tracking-wider block">
                🚨 Síntomas de advertencia al conducir:
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(part.symptoms || []).map((sym, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-white/80">
                    {sym}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: HOW TO CHECK (Inspection Guide) */}
      {activeTab === 'INSPECTION' && (
        <div className="space-y-3 text-xs animate-fade-in">
          {/* Safety Warning */}
          {inspectionGuide?.safetyWarnings && inspectionGuide.safetyWarnings.length > 0 && (
            <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>SEGURIDAD ANTE TODO</span>
              </span>
              <p className="text-[11px] font-bold leading-relaxed">
                {inspectionGuide.safetyWarnings[0]}
              </p>
            </div>
          )}

          {/* How to Check Steps */}
          <div className="bg-black/50 p-4 rounded-2xl border border-white/5 space-y-2">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
              🔍 Pasos de Comprobación Práctica:
            </span>
            <div className="space-y-1.5">
              {(inspectionGuide?.howToCheck || []).map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-white/80 font-bold leading-relaxed">
                  <span className="text-emerald-400 font-black">•</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Normal vs Concerning */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="bg-black/50 p-3 rounded-2xl border border-emerald-500/20 space-y-1">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                ✅ Qué es normal
              </span>
              <p className="text-white/70 font-bold text-[11px] leading-relaxed">
                {inspectionGuide.whatIsNormal[0] || 'Giro regular sin holguras.'}
              </p>
            </div>

            <div className="bg-black/50 p-3 rounded-2xl border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                ⚠️ Qué es preocupante
              </span>
              <p className="text-white/70 font-bold text-[11px] leading-relaxed">
                {inspectionGuide.whatIsConcerning[0] || 'Ruidos metálicos o fugas.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: DYNAMIC COST ESTIMATION */}
      {activeTab === 'COST' && (
        <div className="space-y-3 text-xs animate-fade-in">
          <div className="flex items-center justify-between text-white/50 text-[10px] font-extrabold uppercase px-1">
            <span>Baremos Mercado: {costBreakdown.countryCode}</span>
            <span>Confianza: {(costBreakdown.confidence * 100).toFixed(0)}%</span>
          </div>

          {/* 4 Conditions Breakdown */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-0.5">
              <span className="text-white/40 text-[9px] uppercase font-bold block">Pieza Nueva OEM</span>
              <span className="text-emerald-400 font-black text-sm">
                {costBreakdown.partOem} {costBreakdown.currency}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-0.5">
              <span className="text-white/40 text-[9px] uppercase font-bold block">Pieza Aftermarket</span>
              <span className="text-blue-400 font-black text-sm">
                {costBreakdown.partAftermarket} {costBreakdown.currency}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-0.5">
              <span className="text-white/40 text-[9px] uppercase font-bold block">Pieza de Desguace / Usada</span>
              <span className="text-amber-400 font-black text-sm">
                {costBreakdown.partUsed > 0 ? `${costBreakdown.partUsed} ${costBreakdown.currency}` : 'No recom.'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-0.5">
              <span className="text-white/40 text-[9px] uppercase font-bold block">
                Mano de Obra ({costBreakdown.laborHours}h)
              </span>
              <span className="text-purple-400 font-black text-sm">
                {costBreakdown.laborCost} {costBreakdown.currency}
              </span>
            </div>
          </div>

          {/* Total Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-blue-950/60 border border-purple-500/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider block">
                COSTE TOTAL ESTIMADO (TALLER)
              </span>
              <span className="text-xs text-white/50 font-bold">
                Rango {costBreakdown.totalEstimatedMin} – {costBreakdown.totalEstimatedMax} {costBreakdown.currency}
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-white tracking-tight">
                ~{costBreakdown.totalEstimatedExpected} {costBreakdown.currency}
              </span>
            </div>
          </div>

          <p className="text-[9px] text-white/40 font-bold text-center">
            {costBreakdown.source} • Cálculo adaptado a la mano de obra del país activo.
          </p>
        </div>
      )}

      {/* Bottom Context Bridge Buttons */}
      <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => onAskOche(card)}
          className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          id="btn-ask-oche-part"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Preguntar a OCHE sobre esta pieza</span>
        </button>

        {hasScanObservation && onViewInReport && (
          <button
            onClick={onViewInReport}
            className="py-3 px-4 rounded-2xl bg-black hover:bg-white/10 text-white/80 hover:text-white border border-white/20 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            id="btn-view-report-part"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Ver en mi informe</span>
          </button>
        )}
      </div>
    </div>
  );
};
