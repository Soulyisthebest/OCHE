import React, { useState } from 'react';
import {
  Camera, Zap, Compass, ShieldCheck, Sparkles, CheckCircle2,
  Car, AlertTriangle, ArrowRight, Gauge, Euro, Calendar, Info
} from 'lucide-react';
import { SAMPLE_DEMO_CARS, SampleDemoCar } from '../data/sampleCars';
import { APP_CONFIG } from '../config/appConfig';
import { AnalyticsService } from '../services/AnalyticsService';

interface HeroHomeProps {
  onStartScan: (mode?: 'quick' | 'full') => void;
  onNavigate: (view: string) => void;
  onSelectSample: (sample: SampleDemoCar) => void;
  onQuickStartWithData?: (data: { make?: string; model?: string; price?: number; mileage?: number; year?: number }) => void;
  savedCount: number;
}

export const HeroHome: React.FC<HeroHomeProps> = ({
  onStartScan,
  onNavigate,
  onSelectSample,
  onQuickStartWithData,
  savedCount
}) => {
  const [quickInputOpen, setQuickInputOpen] = useState(false);
  const [carName, setCarName] = useState('');
  const [price, setPrice] = useState('');
  const [mileage, setMileage] = useState('');
  const [year, setYear] = useState('');

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
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0C] text-white flex flex-col justify-between relative overflow-hidden p-4 sm:p-8">
      <main className="max-w-6xl mx-auto w-full flex-1 flex flex-col justify-between space-y-6">
        
        {/* Header Eyebrow & Hero Title */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h2 className="text-cyan-400 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>OCHE / CARCHECK AI • ASISTENTE DE COMPRA DE COCHES USADOS</span>
            </h2>
            {APP_CONFIG.REAL_TEST_MODE && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                🧪 MODO TEST ACTIVO
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            ¿Vas a comprar un coche?
          </h1>
          <p className="text-white/60 text-sm sm:text-base mt-1 max-w-2xl font-medium">
            Analiza el estado, averías endémicas del modelo, coste real de puesta a punto y precio justo antes de pagar.
          </p>
        </div>

        {/* Primary Action Choices: Quick vs Full Scan */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto">
          {/* Main 2 Scan Modes (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Mode A: Guided Photo Scan */}
            <div
              onClick={() => {
                AnalyticsService.trackScanStarted(0, 'full');
                onStartScan('full');
              }}
              className="group relative bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-900 rounded-[28px] p-6 sm:p-8 border-2 border-white/10 overflow-hidden transition-all hover:scale-[1.01] hover:border-cyan-400 shadow-2xl cursor-pointer"
            >
              <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-cyan-300">
                🔎 MODO COMPLETO
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  📸
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white">
                    ESCANEAR COCHE CON FOTOS
                  </h3>
                  <p className="text-xs sm:text-sm text-cyan-100 font-bold">
                    Guía paso a paso: frontal, lateral, interior y cuadro
                  </p>
                </div>
              </div>
              <p className="text-xs text-white/80 max-w-md">
                Detecta daños visibles, desgaste de componentes, averías mecánicas documentadas del motor y cálculo del coste total real.
              </p>
            </div>

            {/* Mode B: Quick Check (Fast input) */}
            <div className="bg-[#16161D] border border-white/10 rounded-[24px] p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white uppercase tracking-tight">
                      ⚡ MODO RÁPIDO (QUICK CHECK)
                    </h4>
                    <p className="text-[11px] text-white/50">
                      ¿Tienes los datos del anuncio? Análisis inmediato en 30 segundos
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setQuickInputOpen(!quickInputOpen)}
                  className="text-xs font-black text-cyan-400 hover:text-cyan-300 uppercase underline cursor-pointer"
                >
                  {quickInputOpen ? 'Ocultar' : 'Introducir datos'}
                </button>
              </div>

              {quickInputOpen && (
                <form onSubmit={handleQuickSubmit} className="space-y-3 mt-3 pt-3 border-t border-white/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-white/50 block mb-1">
                        Marca y Modelo (si lo conoces)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Golf 2.0 TDI / Peugeot 208"
                        value={carName}
                        onChange={(e) => setCarName(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-white/50 block mb-1">
                        Precio pedido por el vendedor (€)
                      </label>
                      <input
                        type="number"
                        placeholder="Ej: 8900"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-white/50 block mb-1">
                        Kilómetros actuales (km)
                      </label>
                      <input
                        type="number"
                        placeholder="Ej: 145000"
                        value={mileage}
                        onChange={(e) => setMileage(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-white/50 block mb-1">
                        Año aproximado
                      </label>
                      <input
                        type="number"
                        placeholder="Ej: 2016"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-white/40 font-medium">
                      Sin formularios largos • Cálculo instantáneo
                    </span>
                    <button
                      type="submit"
                      className="bg-cyan-400 hover:bg-cyan-300 text-black px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Obtener Análisis Rápido</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Assistant & 3D Explorer secondary helpers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => onNavigate('assistant')}
                className="bg-[#16161D] hover:bg-[#1f1f2a] border border-white/5 p-4 rounded-2xl cursor-pointer transition-colors flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-black">
                  🧭
                </div>
                <div>
                  <div className="text-xs font-black text-white uppercase">Modo Asistente</div>
                  <div className="text-[10px] text-white/50">Preguntas de inspección en vivo</div>
                </div>
              </div>

              <div
                onClick={() => onNavigate('3d')}
                className="bg-[#16161D] hover:bg-[#1f1f2a] border border-white/5 p-4 rounded-2xl cursor-pointer transition-colors flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-black">
                  🚗
                </div>
                <div>
                  <div className="text-xs font-black text-white uppercase">Explorador 3D</div>
                  <div className="text-[10px] text-white/50">Radiografía técnica interactiva</div>
                </div>
              </div>
            </div>
          </div>

          {/* High Contrast Score & Real Cost Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white rounded-[28px] p-6 text-black flex flex-col justify-between h-full relative overflow-hidden shadow-2xl">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Ejemplo de Resultado
                  </div>
                  <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase">
                    COMPRA RECOMENDADA
                  </span>
                </div>

                <div className="my-3">
                  <span className="text-xs font-black text-black/60 uppercase block">Volkswagen Golf VII 2.0 TDI</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[64px] font-black leading-none tracking-tighter italic text-black">
                      82
                    </span>
                    <span className="text-xl font-black opacity-30">/100</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-3 border-t border-black/10">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">
                  Coste Real de Entrada
                </div>

                <div className="space-y-1.5 text-xs font-semibold">
                  <div className="flex justify-between items-center">
                    <span className="font-bold opacity-70">Precio Anunciado</span>
                    <span className="font-black">11.900 €</span>
                  </div>
                  <div className="flex justify-between items-center text-orange-600">
                    <span className="font-bold">Puesta a Punto Inicial</span>
                    <span className="font-black">+280 €</span>
                  </div>
                  <div className="flex justify-between items-center text-red-600">
                    <span className="font-bold">Neumáticos Previstos</span>
                    <span className="font-black">+180 €</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-black/10">
                    <span className="text-xs font-black uppercase">Coste Real Total</span>
                    <span className="text-xl font-black text-blue-600">12.580 €</span>
                  </div>
                </div>
              </div>

              {/* Trust disclaimer badge inside card */}
              <div className="mt-3 bg-black/5 p-2.5 rounded-xl text-[10px] text-black/60 font-medium flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-black/40 flex-shrink-0" />
                <span>{APP_CONFIG.TRUST_DISCLAIMERS.PROFESSIONAL_INSPECTION}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Cars Preset Row with explicit DEMO badge */}
        <div className="my-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-white/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <span>VEHÍCULOS DE DEMOSTRACIÓN PRECARGADOS (MODO DEMO):</span>
            </div>
            <span className="text-[10px] text-cyan-400 font-bold">
              4 modelos probados
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {SAMPLE_DEMO_CARS.map((car) => (
              <button
                key={car.id}
                onClick={() => onSelectSample(car)}
                className="bg-[#16161D] hover:bg-[#1f1f2a] border border-white/5 hover:border-cyan-400/50 p-3 rounded-2xl flex flex-col justify-between transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={car.thumbnail}
                    alt={car.name}
                    className="w-12 h-10 rounded-lg object-cover bg-black border border-white/10 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-xs text-white group-hover:text-cyan-400 truncate">
                      {car.name}
                    </div>
                    <div className="text-[10px] text-white/50 truncate">
                      {car.subtitle.split('•')[0]}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-xs font-black text-emerald-400">
                    {car.askingPrice.toLocaleString('es-ES')} €
                  </span>
                  <span className="bg-white/10 group-hover:bg-cyan-400 group-hover:text-black text-white font-black text-[9px] uppercase px-2 py-0.5 rounded transition-colors">
                    PROBAR DEMO
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Trust & Legal Footer Note */}
        <footer className="pt-4 border-t border-white/5 text-center text-xs text-white/40 font-medium">
          <p>
            {APP_CONFIG.TRUST_DISCLAIMERS.PROFESSIONAL_INSPECTION} • {APP_CONFIG.TRUST_DISCLAIMERS.ESTIMATED_COSTS}
          </p>
        </footer>
      </main>
    </div>
  );
};


