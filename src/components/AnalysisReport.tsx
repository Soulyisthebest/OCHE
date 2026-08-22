import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, AlertTriangle, XCircle, Wrench, BookmarkCheck,
  Share2, ChevronDown, ChevronUp, Sparkles, Copy, Check,
  MapPin, Gauge, Eye, MessageSquare, Printer, Info, HelpCircle, ArrowRight
} from 'lucide-react';
import { CarAnalysisReport } from '../types';
import { RealCostCalculator } from './RealCostCalculator';
import { WhatIfSimulator } from './WhatIfSimulator';
import { EvidenceSection } from './EvidenceSection';
import { NegotiationPlaybook } from './NegotiationPlaybook';
import { InteractiveExplanationModal, ExplanationData } from './InteractiveExplanationModal';
import { PilotFeedbackModal } from './PilotFeedbackModal';
import { CountryEngine } from '../services/CountryEngine';
import { CountryProfile } from '../types/country';
import { AnalyticsService } from '../services/AnalyticsService';
import { PilotSessionService } from '../services/PilotSessionService';
import { APP_CONFIG } from '../config/appConfig';

interface AnalysisReportProps {
  report: CarAnalysisReport;
  onSaveToGarage: (report: CarAnalysisReport) => void;
  isSaved?: boolean;
  onLaunchAssistant: () => void;
  onLaunch3D: () => void;
  countryProfile?: CountryProfile;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({
  report,
  onSaveToGarage,
  isSaved,
  onLaunchAssistant,
  onLaunch3D,
  countryProfile
}) => {
  const profile = countryProfile || CountryEngine.getCountryProfile();
  const [showShareToast, setShowShareToast] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [copiedArg, setCopiedArg] = useState(false);
  const [activeChecklist, setActiveChecklist] = useState(report.checklist || []);
  const [explanationData, setExplanationData] = useState<ExplanationData | null>(null);

  // Progressive Disclosure Toggles
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const [showChecklistDetails, setShowChecklistDetails] = useState(false);
  const [showSellerQuestions, setShowSellerQuestions] = useState(false);
  const [showEvidenceDetails, setShowEvidenceDetails] = useState(false);

  // Dual Score & Price Calculations
  const askingPrice = report.userPrice || report.realCost?.askingPrice || 9900;
  const initialProbableCost = (report.realCost?.totalMin || 10750) - askingPrice;
  const setupCost = initialProbableCost > 0 ? initialProbableCost : 850;
  const realTotalCost = askingPrice + setupCost;
  const rangeMin = Math.round(realTotalCost * 0.97 / 50) * 50;
  const rangeMax = Math.round(realTotalCost * 1.07 / 50) * 50;
  const targetOfferPrice = Math.max(1000, Math.round((askingPrice * 0.94) / 100) * 100);
  const maxAcceptablePrice = Math.max(1000, Math.round((askingPrice * 0.98) / 100) * 100);

  useEffect(() => {
    AnalyticsService.trackReportViewed(report.id, `${report.identity.make} ${report.identity.model}`);
    AnalyticsService.updatePilotSession({ reportViewed: true });
  }, [report.id, report.identity.make, report.identity.model]);

  const handleShare = async () => {
    const text = `🚗 OCHE - ${report.identity.make} ${report.identity.model} (${report.score}/100 - ${report.score >= 80 ? 'COMPRAR' : report.score >= 60 ? 'NEGOCIAR' : 'EVITAR'}). Coste Real: ${CountryEngine.formatMoney(realTotalCost, profile)}`;
    AnalyticsService.trackReportShared(report.id, 'clipboard_or_share');

    if (navigator.share) {
      try {
        await navigator.share({
          title: `OCHE - ${report.identity.make} ${report.identity.model}`,
          text: text,
          url: window.location.href
        });
        return;
      } catch {}
    }

    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {}
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const copyNegotiationArgument = () => {
    const argText = `Hola, he revisado el ${report.identity.make} ${report.identity.model}. El coche me encaja, pero revisando el desgaste de neumáticos y mantenimientos pendientes (estimados en unos ${setupCost} € en taller), mi oferta en firme para cerrar el trato rápido y sin rodeos es de ${targetOfferPrice.toLocaleString('es-ES')} €. Si te parece bien, cerramos esta misma semana.`;
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(argText).catch(() => {});
      }
    } catch {}
    setCopiedArg(true);
    setTimeout(() => setCopiedArg(false), 2500);
  };

