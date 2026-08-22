import React, { useState } from 'react';
import {
  Camera, Zap, BookmarkCheck, ChevronRight,
  Sparkles, Wrench, ShieldCheck, ArrowRight
} from 'lucide-react';
import { SAMPLE_DEMO_CARS, SampleDemoCar } from '../data/sampleCars';
import { AnalyticsService } from '../services/AnalyticsService';
import { CarAnalysisReport } from '../types';

interface HeroHomeProps {
  onStartScan: (mode?: 'quick' | 'full') => void;
  onNavigate: (view: string) => void;
  onSelectSample: (sample: SampleDemoCar) => void;
  onQuickStartWithData?: (data: { make?: string; model?: string; price?: number; mileage?: number; year?: number }) => void;
  savedCount: number;
  lastReport?: CarAnalysisReport | null;
}

export const HeroHome: React.FC<HeroHomeProps> = ({
  onStartScan,
  onNavigate,
  onSelectSample,
  onQuickStartWithData,
  savedCount,
  lastReport
}) => {
  const [quickInputOpen, setQuickInputOpen] = useState(false);
  const [carName, setCarName] = useState('');
  const [price, setPrice] = useState('');
  const [mileage, setMileage] = useState('');
  const [year, setYear] = useState('');

  // Use real last report if available, else first demo car only if user requests
  const recentReport = lastReport || null;

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    AnalyticsService.track('quick_check_started', {
      carName: carName || 'unknown',
      price: price ? Number(price) : 0,
      mileage: mileage ? Number(mileage) : 0
    });

    if (onQuickStartWithData) {
      onQuickStartWithData({
        make: carName.split(' ')[0],
        model: carName.split(' ').slice(1).join(' '),
        price: price ? parseInt(price, 10) : undefined,
        mileage: mileage ? parseInt(mileage, 10) : undefined,
        year: year ? parseInt(year, 10) : undefined
      });
    } else {
      onStartScan('quick');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#07090E] text-white flex flex-col justify-between p-4 sm:p-6 pb-24 sm:pb-8">
      <div className="max-w-md mx-auto w-full space-y-6 my-auto">
        
        {/* Simple friendly header */}
        <div className="text-center pt-2 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tu mecánico en el bolsillo</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            ¿Comprar, negociar o salir corriendo?
          </h1>
          <p className="text-white/60 text-sm leading-relaxed font-medium">
            Haz fotos al coche usado o introduce sus datos para saber su estado real, averías típicas y precio justo.
          </p>
        </div>

        {/* ============================================================ */}
        {/* PRIMARY ACTION: [ ANALIZAR COCHE ] */}
        {/* ============================================================ */}
        <div className="space-y-3">
          <button
            id="home-main-scan-btn"
            onClick={() => {
              AnalyticsService.trackScanStarted(0, 'full');
              onStartScan('full');
            }}
            className="w-full group relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 p-5 sm:p-6 text-black font-black text-left shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-black/15 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                📷
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                  ANALIZAR COCHE
                </div>
                <div className="text-xs text-black/80 font-bold mt-0.5">
                  Fotos guiadas: exterior, motor e interior
                </div>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-black/15 flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-black stroke-[3]" />
            </div>
          </button>

          {/* SECONDARY ACTION: [ VER MIS ANÁLISIS ] */}
          {savedCount > 0 && (
            <button
              id="home-saved-garage-btn"
              onClick={() => onNavigate('garage')}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#11141E] hover:bg-[#161B28] border border-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2.5">
                <BookmarkCheck className="w-4 h-4 text-cyan-400" />
                <span>Ver mis análisis guardados</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-black text-[11px]">
                {savedCount} {savedCount === 1 ? 'coche' : 'coches'}
              </span>
            </button>
          )}

          {/* QUICK FORM ACCORDION: [ + INTRODUCIR DATOS MANUALES ] */}
          <div className="bg-[#0E111A] border border-white/10 rounded-2xl p-4 transition-all">
            <button
              id="home-quick-data-toggle"
              onClick={() => setQuickInputOpen(!quickInputOpen)}
              className="w-full flex items-center justify-between text-left cursor-pointer focus:outline-none"
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  O analizar con datos del anuncio
                </span>
              </div>
              <span className="text-xs font-bold text-cyan-400">
                {quickInputOpen ? 'Cerrar' : '+ Escribir'}
              </span>
            </button>

            {quickInputOpen && (
              <form onSubmit={handleQuickSubmit} className="mt-4 pt-3 border-t border-white/10 space-y-3 animate-fade-in">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 block mb-1">
                    Marca y Modelo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Volkswagen Golf 1.6 TDI"
                    value={carName}
                    onChange={(e) => setCarName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090E] border border-white/15 text-white text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 block mb-1">
                      Precio Anunciado (€)
                    </label>
                    <input
                      type="number"
                      placeholder="Ej: 9900"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090E] border border-white/15 text-white text-sm focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 block mb-1">
                      Kilómetros
                    </label>
                    <input
                      type="number"
                      placeholder="Ej: 145000"
                      value={mileage}
                      onChange={(e) => setMileage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090E] border border-white/15 text-white text-sm focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="home-quick-submit-btn"
                  className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Analizar este coche
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* ÚLTIMO ANÁLISIS (ÚNICAMENTE SI EXISTE) */}
        {/* ============================================================ */}
        {recentReport ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white/50 uppercase tracking-wider px-1">
              <span>Último coche analizado</span>
              <span className="text-cyan-400">Ver informe</span>
            </div>

            <div
              id="home-recent-report-card"
              onClick={() => onNavigate('report')}
              className="bg-gradient-to-b from-[#141824] to-[#0D1018] border border-white/10 hover:border-cyan-500/50 rounded-2xl p-4 transition-all cursor-pointer active:scale-[0.99] shadow-lg flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black ${
                  recentReport.score >= 80
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                    : recentReport.score >= 60
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                    : 'bg-red-500/15 border border-red-500/30 text-red-400'
                }`}>
                  <span className="text-base leading-none">{recentReport.score}</span>
                  <span className="text-[8px] uppercase tracking-tighter opacity-70">/100</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-white text-base">
                      {recentReport.identity.make} {recentReport.identity.model}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      recentReport.score >= 80
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : recentReport.score >= 60
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {recentReport.score >= 80 ? '🟢 COMPRAR' : recentReport.score >= 60 ? '🟡 NEGOCIAR' : '🔴 EVITAR'}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-0.5">
                    {recentReport.identity.estimatedYearMin || 2018} · {recentReport.identity.engine || 'Motor'} · ≈ {recentReport.realCost?.totalMin?.toLocaleString('es-ES') || 9500} € coste real
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-white/40" />
            </div>
          </div>
        ) : (
          /* Subtle Demo Sample Pills when no report exists yet */
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/40 block px-1">
              O probar con un ejemplo:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_DEMO_CARS.slice(0, 2).map((demo) => (
                <button
                  key={demo.id}
                  id={`sample-pill-${demo.id}`}
                  onClick={() => onSelectSample(demo)}
                  className="p-2.5 rounded-xl bg-[#0E111A] hover:bg-[#151A27] border border-white/5 hover:border-cyan-400/40 text-left transition-all cursor-pointer"
                >
                  <div className="text-xs font-black text-white truncate">
                    {demo.report.identity.make} {demo.report.identity.model}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-bold mt-0.5">
                    {demo.report.score}/100 • {demo.report.score >= 80 ? '🟢 Comprar' : '🟡 Negociar'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* IN-SITU "GUÍAME" COMPANION */}
        <div
          id="home-in-situ-guide-card"
          onClick={() => onNavigate('assistant')}
          className="bg-gradient-to-r from-blue-950/30 to-cyan-950/20 border border-cyan-500/20 hover:border-cyan-500/40 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-white">
                ¿Estás delante del coche?
              </div>
              <div className="text-[11px] text-white/60">
                Usa "Guíame": comprobaciones físicas paso a paso
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-cyan-400" />
        </div>

      </div>
    </div>
  );
};

