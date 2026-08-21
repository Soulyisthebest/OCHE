/**
 * OCHE / CARCHECK AI — Part Detail Drawer Component (FASE 7 & 17)
 * UX Simplification: "TOCO -> MIRO -> ENTIENDO"
 * Clear, concise, non-alarmist explanation, max 2-3 inspection check points,
 * estimated repair cost, expandable detail tabs, and chat bridge.
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
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles
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
  const [showFullDetails, setShowFullDetails] = useState<boolean>(false);
  const [explanationLevel, setExplanationLevel] = useState<ExplanationLevel>('BASIC');
  const [activeTab, setActiveTab] = useState<DrawerTab>('OVERVIEW');

  if (isLoading) {
    return (
      <div className="bg-[#14141A] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center min-h-[360px] text-center space-y-3">
        <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-white/60 uppercase tracking-wider">
          Consultando Base de Conocimiento OCHE...
        </p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="bg-[#14141A] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center min-h-[360px] text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <Wrench className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-black text-white uppercase tracking-tight">
          Toca una pieza para explorarla
        </h3>
        <p className="text-xs text-white/50 max-w-xs leading-relaxed">
          Toca cualquier parte del coche en la vista 3D para entender qué hace, qué conviene revisar en este modelo y su coste estimado.
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

  // Extract max 2-3 concise check points
  const checkPoints: string[] = [];
  if (knownProblems && knownProblems.length > 0) {
    knownProblems.slice(0, 2).forEach((kp) => {
      checkPoints.push(`${kp.title}: ${kp.symptoms && kp.symptoms[0] ? kp.symptoms[0] : kp.description}`);
    });
  } else if (part.failureModes && part.failureModes.length > 0) {
    part.failureModes.slice(0, 2).forEach((fm) => checkPoints.push(fm));
  } else if (inspectionGuide?.whatIsConcerning && inspectionGuide.whatIsConcerning.length > 0) {
    checkPoints.push(inspectionGuide.whatIsConcerning[0]);
  }

  if (checkPoints.length === 0) {
    checkPoints.push('Comprobar ausencia de holguras, fugas o ruidos anómalos.');
  }

  // Severity color mapping
  const riskBadgeClass =
    riskLevel === 'critical'
      ? 'bg-red-950/80 text-red-400 border-red-800'
      : riskLevel === 'high'
      ? 'bg-amber-950/80 text-amber-400 border-amber-800'
      : 'bg-cyan-950/80 text-cyan-400 border-cyan-800';

  return (
    <div className="bg-[#14141A] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fade-in">
      {/* Top Header: System Badge, Part Name, Risk Badge */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-black uppercase tracking-wider">
              {system?.name || part.systemId}
            </span>
            <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${riskBadgeClass}`}>
              Atención: {riskLevel.toUpperCase()}
            </span>
          </div>

          {/* Observation pill if detected in scan */}
          {observationStatus === 'OBSERVED' ? (
            <span className="px-2.5 py-1 rounded-lg bg-red-600/30 border border-red-500 text-red-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span>OBSERVACIÓN EN TU COCHE</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/50 text-[10px] font-black uppercase tracking-wider">
              ARQUITECTURA DEL MODELO
            </span>
          )}
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight">
            {part.name}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-white/50 font-bold mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>{part.location || card.zone?.name || 'Vano motor'}</span>
          </div>
        </div>
      </div>

      {/* Real Scan Evidence Callout (if matching user scan report defect) */}
      {observationEvidence && (
        <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>HALLAZGO DETECTADO EN TU ESCANEO</span>
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

      {/* ============================================================ */}
      {/* SIMPLIFIED VIEW: TOCO -> MIRO -> ENTIENDO */}
      {/* ============================================================ */}
      <div className="space-y-3">
        {/* 1. ¿Qué hace? */}
        <div className="bg-black/50 p-4 rounded-2xl border border-white/5 space-y-1">
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider block">
            💡 ¿Qué hace?
          </span>
          <p className="text-sm font-bold text-white leading-relaxed">
            {basicExplanation}
          </p>
        </div>

        {/* 2. Qué comprobar (En este modelo conviene revisar) */}
        <div className="bg-black/50 p-4 rounded-2xl border border-amber-500/20 space-y-2">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
            ⚠️ En este modelo conviene revisar:
          </span>
          <div className="space-y-1.5">
            {checkPoints.map((cp, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-white/90 leading-relaxed">
                <span className="text-amber-400 font-black">•</span>
                <span>{cp}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/40 italic pt-1">
            * Información preventiva del modelo. No implica que tu unidad concreta esté averiada salvo confirmación en taller.
          </p>
        </div>

        {/* 3. Posible coste */}
        {costBreakdown && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-cyan-300 uppercase tracking-wider block">
                💰 Coste estimado de reparación
              </span>
              <span className="text-xs text-white/60 font-semibold">
                Rango {costBreakdown.totalEstimatedMin} – {costBreakdown.totalEstimatedMax} {costBreakdown.currency} (incluye taller)
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                ~{costBreakdown.totalEstimatedExpected} {costBreakdown.currency}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Toggle Expandable Full Details Button */}
      <button
        onClick={() => setShowFullDetails(!showFullDetails)}
        className="w-full py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        id="btn-toggle-part-details"
      >
        <span>{showFullDetails ? 'Ocultar detalles avanzados' : 'Ver más detalles técnicos'}</span>
        {showFullDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* ============================================================ */}
      {/* EXPANDED TECHNICAL TABS (Hidden by default for simplicity) */}
      {/* ============================================================ */}
      {showFullDetails && (
        <div className="space-y-4 pt-2 border-t border-white/10 animate-fade-in">
          {/* Level Toggle: ELI5 vs Detailed */}
          <div className="flex items-center justify-between p-1.5 rounded-2xl bg-black/60 border border-white/10">
            <span className="text-[10px] font-extrabold text-white/40 uppercase tracking-wider ml-2">
              Nivel de detalle:
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setExplanationLevel('BASIC')}
                className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  explanationLevel === 'BASIC'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Sencillo
              </button>
              <button
                onClick={() => setExplanationLevel('ADVANCED')}
                className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  explanationLevel === 'ADVANCED'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Técnico
              </button>
            </div>
          </div>

          {/* Sub-Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-black/50 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                activeTab === 'OVERVIEW'
                  ? 'bg-cyan-500 text-black font-black shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Función</span>
            </button>

            <button
              onClick={() => setActiveTab('FAILURES')}
              className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                activeTab === 'FAILURES'
                  ? 'bg-amber-500 text-black font-black shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Fallos</span>
            </button>

            <button
              onClick={() => setActiveTab('INSPECTION')}
              className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                activeTab === 'INSPECTION'
                  ? 'bg-emerald-500 text-black font-black shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Revisión</span>
            </button>

            <button
              onClick={() => setActiveTab('COST')}
              className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                activeTab === 'COST'
                  ? 'bg-purple-500 text-black font-black shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Euro className="w-3.5 h-3.5" />
              <span>Precios</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-3 text-xs animate-fade-in">
              <div className="bg-black/50 p-4 rounded-2xl border border-white/5 space-y-1.5">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider block">
                  {explanationLevel === 'BASIC' ? 'Explicación clara:' : 'Principio mecánico:'}
                </span>
                <p className="text-white/90 font-bold leading-relaxed">
                  {explanationLevel === 'BASIC' ? basicExplanation : advancedExplanation}
                </p>
              </div>

              <div className="bg-black/50 p-4 rounded-2xl border border-white/5 space-y-1.5">
                <span className="text-[10px] font-black text-white/50 uppercase tracking-wider block">
                  Función en el sistema:
                </span>
                <p className="text-white/80 font-bold leading-relaxed">
                  {part.function}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'FAILURES' && (
            <div className="space-y-3 text-xs animate-fade-in">
              {knownProblems && knownProblems.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                    Puntos críticos documentados ({knownProblems.length}):
                  </span>
                  {knownProblems.map((prob) => (
                    <div key={prob.id} className="bg-black/50 p-3.5 rounded-2xl border border-amber-500/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-white uppercase">{prob.title}</h4>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase">
                          {prob.severity}
                        </span>
                      </div>
                      <p className="text-white/80 font-bold leading-relaxed">{prob.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-black/50 p-4 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                    Modos de fallo generales:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-white/80 font-bold leading-relaxed">
                    {(part?.failureModes || []).map((fm, idx) => (
                      <li key={idx}>{fm}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'INSPECTION' && (
            <div className="space-y-3 text-xs animate-fade-in">
              {inspectionGuide?.safetyWarnings && inspectionGuide.safetyWarnings.length > 0 && (
                <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>SEGURIDAD EN TALLER</span>
                  </span>
                  <p className="text-[11px] font-bold leading-relaxed">
                    {inspectionGuide.safetyWarnings[0]}
                  </p>
                </div>
              )}

              <div className="bg-black/50 p-4 rounded-2xl border border-white/5 space-y-2">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                  Pasos de inspección recomendados:
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
            </div>
          )}

          {activeTab === 'COST' && (
            <div className="space-y-3 text-xs animate-fade-in">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-0.5">
                  <span className="text-white/40 text-[9px] uppercase font-bold block">Recambio Original OEM</span>
                  <span className="text-emerald-400 font-black text-sm">
                    {costBreakdown.partOem} {costBreakdown.currency}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-0.5">
                  <span className="text-white/40 text-[9px] uppercase font-bold block">Recambio Equivalente</span>
                  <span className="text-cyan-400 font-black text-sm">
                    {costBreakdown.partAftermarket} {costBreakdown.currency}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-0.5">
                  <span className="text-white/40 text-[9px] uppercase font-bold block">Pieza de Desguace</span>
                  <span className="text-amber-400 font-black text-sm">
                    {costBreakdown.partUsed > 0 ? `${costBreakdown.partUsed} ${costBreakdown.currency}` : 'No recom.'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-0.5">
                  <span className="text-white/40 text-[9px] uppercase font-bold block">
                    Mano de obra ({costBreakdown.laborHours}h)
                  </span>
                  <span className="text-purple-400 font-black text-sm">
                    {costBreakdown.laborCost} {costBreakdown.currency}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => onAskOche(card)}
          className="flex-1 min-h-[44px] py-3 px-4 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          id="btn-ask-oche-part"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Preguntar a OCHE sobre esta pieza</span>
        </button>

        {hasScanObservation && onViewInReport && (
          <button
            onClick={onViewInReport}
            className="min-h-[44px] py-3 px-4 rounded-2xl bg-black hover:bg-white/10 text-white/80 hover:text-white border border-white/20 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
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