  const toggleChecklist = (id: string) => {
    setActiveChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  // Critical Points to check before paying
  const criticalChecks = [
    {
      level: 'danger',
      title: 'Neumáticos y alineación',
      desc: 'Revisar profundidad del dibujo y desgaste irregular.',
      cost: '180–280 €',
      test: {
        type: 'HOW_TO_CHECK' as const,
        title: 'Comprobar neumáticos',
        subtitle: 'Prueba de la moneda de 1 € y tacto en banda de rodadura',
        steps: [
          '1. Introduce una moneda de 1 € en las ranuras principales del neumático.',
          '2. Si el borde dorado queda al descubierto, están por debajo del límite legal (1.6 mm) y no pasarán ITV.',
          '3. Pasa la mano por la banda: si sientes escalones ("dientes de sierra"), hay desalineación de la dirección.'
        ]
      }
    },
    {
      level: 'warning',
      title: 'Desgaste de embrague y bimasa',
      desc: 'Comprobar si patina bajo carga o retiembla en frío.',
      cost: '550–900 €',
      test: {
        type: 'HOW_TO_CHECK' as const,
        title: 'Prueba del embrague en parado',
        subtitle: 'Cómo saber si patina sin desmontar nada',
        steps: [
          '1. Pon el freno de mano con firmeza con el coche en llano.',
          '2. Mete 3ª marcha (no primera).',
          '3. Acelera suavemente a unas 1.500 rpm.',
          '4. Suelta el embrague poco a poco: el coche debe CALARSE DE GOLPE. Si sube de vueltas sin calarse, el embrague patina.'
        ]
      }
    },
    {
      level: 'warning',
      title: 'Correa de distribución y bomba',
      desc: 'Exigir factura sellada de taller por años o km.',
      cost: '450–750 €',
      test: {
        type: 'HOW_TO_CHECK' as const,
        title: 'Comprobación de la distribución',
        subtitle: 'Intervalos por tiempo y facturas',
        steps: [
          '1. Pide ver la pegatina de mantenimiento en el vano motor o la factura del taller.',
          '2. La correa se cambia habitualmente cada 5–6 años o 120.000–180.000 km (lo que antes ocurra).',
          '3. Si el vendedor dice "se cambió pero no tengo factura", descuéntalo íntegramente del precio.'
        ]
      }
    }
  ];

  const sellerQuestions = [
    `¿Tienes la factura sellada del último cambio de correa de distribución / accesorios?`,
    `¿Se ha cambiado el embrague o el volante bimasa alguna vez? ¿Retiembla en frío?`,
    `¿Cuándo se cambiaron por última vez los discos y pastillas de freno?`,
    `¿Ha pasado la última inspección técnica (${profile.inspectionSystem.name}) sin faltas graves?`
  ];

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#07090E] text-white p-4 sm:p-6 max-w-md mx-auto space-y-4 pb-28 sm:pb-12">
      {/* Explanation Modal */}
      <InteractiveExplanationModal
        data={explanationData}
        onClose={() => setExplanationData(null)}
      />

      {/* Pilot Feedback Modal */}
      <PilotFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        reportScore={report.score}
      />

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed top-20 right-4 z-50 bg-cyan-400 text-black px-4 py-2 rounded-full font-black text-xs uppercase shadow-2xl flex items-center gap-1.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>¡Informe copiado al portapapeles!</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* NIVEL 1 — LO ESENCIAL (Primer Scroll: "¿Lo compro?") */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-b from-[#141824] to-[#0D1018] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between text-xs">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-black text-[10px] uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            INFORME OCHE
          </span>

          <div className="flex items-center gap-1.5">
            <button
              id="report-save-btn"
              onClick={() => onSaveToGarage(report)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
              }`}
              title="Guardar en Garaje"
            >
              <BookmarkCheck className="w-4 h-4" />
            </button>
            <button
              id="report-share-btn"
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 cursor-pointer"
              title="Compartir"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Vehicle Identity */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {report.identity.make} {report.identity.model}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/70 mt-1 font-bold">
            <span>{report.identity.estimatedYearMin || 2018}</span>
            <span>•</span>
            <span>{report.identity.engine || '1.6 TDI'}</span>
            <span>•</span>
            <span>{report.mileageKm ? `${report.mileageKm.toLocaleString('es-ES')} km` : '120.000 km'}</span>
          </div>
        </div>

        {/* Verdict Box */}
        <div className="flex items-center gap-3.5 bg-black/50 border border-white/5 rounded-2xl p-4">
          <div className={`w-15 h-15 rounded-2xl flex flex-col items-center justify-center font-black flex-shrink-0 shadow-lg ${
            report.score >= 80
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
              : report.score >= 60
              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
              : 'bg-red-500/20 border border-red-500/40 text-red-400'
          }`}>
            <span className="text-2xl leading-none">{report.score}</span>
            <span className="text-[8px] uppercase tracking-tighter opacity-70">/100</span>
          </div>

          <div className="flex-1">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1 ${
              report.score >= 80
                ? 'bg-emerald-500 text-black'
                : report.score >= 60
                ? 'bg-amber-500 text-black'
                : 'bg-red-500 text-white'
            }`}>
              {report.score >= 80 ? '🟢 COMPRAR' : report.score >= 60 ? '🟡 NEGOCIAR' : '🔴 EVITAR'}
            </span>
            <p className="text-xs text-white/90 font-bold leading-snug">
              "{report.recommendation || 'Buen coche en general, pero hay 3 cosas que debes revisar antes de pagar.'}"
            </p>
          </div>
        </div>

        {/* Score reasons accordion */}
        <div>
          <button
            id="toggle-score-reasons-btn"
            onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <span>{showScoreBreakdown ? 'Ocultar desglose de nota' : '¿Por qué esta nota?'}</span>
            {showScoreBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showScoreBreakdown && (
            <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-xs animate-fade-in">
              <div className="flex items-center justify-between text-white/80">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Fiabilidad del modelo y motor
                </span>
                <span className="font-black text-emerald-400">85 / 100</span>
              </div>
              <div className="flex items-center justify-between text-white/80">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  Precio respecto al mercado
                </span>
                <span className="font-black text-cyan-400">78 / 100</span>
              </div>
              <div className="flex items-center justify-between text-white/80">
                <span className="flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Mantenimientos y piezas de desgaste
                </span>
                <span className="font-black text-amber-400">68 / 100</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* NIVEL 2 — COSTE REAL ESTIMADO */}
      {/* ============================================================ */}
      <div className="bg-[#0E111A] border border-cyan-500/25 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <span>💰</span>
            <span>COSTE REAL ESTIMADO</span>
          </span>
          <span className="text-[10px] text-white/50 font-bold">
            Rango: {rangeMin.toLocaleString('es-ES')}–{rangeMax.toLocaleString('es-ES')} €
          </span>
        </div>

        <div className="bg-black/50 p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
          <div className="flex justify-between text-white/70">
            <span>Precio anunciado</span>
            <span className="font-bold text-white">{askingPrice.toLocaleString('es-ES')} €</span>
          </div>
          <div className="flex justify-between text-amber-300">
            <span>+ Puesta a punto inicial estimada</span>
            <span className="font-bold">+{setupCost.toLocaleString('es-ES')} €</span>
          </div>
          <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
            <span className="font-black text-white text-sm uppercase">≈ COSTE REAL</span>
            <span className="font-black text-xl text-cyan-300">≈ {realTotalCost.toLocaleString('es-ES')} €</span>
          </div>
        </div>

        <p className="text-xs text-white/70 font-medium">
          💡 Por encima de <strong>{maxAcceptablePrice.toLocaleString('es-ES')} €</strong> te aconsejamos negociar para absorber el mantenimiento pendiente.
        </p>

        {/* Desglose desplegable */}
        <div>
          <button
            id="toggle-cost-details-btn"
            onClick={() => setShowCostBreakdown(!showCostBreakdown)}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <span>{showCostBreakdown ? 'Ocultar desglose detallado' : 'Ver desglose completo de taller'}</span>
            {showCostBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showCostBreakdown && (
            <div className="mt-3 pt-3 border-t border-white/10 space-y-4 animate-fade-in">
              <RealCostCalculator initialCost={report.realCost} repairs={report.repairs} countryProfile={profile} />
              <WhatIfSimulator report={report} countryProfile={profile} />
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* NIVEL 3 — PUNTOS CRÍTICOS (3 COSAS A REVISAR) */}
      {/* ============================================================ */}
      <div className="bg-[#0E111A] border border-white/10 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <span>⚠️</span>
            <span>3 COSAS A REVISAR ANTES DE COMPRAR</span>
          </span>
          <span className="text-[10px] text-white/40 font-bold uppercase">Prioritario</span>
        </div>

        <div className="space-y-2.5">
          {criticalChecks.map((item, idx) => (
            <div
              key={idx}
              className="bg-black/50 border border-white/5 rounded-2xl p-3.5 space-y-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <span className="text-sm mt-0.5">
                    {item.level === 'danger' ? '🔴' : '🟡'}
                  </span>
                  <div>
                    <span className="font-black text-white block text-sm">
                      {item.title}
                    </span>
                    <span className="text-white/60 text-xs">
                      {item.desc}
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-lg bg-white/5 text-amber-300 font-black text-[11px] whitespace-nowrap">
                  {item.cost}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setExplanationData(item.test)}
                className="w-full py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Wrench className="w-3 h-3" />
                <span>CÓMO COMPROBAR ESTO</span>
              </button>
            </div>
          ))}
        </div>

        {/* Checklist toggle */}
        <div>
          <button
            id="toggle-checklist-btn"
            onClick={() => setShowChecklistDetails(!showChecklistDetails)}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <span>{showChecklistDetails ? 'Ocultar lista interactiva' : 'Ver checklist paso a paso'}</span>
            {showChecklistDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showChecklistDetails && (
            <div className="mt-3 pt-3 border-t border-white/10 space-y-2 animate-fade-in">
              {activeChecklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    item.checked
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-white/60'
                      : 'bg-black/60 border-white/5 text-white'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      item.checked ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-white/20'
                    }`}
                  >
                    {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className={`text-xs font-bold ${item.checked ? 'line-through opacity-60' : ''}`}>
                    {item.task}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* NIVEL 4 — RECOMENDACIÓN Y NEGOCIACIÓN */}
      {/* ============================================================ */}
      <div className="bg-[#0E111A] border border-emerald-500/30 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <span>💬</span>
            <span>RECOMENDACIÓN & NEGOCIACIÓN</span>
          </span>
        </div>

        <p className="text-sm font-bold text-white leading-relaxed">
          "Mi recomendación: Intenta comprarlo por <strong>{targetOfferPrice.toLocaleString('es-ES')} €</strong>."
        </p>

        <div className="bg-black/50 rounded-2xl p-3.5 border border-white/5 space-y-2 text-xs">
          <div className="text-[11px] font-black uppercase text-white/60">
            2 argumentos listos para usar:
          </div>
          <div className="flex items-start gap-2 text-white/80">
            <span className="text-red-400 font-bold">•</span>
            <span><strong>Neumáticos desgastados:</strong> Requieren sustitución inmediata (~250 €).</span>
          </div>
          <div className="flex items-start gap-2 text-white/80">
            <span className="text-amber-400 font-bold">•</span>
            <span><strong>Mantenimiento pendiente:</strong> Líquidos, filtros y revisión de taller (~400 €).</span>
          </div>
        </div>

        <button
          id="copy-negotiation-arg-btn"
          type="button"
          onClick={copyNegotiationArgument}
          className="w-full py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all cursor-pointer"
        >
          {copiedArg ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>¡Texto copiado para WhatsApp/Vendedor!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 stroke-[2.5]" />
              <span>Copiar argumento para el vendedor</span>
            </>
          )}
        </button>
      </div>

      {/* ============================================================ */}
      {/* ACCIONES COMPLEMENTARIAS: 3D & GUÍAME */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          id="report-3d-btn"
          onClick={onLaunch3D}
          className="p-3.5 rounded-2xl bg-[#141824] hover:bg-[#1A2030] border border-cyan-500/30 text-left transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-xl">👀</span>
            <span className="text-[10px] font-black text-cyan-400 uppercase">3D Interactivo</span>
          </div>
          <div>
            <div className="text-xs font-black text-white">VER EN 3D</div>
            <div className="text-[10px] text-white/50 mt-0.5">Toca y señala piezas</div>
          </div>
        </button>

        <button
          id="report-guide-btn"
          onClick={onLaunchAssistant}
          className="p-3.5 rounded-2xl bg-[#141824] hover:bg-[#1A2030] border border-blue-500/30 text-left transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-xl">🔧</span>
            <span className="text-[10px] font-black text-blue-400 uppercase">In Situ</span>
          </div>
          <div>
            <div className="text-xs font-black text-white">GUÍAME PASO A PASO</div>
            <div className="text-[10px] text-white/50 mt-0.5">Prueba ruidos y embrague</div>
          </div>
        </button>
      </div>

      {/* Preguntas para el vendedor (Acordeón) */}
      <div className="bg-[#0E111A] border border-white/10 rounded-2xl p-4">
        <button
          id="toggle-seller-questions-btn"
          onClick={() => setShowSellerQuestions(!showSellerQuestions)}
          className="w-full flex items-center justify-between text-xs font-bold text-white cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>Preguntas clave para el vendedor</span>
          </span>
          {showSellerQuestions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showSellerQuestions && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-2 animate-fade-in">
            {sellerQuestions.map((q, idx) => (
              <div key={idx} className="bg-black/40 p-3 rounded-xl text-xs text-white/80 flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>"{q}"</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Banner for Real Pilot */}
      <div className="bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/20 rounded-2xl p-4 text-center space-y-2">
        <span className="text-xs font-bold text-cyan-300 block">
          ¿Te ha resultado útil esta revisión?
        </span>
        <button
          id="open-pilot-feedback-btn"
          type="button"
          onClick={() => setShowFeedbackModal(true)}
          className="px-4 py-2 rounded-xl bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 border border-cyan-400/30 text-xs font-black uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Valorar experiencia (30s)</span>
        </button>
      </div>

      {/* Legal Footer */}
      <footer className="text-center text-[10px] text-white/40 space-y-1 pt-2">
        <p>{APP_CONFIG.TRUST_DISCLAIMERS.PROFESSIONAL_INSPECTION}</p>
        <p>{APP_CONFIG.TRUST_DISCLAIMERS.ESTIMATED_COSTS}</p>
      </footer>
    </div>
  );
};

