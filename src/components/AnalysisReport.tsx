import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Calculator, Wrench,
  Compass, BookmarkCheck, Share2, ChevronDown, ChevronUp, FileText, Info,
  Sparkles, DollarSign, HelpCircle, Eye, AlertCircle, Copy, Check, MapPin, Gauge,
  ThumbsUp, ThumbsDown, MessageSquare, Printer
} from 'lucide-react';
import { CarAnalysisReport } from '../types';
import { RealCostCalculator } from './RealCostCalculator';
import { WhatIfSimulator } from './WhatIfSimulator';
import { EvidenceSection } from './EvidenceSection';
import { NegotiationPlaybook } from './NegotiationPlaybook';
import { InteractiveExplanationModal, ExplanationData } from './InteractiveExplanationModal';
import { CountryEngine } from '../services/CountryEngine';
import { CountryProfile, CountryCode } from '../types/country';
import { LocalizationService } from '../services/LocalizationService';
import { AnalyticsService } from '../services/AnalyticsService';
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
  const [copiedQuestionIdx, setCopiedQuestionIdx] = useState<number | null>(null);
  const [activeChecklist, setActiveChecklist] = useState(report.checklist || []);
  const [explanationData, setExplanationData] = useState<ExplanationData | null>(null);
  
  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState<'helpful' | 'not_helpful' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Compute Dual Score (Quality Score vs Deal Value Score)
  const askingPrice = report.userPrice || report.realCost?.askingPrice || 8500;
  const expectedMarketPrice = askingPrice * 1.08; // Benchmark
  const dualScore = CountryEngine.calculateDualScore(report.score, askingPrice, expectedMarketPrice);

  const toggleChecklist = (id: string) => {
    setActiveChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  useEffect(() => {
    AnalyticsService.trackReportViewed(report.id, `${report.identity.make} ${report.identity.model}`);
    AnalyticsService.updatePilotSession({ reportViewed: true });
  }, [report.id, report.identity.make, report.identity.model]);

  const handleShare = async () => {
    const text = `🚗 OCHE / CARCHECK AI - Análisis de ${report.identity.make} ${report.identity.model} (${report.score}/100) en ${profile.countryName}. Coste Real: ${CountryEngine.formatMoney(report.realCost.totalMin, profile)} - ${CountryEngine.formatMoney(report.realCost.totalMax, profile)}`;
    
    AnalyticsService.trackReportShared(report.id, 'clipboard_or_share');
    AnalyticsService.updatePilotSession({ shareClicked: true });

    if (navigator.share) {
      try {
        await navigator.share({
          title: `OCHE - ${report.identity.make} ${report.identity.model}`,
          text: text,
          url: window.location.href
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {
      // Ignore clipboard permission errors in iframe
    }
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const copySellerQuestion = (text: string, idx: number) => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {
      // Ignore clipboard permission errors in iframe
    }
    setCopiedQuestionIdx(idx);
    setTimeout(() => setCopiedQuestionIdx(null), 2000);
  };

  const handleFeedbackSubmit = (rating: 'helpful' | 'not_helpful') => {
    setFeedbackRating(rating);
    AnalyticsService.trackFeedback(report.id, rating, feedbackText);
    AnalyticsService.updatePilotSession({
      feedbackSubmitted: {
        helpful: rating === 'helpful',
        comment: feedbackText.trim() || undefined,
        timestamp: new Date().toISOString()
      }
    });
    setFeedbackSubmitted(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const mainPhotos = Object.values(report.photos || {}).filter(Boolean);

  const sellerQuestions = [
    `¿Dispone de facturas selladas que acrediten el último cambio de kit de distribución y bomba de agua?`,
    `¿Se ha sustituido alguna vez el embrague o el volante bimasa? ¿Tiene holgura al arrancar en frío?`,
    `¿Cuándo se realizó la última revisión de aceite y filtros (y con qué viscosidad exacta)?`,
    `¿Ha pasado la inspección ${profile.inspectionSystem.code} (${profile.inspectionSystem.name}) favorablemente sin defectos graves?`,
    `¿El vehículo cuenta con ${profile.requiredDocuments[0]?.title || 'toda la documentación oficial'} lista para transferir sin cargas?`
  ];

  // Concise key reasons for the recommendation (max 3-5)
  const keyReasons = [
    report.score >= 75
      ? `Fiabilidad global alta del bloque ${report.identity?.engine || 'motor'} con buen historial de mantenimiento.`
      : `Bloque motor con puntos críticos documentados que requieren inspección exhaustiva.`,
    `Precio anunciado (${askingPrice.toLocaleString('es-ES')} €) ${dualScore.dealScore >= 70 ? 'se sitúa en rango razonable' : 'debe negociarse para absorber puesta a punto'}.`,
    `Inversión total inicial estimada de puesta a punto entre ${CountryEngine.formatMoney(report.realCost?.totalMin || 0, profile)} y ${CountryEngine.formatMoney(report.realCost?.totalMax || 0, profile)}.`,
    report.repairs && report.repairs.length > 0
      ? `Se detectan ${report.repairs.length} elementos de desgaste prioritarios a verificar en taller.`
      : `Sin averías estructurales graves detectadas en los puntos revisados.`
  ];

  // Safely extract pros and cons with fallback support
  const prosList: string[] =
    (report as any).pros ||
    (report.modelProsCons
      ? report.modelProsCons.filter((p) => p.type === 'pro').map((p) => p.title)
      : []) ||
    [];

  if (prosList.length === 0) {
    if (report.score >= 75) {
      prosList.push('Mecánica contrastada con amplia disponibilidad de repuestos');
      prosList.push('Mantenimiento periódico asequible en talleres multimarca');
      prosList.push('Consumo y emisiones equilibrados para su categoría');
    } else {
      prosList.push('Disponibilidad regular de recambios y consumibles en el mercado');
      prosList.push('Arquitectura mecánica conocida por la mayoría de talleres');
    }
  }

  const consList: string[] =
    (report as any).cons ||
    (report.modelProsCons
      ? report.modelProsCons
          .filter((p) => p.type === 'con' || p.type === 'known_issue')
          .map((p) => p.title)
      : []) ||
    [];

  if (consList.length === 0) {
    if (report.score < 80) {
      consList.push('Requiere verificación rigurosa de facturas de mantenimiento preventivo');
      consList.push('Desgaste por kilometraje acumulado a revisar en elevador');
    } else {
      consList.push('Vigilancia de desgastes habituales por edad y kilometraje');
    }
  }

  return (
    <div className={`min-h-[calc(100vh-4rem)] bg-[#0A0A0C] text-white p-4 sm:p-6 max-w-5xl mx-auto space-y-8 animate-fade-in ${profile.direction === 'rtl' ? 'rtl' : 'ltr'}`}>
      {/* Explanation Modal */}
      <InteractiveExplanationModal
        data={explanationData}
        onClose={() => setExplanationData(null)}
      />

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed top-20 right-4 z-50 bg-cyan-400 text-black px-5 py-3 rounded-full font-black text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>¡Informe copiado al portapapeles!</span>
        </div>
      )}

      {/* Top Metadata & Origin Mode Badge */}
      <div className="bg-[#16161D] border border-white/10 rounded-2xl p-4 text-xs text-white/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <p className="leading-tight font-medium">
            {report.cannotDetermineNote || APP_CONFIG.TRUST_DISCLAIMERS.PROFESSIONAL_INSPECTION}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          {report.id.startsWith('sample-') || report.id.startsWith('demo-') ? (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-black text-[10px] uppercase">
              MODO DEMO
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-black text-[10px] uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              ANÁLISIS IA (ALTA CONFIANZA)
            </span>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white font-bold text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>{profile.countryName}</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECCIÓN 1: TU COCHE + PRECIO + VALORACIÓN (CORE HERO) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Car Details & Actions (7 cols) */}
        <div className="md:col-span-7 bg-[#16161D] border border-white/10 rounded-[32px] p-6 shadow-2xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                🚗 TU COCHE
              </div>
              <span className="text-xs text-white/40 font-mono">ID: {report.id.slice(0, 10)}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic">
              {report.identity.make} {report.identity.model}
            </h1>

            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-300 rounded-lg border border-cyan-500/20">
                {report.identity.generation || 'Generación actual'}
              </span>
              <span className="px-2.5 py-1 bg-white/5 text-white/80 rounded-lg border border-white/10">
                {report.identity.estimatedYearMin}–{report.identity.estimatedYearMax}
              </span>
              <span className="px-2.5 py-1 bg-white/5 text-white/80 rounded-lg border border-white/10">
                {report.identity.engine || 'Motor térmico'} ({report.identity.powerHp || 'N/D'} CV)
              </span>
              <span className="px-2.5 py-1 bg-white/5 text-white/80 rounded-lg border border-white/10">
                {report.identity.fuelType} • {report.identity.transmission}
              </span>
            </div>

            <div className="pt-2 flex items-center gap-4 text-xs text-white/70">
              <div>
                <span className="text-white/40 block text-[10px] uppercase font-black">Kilómetros</span>
                <span className="font-bold text-white text-sm">
                  {report.mileageKm ? CountryEngine.formatDistance(report.mileageKm, profile.distanceUnit, profile) : 'Estimados'}
                </span>
              </div>
              <div className="border-l border-white/10 pl-4">
                <span className="text-white/40 block text-[10px] uppercase font-black">Precio Anunciado</span>
                <span className="font-black text-emerald-400 text-sm">
                  {askingPrice.toLocaleString('es-ES')} €
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons (>44px touch targets) */}
          <div className="flex flex-wrap items-center gap-2.5 pt-6 border-t border-white/5 mt-4">
            <button
              onClick={() => onSaveToGarage(report)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white hover:bg-cyan-50 text-black'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>{isSaved ? 'Guardado' : 'Guardar'}</span>
            </button>

            <button
              onClick={handleShare}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Compartir</span>
            </button>

            <button
              onClick={handlePrint}
              className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white/80 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Imprimir informe"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onLaunch3D}
              className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg hover:shadow-cyan-400/20 flex items-center gap-2 transition-all cursor-pointer ml-auto active:scale-95"
              id="btn-report-view-3d"
            >
              <Eye className="w-4 h-4" />
              <span>👀 VER EL COCHE</span>
            </button>
          </div>
        </div>

        {/* Right Column: Score & Recommendation Badge (5 cols) */}
        <div className="md:col-span-5 bg-white text-black rounded-[32px] p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                🎯 VALORACIÓN OCHE
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                dualScore.verdict === 'GOOD_DEAL' ? 'bg-emerald-600 text-white' : dualScore.verdict === 'NEGOTIATE' ? 'bg-amber-500 text-black' : 'bg-red-600 text-white'
              }`}>
                {dualScore.verdict === 'GOOD_DEAL' ? 'COMPRA RECOMENDADA' : dualScore.verdict === 'NEGOTIATE' ? 'NEGOCIAR' : 'ALTO RIESGO'}
              </span>
            </div>

            <div className="flex items-baseline gap-1 my-3">
              <span className="text-[72px] sm:text-[80px] font-black leading-none tracking-tighter italic text-black">
                {dualScore.overallScore}
              </span>
              <span className="text-2xl font-black opacity-30">/100</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/10 text-xs">
              <div className="bg-black/5 p-2.5 rounded-xl">
                <span className="text-[10px] font-bold text-black/50 block uppercase">Calidad Mecánica</span>
                <span className="text-base font-black text-black">{dualScore.vehicleQualityScore} / 100</span>
              </div>
              <div className="bg-black/5 p-2.5 rounded-xl">
                <span className="text-[10px] font-bold text-black/50 block uppercase">Valor de la Oferta</span>
                <span className="text-base font-black text-black">{dualScore.dealScore} / 100</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-black/10 mt-3 text-[11px] text-black/70 font-semibold">
            {report.recommendation}
          </div>
        </div>
      </div>

      {/* Photo Gallery Thumbnails if available */}
      {mainPhotos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {mainPhotos.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Foto ${idx + 1}`}
              className="w-24 h-16 rounded-xl object-cover border border-white/10 bg-black flex-shrink-0"
            />
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* 🤔 ¿MERECE LA PENA? & ¿POR QUÉ? (SECTION 7 USER SPEC) */}
      {/* ============================================================ */}
      <div className="bg-[#16161D] border-2 border-cyan-400/30 rounded-[28px] p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <span>🤔</span>
            <span>¿MERECE LA PENA COMPRAR ESTE COCHE?</span>
          </h3>
          <span className="text-[10px] text-white/40 font-bold uppercase">
            3-5 MOTIVOS CLAVE
          </span>
        </div>

        <p className="text-sm text-white leading-relaxed font-bold">
          "{report.recommendation}"
        </p>

        <div className="space-y-2 pt-2 border-t border-white/5">
          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 block">
            ¿POR QUÉ? (ANÁLISIS DE FACTORES DETERMINANTES):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {keyReasons.map((reason, idx) => (
              <div key={idx} className="bg-black/60 p-3 rounded-xl border border-white/5 text-xs text-white/80 flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 🟢 LO BUENO & 🟠 LO QUE HAY QUE COMPROBAR & 🔴 RIESGOS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 🟢 LO BUENO */}
        <div className="bg-[#16161D] border border-emerald-500/30 rounded-[24px] p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>🟢 LO BUENO</span>
          </h3>

          <div className="space-y-2">
            {prosList.map((p, idx) => (
              <div key={idx} className="bg-black/60 p-3 rounded-xl border border-white/5 text-xs text-white/90 font-medium flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 🟠 LO QUE HAY QUE COMPROBAR (ATENCIÓN) */}
        <div className="bg-[#16161D] border border-amber-500/30 rounded-[24px] p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>🟠 LO QUE HAY QUE COMPROBAR</span>
          </h3>

          <div className="space-y-2">
            {consList.map((c, idx) => (
              <div key={idx} className="bg-black/60 p-3 rounded-xl border border-white/5 text-xs text-white/90 font-medium flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 🔴 RIESGOS */}
        <div className="bg-[#16161D] border border-red-500/30 rounded-[24px] p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            <span>🔴 RIESGOS CRÍTICOS</span>
          </h3>

          <div className="space-y-2">
            <div className="bg-black/60 p-3 rounded-xl border border-white/5 text-xs space-y-1">
              <span className="text-red-400 font-bold block">Averías endémicas del modelo:</span>
              <p className="text-[11px] text-white/70">
                Puntos de vigilancia documentados en este bloque motor (distribución, inyección, FAP).
              </p>
            </div>
            <div className="bg-black/60 p-3 rounded-xl border border-white/5 text-xs space-y-1">
              <span className="text-red-400 font-bold block">Desgaste por kilometraje:</span>
              <p className="text-[11px] text-white/70">
                Revisar historial de facturas selladas para descartar afeitado de odómetro.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ⚪ NO SE PUEDE DETERMINAR (SECTION 9 USER SPEC) */}
      {/* ============================================================ */}
      <div className="bg-[#16161D] border border-purple-500/30 rounded-[24px] p-5 shadow-xl space-y-3">
        <h3 className="text-xs font-black text-purple-300 uppercase tracking-widest flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <span>⚪ COSAS QUE NO SE PUEDEN DETERMINAR POR FOTO (REQUERIRÁN REVISIÓN MECÁNICA)</span>
        </h3>
        <p className="text-xs text-white/70">
          La IA no sustituye una prueba dinámica en carretera ni la inspección en elevador:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="bg-black/60 p-3 rounded-xl border border-white/5 text-xs">
            <span className="font-bold text-purple-300 block mb-1">1. Compresión y Turbo</span>
            <p className="text-[11px] text-white/60">Comprobar aceleración sostenida en marcha larga en autovía.</p>
          </div>
          <div className="bg-black/60 p-3 rounded-xl border border-white/5 text-xs">
            <span className="font-bold text-purple-300 block mb-1">2. Embrague y Bimasa</span>
            <p className="text-[11px] text-white/60">Verificar ruidos metálicos al ralentí y tacto del pedal.</p>
          </div>
          <div className="bg-black/60 p-3 rounded-xl border border-white/5 text-xs">
            <span className="font-bold text-purple-300 block mb-1">3. Cargas y Embargos</span>
            <p className="text-[11px] text-white/60">Solicitar informe en {profile.registrationSystem.authorityName} antes de transferir.</p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 💰 COSTE POTENCIAL TOTAL REAL & REPARACIONES PREVISTAS */}
      {/* ============================================================ */}
      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 block px-2">
          💰 COSTE TOTAL REAL DE ENTRADA ({profile.countryName})
        </span>
        <RealCostCalculator initialCost={report.realCost} repairs={report.repairs} countryProfile={profile} />
      </div>

      {/* What If Simulator */}
      <WhatIfSimulator report={report} countryProfile={profile} />

      {/* ============================================================ */}
      {/* 🎯 PRECIO QUE INTENTARÍA PAGAR (NEGOTIATION PLAYBOOK) */}
      {/* ============================================================ */}
      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 block px-2">
          🎯 PRECIO QUE INTENTARÍA PAGAR ({profile.currency})
        </span>
        <NegotiationPlaybook report={report} countryProfile={profile} />
      </div>

      {/* EVIDENCE MATRIX */}
      <EvidenceSection report={report} />

      {/* ============================================================ */}
      {/* 👀 EXPLORACIÓN 3D INTERACTIVA DEL COCHE — FASE 17 */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-indigo-950/40 border-2 border-cyan-500/30 rounded-[28px] p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EXPLORACIÓN INTERACTIVA DEL MODELO</span>
          </span>
          <h3 className="text-xl font-black text-white uppercase italic tracking-tight">
            👀 Ver y explorar este {report.identity.make} {report.identity.model}
          </h3>
          <p className="text-xs text-white/70 font-medium leading-relaxed">
            Gira 360º, explora el motor y toca cada pieza para saber qué hace, qué conviene comprobar y el coste estimado de reparación.
          </p>
        </div>
        <button
          onClick={onLaunch3D}
          className="min-h-[48px] px-6 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider shadow-xl flex items-center gap-2 transition-all active:scale-95 flex-shrink-0 cursor-pointer"
          id="btn-callout-view-3d"
        >
          <Eye className="w-4 h-4" />
          <span>VER EL COCHE</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 💬 QUÉ PREGUNTAR AL VENDEDOR */}
      {/* ============================================================ */}
      <div className="bg-[#16161D] border border-blue-500/30 rounded-[28px] p-6 shadow-2xl space-y-4">
        <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          💬 QUÉ PREGUNTAR AL VENDEDOR ({profile.countryName})
        </h3>
        <p className="text-xs text-white/70">
          Preguntas directas y amables para evaluar rápidamente la transparencia del vendedor:
        </p>

        <div className="space-y-2.5">
          {sellerQuestions.map((q, idx) => (
            <div key={idx} className="bg-black/60 p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-3">
              <span className="text-xs text-white/90 font-medium">
                "{q}"
              </span>
              <button
                onClick={() => copySellerQuestion(q, idx)}
                className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 transition-colors cursor-pointer"
              >
                {copiedQuestionIdx === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* CHECKLIST EN VIVO Y DOCUMENTOS OBLIGATORIOS */}
      {/* ============================================================ */}
      <div className="bg-[#16161D] border border-emerald-500/30 rounded-[28px] p-6 shadow-2xl space-y-4">
        <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
          <Wrench className="w-5 h-5" />
          🔍 QUÉ REVISAR CON UN MECÁNICO (CHECKLIST EN VIVO)
        </h3>

        <div className="space-y-2">
          {activeChecklist.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                item.checked
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-white/60'
                  : 'bg-black/60 border-white/5 text-white'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div
                  onClick={() => toggleChecklist(item.id)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-h-[44px]"
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      item.checked
                        ? 'bg-emerald-500 border-emerald-400 text-black'
                        : 'border-white/20 bg-black'
                    }`}
                  >
                    {item.checked && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                  </div>

                  <div>
                    <span className={`text-xs font-bold block ${item.checked ? 'line-through text-white/40' : 'text-white'}`}>
                      {item.task}
                    </span>
                    <span className="text-[10px] text-white/40 font-semibold">
                      {item.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setExplanationData({
                      type: 'HOW_TO_CHECK',
                      title: item.task,
                      steps: [item.explanation, 'Verifica con linterna que no existan rezumes activos de fluidos.']
                    })
                  }
                  className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 underline flex-shrink-0 cursor-pointer"
                >
                  ¿Cómo comprobarlo?
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* FEEDBACK MECANISMO LOCAL — FASE 12 PILOTO */}
      {/* ============================================================ */}
      <div className="bg-[#16161D] border border-white/10 rounded-[28px] p-6 shadow-2xl space-y-3 text-center">
        <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400">
          ¿Te ha ayudado OCHE?
        </h4>
        <p className="text-xs text-white/60 max-w-md mx-auto">
          Tu valoración nos ayuda a calibrar la precisión del análisis (guardado localmente en esta sesión sin envío a terceros).
        </p>

        {feedbackSubmitted ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-2xl text-xs font-bold inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>¡Gracias por tu opinión! Registrado en esta sesión.</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => handleFeedbackSubmit('helpful')}
                className={`min-h-[44px] px-5 py-2.5 rounded-xl text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  feedbackRating === 'helpful' ? 'bg-emerald-600 ring-2 ring-emerald-400' : 'bg-white/10 hover:bg-emerald-600'
                }`}
              >
                <ThumbsUp className="w-4 h-4 text-emerald-400" />
                <span>👍 Sí</span>
              </button>

              <button
                onClick={() => handleFeedbackSubmit('not_helpful')}
                className={`min-h-[44px] px-5 py-2.5 rounded-xl text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  feedbackRating === 'not_helpful' ? 'bg-red-600 ring-2 ring-red-400' : 'bg-white/10 hover:bg-red-600'
                }`}
              >
                <ThumbsDown className="w-4 h-4 text-red-400" />
                <span>👎 No</span>
              </button>
            </div>

            <div className="w-full max-w-sm flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="¿Qué mejorarías? (opcional)"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => handleFeedbackSubmit(feedbackRating || 'helpful')}
                className="min-h-[40px] px-3.5 py-2 bg-white/10 hover:bg-cyan-400 hover:text-black rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Enviar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Trust & Legal Disclaimers Footer */}
      <footer className="pt-6 border-t border-white/10 text-center space-y-1 text-xs text-white/40 font-medium">
        <p>{APP_CONFIG.TRUST_DISCLAIMERS.PROFESSIONAL_INSPECTION}</p>
        <p>{APP_CONFIG.TRUST_DISCLAIMERS.ESTIMATED_COSTS}</p>
      </footer>
    </div>
  );
};
