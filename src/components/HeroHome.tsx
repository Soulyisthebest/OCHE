import React from 'react';
import { Camera, Car, BookmarkCheck, BookOpen, Compass, ShieldCheck, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { SAMPLE_DEMO_CARS, SampleDemoCar } from '../data/sampleCars';

interface HeroHomeProps {
  onStartScan: () => void;
  onNavigate: (view: string) => void;
  onSelectSample: (sample: SampleDemoCar) => void;
  savedCount: number;
}

export const HeroHome: React.FC<HeroHomeProps> = ({
  onStartScan,
  onNavigate,
  onSelectSample,
  savedCount
}) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0C] text-white flex flex-col justify-between relative overflow-hidden p-4 sm:p-8">
      {/* Main Container Grid */}
      <main className="max-w-6xl mx-auto w-full flex-1 flex flex-col justify-between">
        {/* Header Eyebrow */}
        <div className="mb-8">
          <h2 className="text-white/40 text-xs font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            <span>CARCHECK AI • V1.0 PROTOTYPE</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </h2>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            Hola, ¿qué coche vamos a ver hoy?
          </h1>
        </div>

        {/* Hero Scan & Score Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto">
          {/* Primary Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Giant Scan Button */}
            <button
              onClick={onStartScan}
              className="group relative bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 h-64 sm:h-72 rounded-[32px] flex flex-col items-center justify-center border-4 border-white/10 overflow-hidden transition-all hover:scale-[1.01] shadow-2xl cursor-pointer"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.4)_0%,transparent_70%)] opacity-50" />
              <div className="text-6xl mb-3 transform group-hover:scale-110 transition-transform">📸</div>
              <span className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic drop-shadow-md">
                ESCANEAR COCHE
              </span>
              <p className="text-white/80 font-bold mt-2 text-xs sm:text-sm uppercase tracking-wider">
                Analiza daños, modelo y costes reales con IA
              </p>
            </button>

            {/* Sub Quick Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Latest Scan Card */}
              <div className="bg-[#16161D] rounded-[24px] p-6 border border-white/5 flex flex-col justify-between">
                <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">
                  Último Escaneo
                </div>
                <div className="my-2">
                  <div className="text-xl font-black text-white">Audi A3 Sportback</div>
                  <div className="text-blue-400 font-bold text-xs">35 TFSI • S-Line (140,000 km)</div>
                </div>
                <div className="flex justify-between items-end pt-2 border-t border-white/5">
                  <button
                    onClick={() => onSelectSample(SAMPLE_DEMO_CARS[0])}
                    className="text-xs font-extrabold text-white/70 hover:text-white underline cursor-pointer"
                  >
                    Ver informe
                  </button>
                  <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    88/100 COMPRA RECOMENDADA
                  </span>
                </div>
              </div>

              {/* Assistant Guide Card */}
              <div className="bg-[#16161D] rounded-[24px] p-6 border border-white/5 flex flex-col justify-between">
                <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">
                  Modo Asistente
                </div>
                <div className="text-base font-black text-white leading-snug my-1">
                  ¿No sabes qué mirar? Déjanos guiarte paso a paso.
                </div>
                <button
                  onClick={() => onNavigate('assistant')}
                  className="mt-3 bg-white hover:bg-blue-50 text-black py-2.5 rounded-xl font-black text-xs uppercase tracking-tighter cursor-pointer transition-colors"
                >
                  INICIAR GUÍA PASO A PASO
                </button>
              </div>
            </div>
          </div>

          {/* High Contrast Score & Real Cost Sidebar (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white rounded-[32px] p-8 text-black flex flex-col justify-between h-full relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Puntuación de Compra
                  </div>
                  <span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    EVALUACIÓN IA
                  </span>
                </div>

                <div className="flex items-baseline gap-1 my-2">
                  <span className="text-[90px] sm:text-[100px] font-black leading-none tracking-tighter italic text-black">
                    78
                  </span>
                  <span className="text-2xl font-black opacity-30">/100</span>
                </div>
              </div>

              <div className="relative z-10 mt-4">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">
                  Análisis de Coste Real
                </div>

                <div className="space-y-2.5 text-xs font-semibold">
                  <div className="flex justify-between items-center border-b border-black/10 pb-2">
                    <span className="font-bold opacity-70">Precio Anunciado</span>
                    <span className="font-black text-base">12.400 €</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-black/10 pb-2">
                    <span className="font-bold opacity-70">Mantenimiento Inmediato</span>
                    <span className="font-black text-orange-600">+450 €</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-black/10 pb-2">
                    <span className="font-bold opacity-70">Reparaciones Estimadas</span>
                    <span className="font-black text-red-600">+800 €</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-black uppercase tracking-wider">Inversión Total Real</span>
                    <span className="text-2xl font-black text-blue-600">13.650 €</span>
                  </div>
                </div>
              </div>

              {/* Decorative background outline icon */}
              <div className="absolute -right-16 -bottom-8 opacity-5 pointer-events-none">
                <Car className="w-64 h-64 text-black" />
              </div>
            </div>
          </div>
        </section>

        {/* Demo Cars Preset Row */}
        <div className="my-6">
          <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">
            O PRUEBA CON UN VEHÍCULO DE DEMOSTRACIÓN:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {SAMPLE_DEMO_CARS.map((car) => (
              <button
                key={car.id}
                onClick={() => onSelectSample(car)}
                className="bg-[#16161D] hover:bg-[#1f1f2a] border border-white/5 hover:border-blue-500/40 p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer text-left group"
              >
                <img
                  src={car.thumbnail}
                  alt={car.name}
                  className="w-14 h-11 rounded-xl object-cover bg-black border border-white/10 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-black text-xs text-white group-hover:text-blue-400 truncate">
                    {car.name}
                  </div>
                  <div className="text-[10px] text-white/50 font-bold truncate">
                    {car.subtitle}
                  </div>
                  <div className="text-[11px] font-black text-emerald-400">
                    {car.askingPrice.toLocaleString('es-ES')} €
                  </div>
                </div>
                <div className="bg-white/10 group-hover:bg-blue-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-lg transition-colors">
                  PROBAR
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats Footer */}
        <footer className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-black text-sm flex-shrink-0">
              08
            </div>
            <div className="text-[11px] leading-tight font-black opacity-60 uppercase">
              Puntos críticos comprobados
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 font-black text-sm flex-shrink-0">
              02
            </div>
            <div className="text-[11px] leading-tight font-black opacity-60 uppercase">
              Alertas mecánicas activas
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-black text-sm flex-shrink-0">
              OK
            </div>
            <div className="text-[11px] leading-tight font-black opacity-60 uppercase">
              Documentación verificada
            </div>
          </div>

          <div
            onClick={() => onNavigate('3d')}
            className="flex items-center justify-center gap-2 bg-[#F27D26] hover:bg-orange-500 rounded-2xl p-4 cursor-pointer transition-colors shadow-lg"
          >
            <span className="font-black text-black text-xs uppercase tracking-tighter">
              EXPLORAR EN 3D
            </span>
            <div className="w-5 h-5 border-2 border-black rounded-sm flex items-center justify-center font-black text-[9px] text-black">
              3D
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

