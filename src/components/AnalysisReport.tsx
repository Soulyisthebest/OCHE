import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Euro, Calculator, Wrench, Compass, BookmarkCheck, Share2, ChevronDown, ChevronUp, FileText, Info, Sparkles } from 'lucide-react';
import { CarAnalysisReport } from '../types';
import { RealCostCalculator } from './RealCostCalculator';

interface AnalysisReportProps {
  report: CarAnalysisReport;
  onSaveToGarage: (report: CarAnalysisReport) => void;
  isSaved?: boolean;
  onLaunchAssistant: () => void;
  onLaunch3D: () => void;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({
  report,
  onSaveToGarage,
  isSaved,
  onLaunchAssistant,
  onLaunch3D
}) => {
  const [showShareToast, setShowShareToast] = useState(false);
  const [activeChecklist, setActiveChecklist] = useState(report.checklist);
  const [explainingChecklistId, setExplainingChecklistId] = useState<string | null>(null);

  const toggleChecklist = (id: string) => {
    setActiveChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleShare = () => {
    const text = `🚗 CARCHECK AI - Análisis de ${report.identity.make} ${report.identity.model} (${report.score}/100): ${report.scoreLabel}. Coste Real Estimado: ${report.realCost.totalMin}€ - ${report.realCost.totalMax}€`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const badgeColorStyle =
    report.score >= 80
      ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/50 shadow-emerald-500/20'
      : report.score >= 60
      ? 'bg-amber-950/90 text-amber-400 border-amber-500/50 shadow-amber-500/20'
      : 'bg-red-950/90 text-red-400 border-red-500/50 shadow-red-500/20';

  const mainPhotos = Object.values(report.photos).filter(Boolean);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0C] text-white p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed top-20 right-4 z-50 bg-blue-500 text-black px-5 py-3 rounded-full font-black text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>¡Informe copiado al portapapeles!</span>
        </div>
      )}

      {/* Top Banner Disclaimer */}
      <div className="bg-[#16161D] border border-white/10 rounded-2xl p-4 text-xs text-white/70 flex items-center gap-3">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <p className="leading-tight font-medium">
          Aviso: {report.cannotDetermineNote || 'Este análisis es orientativo y no sustituye una inspección realizada por un mecánico profesional.'}
        </p>
      </div>

      {/* Hero Vehicle Identification & Score Badge */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Identity Card (7 cols) */}
        <div className="md:col-span-7 bg-[#16161D] border border-white/10 rounded-[32px] p-6 shadow-2xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
              CARCHECK AI • INFORME TÉCNICO
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic">
              {report.identity.make} {report.identity.model}
            </h1>

            <p className="text-sm text-blue-400 font-bold uppercase tracking-wider">
              {report.identity.generation} • {report.identity.estimatedYearMin}–{report.identity.estimatedYearMax} • {report.identity.engine} ({report.identity.powerHp} CV)
            </p>

            <p className="text-xs text-white/60 font-medium">
              {report.mileageKm ? `${report.mileageKm.toLocaleString('es-ES')} km` : 'Kilometraje estimado'} • Cambio {report.identity.transmission} • {report.identity.fuelType}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-white/5 mt-4">
            <button
              onClick={() => onSaveToGarage(report)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white hover:bg-blue-50 text-black'
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
          </div>
        </div>

        {/* High Contrast Score Badge (5 cols) */}
        <div className="md:col-span-5 bg-white text-black rounded-[32px] p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                Puntuación de Compra
              </span>
              <span className="bg-black text-white px-3 py-1 rounded-full text-[9px] font-black uppercase">
                ALGORITMO IA
              </span>
            </div>

            <div className="flex items-baseline gap-1 my-2">
              <span className="text-[80px] font-black leading-none tracking-tighter italic text-black">
                {report.score}
              </span>
              <span className="text-2xl font-black opacity-30">/100</span>
            </div>

            <div className="text-xs font-black uppercase tracking-wider text-black/80">
              {report.scoreLabel}
            </div>
          </div>

          <div className="pt-4 border-t border-black/10 mt-2 flex items-center justify-between">
            <span className="text-[10px] font-black opacity-50 uppercase">Dictamen Mecánico</span>
            <span className="text-xs font-black uppercase text-blue-600">
              {report.score >= 75 ? 'ALTA RECOMENDACIÓN' : report.score >= 50 ? 'REVISIÓN NECESARIA' : 'DESCONSEJADO'}
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

      {/* Recommendation Box */}
      {/* Recommendation Box */}
      <div className="bg-[#16161D] border-2 border-blue-500/30 rounded-[28px] p-6 shadow-2xl">
        <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          💡 NUESTRA RECOMENDACIÓN TÉCNICA
        </h3>
        <p className="text-sm text-white leading-relaxed font-bold">
          "{report.recommendation}"
        </p>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onLaunchAssistant}
          className="p-4 rounded-2xl bg-[#16161D] hover:bg-white/10 border border-white/10 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Wrench className="w-4 h-4 text-emerald-400" />
          <span>Revisar Coche</span>
        </button>

        <button
          onClick={onLaunch3D}
          className="p-4 rounded-2xl bg-[#16161D] hover:bg-white/10 border border-white/10 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Compass className="w-4 h-4 text-purple-400" />
          <span>Explorar 3D</span>
        </button>

