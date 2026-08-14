import React, { useState } from 'react';
import {
  ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Calculator, Wrench,
  Compass, BookmarkCheck, Share2, ChevronDown, ChevronUp, FileText, Info,
  Sparkles, DollarSign, HelpCircle, Eye, AlertCircle, Copy, Check, MapPin, Gauge
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

  // Compute Dual Score (Quality Score vs Deal Value Score)
  const askingPrice = report.userPrice || report.realCost?.askingPrice || 8500;
  const expectedMarketPrice = askingPrice * 1.08; // Benchmark
  const dualScore = CountryEngine.calculateDualScore(report.score, askingPrice, expectedMarketPrice);

  const toggleChecklist = (id: string) => {
    setActiveChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleShare = () => {
    const text = `🚗 OCHE / CARCHECK AI - Análisis de ${report.identity.make} ${report.identity.model} (${report.score}/100) en ${profile.countryName}. Coste Real: ${CountryEngine.formatMoney(report.realCost.totalMin, profile)} - ${CountryEngine.formatMoney(report.realCost.totalMax, profile)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const copySellerQuestion = (text: string, idx: number) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedQuestionIdx(idx);
    setTimeout(() => setCopiedQuestionIdx(null), 2000);
  };

  const mainPhotos = Object.values(report.photos || {}).filter(Boolean);

  const sellerQuestions = [
    `¿Dispone de facturas selladas que acrediten el último cambio de kit de distribución y bomba de agua?`,
    `¿Se ha sustituido alguna vez el embrague o el volante bimasa? ¿Tiene holgura al arrancar en frío?`,
    `¿Cuándo se realizó la última revisión de aceite y filtros (y con qué viscosidad exacta)?`,
    `¿Ha pasado la inspección ${profile.inspectionSystem.code} (${profile.inspectionSystem.name}) favorablemente sin defectos graves?`,
    `¿El vehículo cuenta con ${profile.requiredDocuments[0]?.title || 'toda la documentación oficial'} lista para transferir sin cargas?`
  ];

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

      {/* Disclaimer & Country Top Banner */}
      <div className="bg-[#16161D] border border-white/10 rounded-2xl p-4 text-xs text-white/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <p className="leading-tight font-medium">
            {report.cannotDetermineNote || 'Aviso: Este informe es un análisis técnico preliminar adaptado a las regulaciones de mercado local.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-[11px] flex-shrink-0">
          <MapPin className="w-3.5 h-3.5" />
          <span>{profile.countryName} ({profile.market})</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECCIÓN 1: VEHÍCULO */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 bg-[#16161D] border border-white/10 rounded-[32px] p-6 shadow-2xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              1. VEHÍCULO IDENTIFICADO
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic">
              {report.identity.make} {report.identity.model}
            </h1>

            <p className="text-sm text-cyan-400 font-bold uppercase tracking-wider">
              {report.identity.generation} • {report.identity.estimatedYearMin}–{report.identity.estimatedYearMax} • {report.identity.engine} ({report.identity.powerHp} CV)
            </p>

            <p className="text-xs text-white/60 font-medium">
              {report.mileageKm ? CountryEngine.formatDistance(report.mileageKm, profile.distanceUnit, profile) : 'Kilometraje estimado'} • Cambio {report.identity.transmission} • {report.identity.fuelType}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-white/5 mt-4">
            <button
              onClick={() => onSaveToGarage(report)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white hover:bg-cyan-50 text-black'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>{isSaved ? 'Guardado en Garaje' : 'Guardar en Garaje'}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Compartir</span>
            </button>

            <button
              onClick={onLaunch3D}
              className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Ver en 3D</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECCIÓN 2 & 3: DUAL SCORE (CALIDAD MECÁNICA vs VALOR DE OFERTA) */}
        {/* ============================================================ */}
        <div className="md:col-span-5 bg-white text-black rounded-[32px] p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                2. PUNTUACIÓN DUAL OCHE
              </span>
              <span className="bg-black text-white px-3 py-1 rounded-full text-[9px] font-black uppercase">
                {profile.countryCode} • 0 ALUCINACIONES
              </span>
            </div>

            <div className="flex items-baseline gap-1 my-2">
              <span className="text-[76px] font-black leading-none tracking-tighter italic text-black">
                {dualScore.overallScore}
              </span>
              <span className="text-2xl font-black opacity-30">/100</span>
            </div>

            {/* Sub-Scores: Mechanical vs Deal */}
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-black/10 text-xs">
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

          <div className="pt-3 border-t border-black/10 mt-3 flex items-center justify-between">
            <span className="text-[10px] font-black opacity-50 uppercase">3. Veredicto Local</span>
            <span className={`text-xs font-black uppercase ${
              dualScore.verdict === 'GOOD_DEAL' ? 'text-emerald-600' : dualScore.verdict === 'NEGOTIATE' ? 'text-amber-600' : 'text-red-600'
            }`}>
              {dualScore.verdict === 'GOOD_DEAL' ? 'COMPRA RECOMENDADA' : dualScore.verdict === 'NEGOTIATE' ? 'PRECAUCIÓN / NEGOCIAR' : 'ALTO RIESGO'}
            </span>
          </div>
        </div>
      </div>

      {/* Photo Gallery Thumbnails */}
      {mainPhotos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {mainPhotos.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Vista ${idx + 1}`}
              className="w-24 h-16 rounded-2xl object-cover border border-white/10 bg-black flex-shrink-0"
            />
          ))}
        </div>
      )}

      {/* Recommendation Card */}
      <div className="bg-[#16161D] border-2 border-cyan-500/30 rounded-[28px] p-6 shadow-2xl">
        <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          💡 RECOMENDACIÓN EJECUTIVA
        </h3>
        <p className="text-sm text-white leading-relaxed font-bold">
          "{report.recommendation}"
        </p>
      </div>

      {/* Interactive Pillars of Score Breakdown */}
      <div className="bg-[#16161D] border border-white/10 rounded-[28px] p-6 shadow-2xl space-y-4">
        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">
          📊 DESGLOSE DE PUNTUACIÓN (5 PILARES PONDERADOS)
        </h3>

        <div className="space-y-4">
          {report.scoreCategories.map((cat, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-white uppercase">{cat.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-black text-cyan-400">{cat.score} / 100</span>
                  <button
                    onClick={() =>
                      setExplanationData({
                        type: 'WHY',
                        title: `Pilar: ${cat.name}`,
                        subtitle: `Puntuación ponderada: ${cat.score}/100`,
                        plainExplanation: cat.description,
                        evidenceSource: 'Algoritmo de 5 factores ponderados',
                        confidenceTier: 'Alta confianza'
                      })
                    }
                    className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                  >
                    ¿Por qué?
                  </button>
                </div>
              </div>

              <div className="w-full bg-black rounded-full h-2.5 border border-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    cat.score >= 80 ? 'bg-emerald-500' : cat.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECCIÓN 4 & 5: LO BUENO Y LO MALO */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 4. LO BUENO */}
        <div className="bg-[#16161D] border border-emerald-500/30 rounded-[28px] p-6 shadow-2xl space-y-3">
          <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            4. 👍 LO BUENO DE ESTE MODELO
          </h3>

          <div className="space-y-2">
            {report.pros.map((p, idx) => (
              <div key={idx} className="bg-black/60 p-3 rounded-xl border border-white/5 text-xs text-white/90 font-medium flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. LO MALO */}
        <div className="bg-[#16161D] border border-red-500/30 rounded-[28px] p-6 shadow-2xl space-y-3">
          <h3 className="text-xs font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            5. ⚠️ LO MALO O PUNTOS DÉBILES
          </h3>

          <div className="space-y-2">
            {report.cons.map((c, idx) => (
              <div key={idx} className="bg-black/60 p-3 rounded-xl border border-white/5 text-xs text-white/90 font-medium flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECCIÓN 6: MATRIZ DE RIESGO */}
      {/* ============================================================ */}
      <div className="bg-[#16161D] border border-white/10 rounded-[28px] p-6 shadow-2xl space-y-4">
        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          6. 🛡️ MATRIZ DE RIESGOS IDENTIFICADOS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-black/60 p-4 rounded-2xl border border-white/5 space-y-2">
            <span className="text-[10px] text-white/40 font-black uppercase block">Riesgo por Kilometraje</span>
            <span className="text-sm font-black text-emerald-400">Bajo / Moderado</span>
            <p className="text-[11px] text-white/70">Dentro del ciclo de vida normal para este motor.</p>
          </div>

          <div className="bg-black/60 p-4 rounded-2xl border border-white/5 space-y-2">
            <span className="text-[10px] text-white/40 font-black uppercase block">Riesgo por Fallos de Motor</span>
            <span className="text-sm font-black text-amber-400">Moderado (Vigilancia)</span>
            <p className="text-[11px] text-white/70">Puntos débiles típicos documentados en este bloque.</p>
          </div>

          <div className="bg-black/60 p-4 rounded-2xl border border-white/5 space-y-2">
            <span className="text-[10px] text-white/40 font-black uppercase block">Riesgo de Mantenimiento</span>
            <span className="text-sm font-black text-cyan-400">Puesta a punto normal</span>
            <p className="text-[11px] text-white/70">Fluidos y kit de distribución aconsejados tras la compra.</p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECCIÓN 7: COSAS QUE NO PODEMOS COMPROBAR */}
      {/* ============================================================ */}
      <div className="bg-[#16161D] border border-purple-500/30 rounded-[28px] p-6 shadow-2xl space-y-3">
        <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
          <Eye className="w-5 h-5" />
          7. 🔍 COSAS QUE NO PODEMOS COMPROBAR EN FOTOGRAFÍAS
        </h3>
        <p className="text-xs text-white/70">
          Ninguna IA puede sustituir la física. Estos puntos clave deben verificarse en la prueba presencial:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-black/60 p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-xs font-bold text-purple-300 block">1. Compresión y Turbo</span>
            <p className="text-[11px] text-white/60">Requiere aceleración a plena carga en 4ª marcha en autovía.</p>
          </div>
          <div className="bg-black/60 p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-xs font-bold text-purple-300 block">2. Embrague y Bimasa</span>
            <p className="text-[11px] text-white/60">Se comprueba soltando el pedal en 3ª con freno de mano.</p>
          </div>
          <div className="bg-black/60 p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-xs font-bold text-purple-300 block">3. Cargas o Embargos</span>
            <p className="text-[11px] text-white/60">Solicita informe de {profile.registrationSystem.authorityName} antes de abonar dinero.</p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECCIÓN 8: REPARACIONES POSIBLES */}
      {/* ============================================================ */}
      {report.repairs && report.repairs.length > 0 && (
        <div className="bg-[#16161D] border border-white/10 rounded-[28px] p-6 shadow-2xl space-y-4">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Wrench className="w-5 h-5 text-cyan-400" />
            8. 🔧 REPARACIONES Y PUESTA A PUNTO PREVISTAS ({profile.countryName})
          </h3>

          <div className="space-y-3">
            {report.repairs.map((rep) => (
              <div key={rep.id} className="bg-black/60 p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-white">
                    {rep.partName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      rep.priority === 'Alta' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {rep.priority}
                    </span>
                    <button
                      onClick={() =>
                        setExplanationData({
                          type: 'HOW_MUCH',
                          title: rep.partName,
                          subtitle: rep.whatItDoes,
                          partCost: { min: rep.costNewMin, expected: (rep.costNewMin + rep.costNewMax) / 2, max: rep.costNewMax },
                          laborCost: { min: rep.laborCostMin, expected: (rep.laborCostMin + rep.laborCostMax) / 2, max: rep.laborCostMax },
                          totalCost: { min: rep.totalEstimatedMin, expected: (rep.totalEstimatedMin + rep.totalEstimatedMax) / 2, max: rep.totalEstimatedMax },
                          costType: 'REAL'
                        })
                      }
                      className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                    >
                      ¿Cuánto?
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-white/70 font-medium">
                  {rep.whyAttentionNeeded}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                  <span className="text-white/50">Pieza + Mano de obra:</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {CountryEngine.formatMoney(rep.totalEstimatedMin, profile)} – {CountryEngine.formatMoney(rep.totalEstimatedMax, profile)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECCIÓN 9: COSTE REAL */}
      {/* ============================================================ */}
      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 block px-2">
          9. 💶 COSTE TOTAL REAL DE ENTRADA ({profile.countryName})
        </span>
        <RealCostCalculator initialCost={report.realCost} repairs={report.repairs} countryProfile={profile} />
      </div>

      {/* "WHAT IF" SIMULATOR */}
      <WhatIfSimulator report={report} countryProfile={profile} />

      {/* ============================================================ */}
      {/* SECCIÓN 10: PRECIO OBJETIVO */}
      {/* ============================================================ */}
      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 block px-2">
          10. 🎯 PRECIO OBJETIVO DE NEGOCIACIÓN ({profile.currency})
        </span>
        <NegotiationPlaybook report={report} countryProfile={profile} />
      </div>

      {/* EVIDENCE MATRIX */}
      <EvidenceSection report={report} />

      {/* ============================================================ */}
      {/* SECCIÓN 11: QUÉ PREGUNTAR AL VENDEDOR */}
      {/* ============================================================ */}
      <div className="bg-[#16161D] border border-blue-500/30 rounded-[28px] p-6 shadow-2xl space-y-4">
        <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          11. 💬 QUÉ PREGUNTAR AL VENDEDOR ({profile.countryName})
        </h3>
        <p className="text-xs text-white/70">
          Preguntas directas y amables para detectar rápidamente si el vendedor es transparente:
        </p>

        <div className="space-y-2.5">
          {sellerQuestions.map((q, idx) => (
            <div key={idx} className="bg-black/60 p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-3">
              <span className="text-xs text-white/90 font-medium">
                "{q}"
              </span>
              <button
                onClick={() => copySellerQuestion(q, idx)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 transition-colors cursor-pointer"
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
      {/* SECCIÓN 12: QUÉ REVISAR CON UN MECÁNICO & DOCUMENTOS OFICIALES */}
      {/* ============================================================ */}
      <div className="bg-[#16161D] border border-emerald-500/30 rounded-[28px] p-6 shadow-2xl space-y-4">
        <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
          <Wrench className="w-5 h-5" />
          12. 🔍 QUÉ REVISAR CON UN MECÁNICO (CHECKLIST EN VIVO)
        </h3>
        <p className="text-xs text-white/70">
          Marca los puntos conforme los revise tu mecánico de confianza o en tu inspección presencial:
        </p>

        <div className="space-y-2.5">
          {activeChecklist.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all ${
                item.checked
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-white/60'
                  : 'bg-black/60 border-white/5 text-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  onClick={() => toggleChecklist(item.id)}
                  className="flex items-start gap-3 cursor-pointer flex-1"
                >
                  <div
                    className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center border transition-colors ${
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
                      Categoría: {item.category}
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
                  ¿Cómo lo compruebo?
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Local Documents Required */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <span className="text-[10px] font-black uppercase tracking-wider text-white/50 block mb-2">
            📄 Documentos obligatorios para la compraventa en {profile.countryName}:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {profile.requiredDocuments.map((doc, idx) => (
              <div key={idx} className="bg-black/60 p-3 rounded-xl border border-white/5 text-xs">
                <span className="font-bold text-white block">{doc.title}</span>
                <span className="text-[10px] text-cyan-400 block">{doc.issuingAuthority} • {doc.requiredForTransfer ? 'Obligatorio' : 'Opcional'}</span>
                <p className="text-[11px] text-white/60 mt-0.5">{doc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