        <button
          onClick={() => onSaveToGarage(report)}
          className={`p-4 rounded-2xl border font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isSaved
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-[#16161D] hover:bg-white/10 border-white/10 text-white'
          }`}
        >
          <BookmarkCheck className="w-4 h-4 text-blue-400" />
          <span>{isSaved ? 'Guardado ✓' : 'Guardar'}</span>
        </button>

        <button
          onClick={handleShare}
          className="p-4 rounded-2xl bg-[#16161D] hover:bg-white/10 border border-white/10 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-blue-400" />
          <span>Compartir</span>
        </button>
      </div>

      {/* REAL COST CALCULATOR SECTION */}
      <RealCostCalculator initialCost={report.realCost} repairs={report.repairs} />

      {/* Score Breakdown Category Meters */}
      <div className="bg-[#16161D] border border-white/10 rounded-[28px] p-6 shadow-2xl">
        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4">
          📊 DESGLOSE DE PUNTUACIÓN DE COMPRA
        </h3>

        <div className="space-y-4">
          {report.scoreCategories.map((cat, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-white uppercase">{cat.name}</span>
                <span className="font-black text-blue-400">{cat.score} / 100</span>
              </div>

              <div className="w-full bg-black rounded-full h-2.5 border border-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    cat.score >= 80 ? 'bg-emerald-500' : cat.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>

              <p className="text-[11px] text-white/60 font-medium">{cat.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* LO BUENO Y LO MALO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LO BUENO */}
        <div className="bg-[#16161D] border border-emerald-500/30 rounded-[28px] p-6 shadow-2xl space-y-3">
          <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            🟢 LO BUENO DE ESTE MODELO
          </h3>

          <div className="space-y-2.5">
            {report.modelProsCons
              .filter((item) => item.type === 'pro')
              .map((pro, idx) => (
                <div key={idx} className="bg-black/60 p-4 rounded-2xl border border-white/5">
                  <span className="font-black text-xs text-emerald-300 block mb-1 uppercase tracking-wider">
                    {pro.title}
                  </span>
                  <p className="text-xs text-white/80 leading-relaxed font-medium">
                    {pro.description}
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* LO MALO */}
        <div className="bg-[#16161D] border border-red-500/30 rounded-[28px] p-6 shadow-2xl space-y-3">
          <h3 className="text-xs font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            🔴 LO MALO O PUNTOS DÉBILES
          </h3>

          <div className="space-y-2.5">
            {report.modelProsCons
              .filter((item) => item.type === 'con' || item.type === 'known_issue')
              .map((con, idx) => (
                <div key={idx} className="bg-black/60 p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-xs text-red-300 uppercase tracking-wider">
                      {con.title}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      con.isModelGeneral ? 'bg-white/10 text-white/60' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {con.isModelGeneral ? 'General' : 'En Coche'}
                    </span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed font-medium">
                    {con.description}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* REPARACIONES Y GASTOS (Requirement 11) */}
      {report.repairs.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Wrench className="w-4 h-4 text-cyan-400" />
            🔧 POSIBLES GASTOS Y REPARACIONES
          </h3>

          <div className="space-y-3">
            {report.repairs.map((rep) => (
              <div key={rep.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-white">
                    {rep.partName}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    rep.priority === 'Alta'
                      ? 'bg-red-950 text-red-300 border border-red-500/30'
                      : rep.priority === 'Media'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    Prioridad {rep.priority}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300">
                  <strong className="text-slate-400">¿Qué hace?:</strong> {rep.whatItDoes}
                </p>

                <p className="text-[11px] text-slate-300">
                  <strong className="text-slate-400">Motivo:</strong> {rep.whyAttentionNeeded}
                </p>

                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-850 text-[11px] gap-2">
                  <span className="text-slate-400">
                    Pieza: {rep.costNewMin}–{rep.costNewMax} € | Mano obra: {rep.laborCostMin}–{rep.laborCostMax} €
                  </span>
                  <span className="font-mono font-bold text-cyan-300">
                    Total: {rep.totalEstimatedMin}–{rep.totalEstimatedMax} €
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHECKLIST INTERACTIVO (Requirement 12) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
          🔍 ANTES DE COMPRAR (CHECKLIST PARA ESTE MODELO)
        </h3>
        <p className="text-xs text-slate-400">
          Usa esta lista interactiva cuando estés probando el vehículo en persona:
        </p>

        <div className="space-y-2.5">
          {activeChecklist.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                item.checked
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-slate-300'
                  : 'bg-slate-950 border-slate-800 text-slate-200'
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
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {item.checked && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                  </div>

                  <div>
                    <span className={`text-xs font-bold block ${item.checked ? 'line-through text-slate-400' : 'text-white'}`}>
                      {item.task}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      Categoría: {item.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setExplainingChecklistId(explainingChecklistId === item.id ? null : item.id)
                  }
                  className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 underline flex-shrink-0"
                >
                  ¿Cómo lo compruebo?
                </button>
              </div>

              {explainingChecklistId === item.id && (
                <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs text-slate-300 leading-relaxed animate-fade-in">
                  <strong className="text-cyan-300 block mb-1">Explicación sencilla:</strong>
                  {item.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
