import React, { useState } from 'react';
import { Compass, RotateCw, ZoomIn, ZoomOut, Cpu, Disc, Activity, Settings, Zap, CircleDot, ChevronRight, Info, AlertTriangle, Euro } from 'lucide-react';
import { CAR_ZONES_3D } from '../data/car3DData';
import { CarZone3D, CarPartInfo } from '../types';

export const Car3DExplorer: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<CarZone3D>(CAR_ZONES_3D[0]);
  const [selectedPart, setSelectedPart] = useState<CarPartInfo | null>(CAR_ZONES_3D[0].parts[0]);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const handleRotate = () => {
    setRotationAngle((prev) => (prev + 45) % 360);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 1.6));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.8));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0C] text-white p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-xs font-black text-blue-400 uppercase tracking-widest mb-2">
            <Compass className="w-4 h-4" />
            <span>EXPLORADOR TÉCNICO INTERACTIVO 3D</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic">
            Conoce Tu Coche
          </h1>
          <p className="text-xs text-white/50 font-bold uppercase tracking-wider">
            Toca las zonas clave del coche para entender qué hace cada pieza y cuánto cuesta reparar.
          </p>
        </div>

        {/* 3D Viewport Controls */}
        <div className="flex items-center gap-2 bg-[#16161D] p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={handleRotate}
            className="p-2.5 rounded-xl bg-black hover:bg-white/10 text-white/80 hover:text-white transition-colors text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer"
            title="Girar modelo 3D"
          >
            <RotateCw className="w-4 h-4 text-blue-400" />
            Girar 360º
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2.5 rounded-xl bg-black hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
            title="Acercar zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2.5 rounded-xl bg-black hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
            title="Alejar zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive 3D Canvas Viewport (7 cols) */}
        <div className="lg:col-span-7 bg-[#16161D] border border-white/10 rounded-[32px] p-6 shadow-2xl relative min-h-[380px] flex flex-col justify-between overflow-hidden">
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

          {/* Top Zone Switcher Badges */}
          <div className="relative z-10 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CAR_ZONES_3D.map((zone) => {
              const isSelected = selectedZone.id === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => {
                    setSelectedZone(zone);
                    setSelectedPart(zone.parts[0] || null);
                  }}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-400 shadow-lg'
                      : 'bg-black/80 text-white/50 border-white/10 hover:text-white'
                  }`}
                >
                  <span>{zone.name}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Car Vector Graphic Stage */}
          <div className="relative w-full h-64 my-4 flex items-center justify-center">
            <div
              className="relative transition-all duration-500 ease-out flex items-center justify-center w-full max-w-md"
              style={{
                transform: `rotate(${rotationAngle}deg) scale(${zoomLevel})`
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80"
                alt="3D Car View"
                className="w-full h-44 object-cover rounded-2xl opacity-75 shadow-2xl border border-purple-500/30"
              />

              {/* Interactive Hotspot Buttons on Canvas */}
              {CAR_ZONES_3D.map((zone) => {
                const isSelected = selectedZone.id === zone.id;
                return (
                  <button
                    key={zone.id}
                    onClick={() => {
                      setSelectedZone(zone);
                      setSelectedPart(zone.parts[0] || null);
                    }}
                    className={`absolute p-2 rounded-full border-2 transition-all transform -translate-x-1/2 -translate-y-1/2 cursor-pointer shadow-xl ${
                      isSelected
                        ? 'bg-purple-500 border-white text-white scale-125 z-20 animate-pulse'
                        : 'bg-slate-950/90 border-slate-700 text-slate-300 hover:border-purple-400 hover:scale-110'
                    }`}
                    style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                    title={zone.name}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-current" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Zone Summary Bar */}
          <div className="relative z-10 bg-slate-950/90 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-purple-400">
                ZONA SELECCIONADA:
              </span>
              <span className="text-xs font-extrabold text-white">
                {selectedZone.name}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {selectedZone.summary}
            </p>
          </div>
        </div>

        {/* Component Parts List & Price Detail Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* List of Parts in Zone */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
              🔧 PIEZAS DE ESTA ZONA ({selectedZone.parts.length})
            </h3>

            <div className="space-y-2">
              {selectedZone.parts.map((part) => {
                const isPartSelected = selectedPart?.id === part.id;
                return (
                  <button
                    key={part.id}
                    onClick={() => setSelectedPart(part)}
                    className={`w-full p-3 rounded-2xl text-xs font-bold text-left transition-all border flex items-center justify-between cursor-pointer ${
                      isPartSelected
                        ? 'bg-purple-950/60 border-purple-500 text-purple-200 shadow-md'
                        : 'bg-slate-950 border-slate-850 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{part.name}</span>
                    <ChevronRight className={`w-4 h-4 ${isPartSelected ? 'text-purple-400' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Part Detail Drawer */}
          {selectedPart && (
            <div className="bg-[#16161D] border border-purple-500/30 rounded-3xl p-6 shadow-2xl relative animate-fade-in space-y-3">
              <span className="text-[10px] font-black text-purple-400 bg-purple-950 px-3 py-1 rounded-full border border-purple-800 uppercase tracking-wider inline-block">
                FICHA TÉCNICA DE PIEZA
              </span>

              <h2 className="text-xl font-black text-white uppercase italic tracking-tight">
                {selectedPart.name}
              </h2>

              <div className="space-y-2 text-xs">
                <div className="bg-black/60 p-3 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black text-purple-400 block uppercase mb-0.5">
                    📍 Ubicación & Función:
                  </span>
                  <p className="text-white/80 font-bold leading-relaxed">
                    {selectedPart.description || selectedPart.whatItDoes || 'No disponible'}
                  </p>
                </div>

                <div className="bg-black/60 p-3 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black text-amber-400 block uppercase mb-0.5">
                    ⚠️ ¿Qué puede fallar y síntomas?
                  </span>
                  <p className="text-white/80 font-bold leading-relaxed">
                    {selectedPart.whatCanFail || selectedPart.commonIssues.join(', ') || 'No disponible'}
                  </p>
                </div>

                <div className="bg-black/60 p-3 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black text-blue-400 block uppercase mb-0.5">
                    🛠️ Mantenimiento preventivo:
                  </span>
                  <p className="text-white/80 font-bold leading-relaxed">
                    {selectedPart.maintenance || 'Inspección visual regular según programa de mantenimiento.'}
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-2">
                <div className="p-2.5 rounded-xl bg-black border border-white/10">
                  <span className="text-white/40 text-[9px] uppercase block">Precio Pieza Nueva</span>
                  <span className="text-emerald-400 font-black">{selectedPart.priceNew || 'No disponible'}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-black border border-white/10">
                  <span className="text-white/40 text-[9px] uppercase block">Precio Pieza Usada</span>
                  <span className="text-amber-400 font-black">{selectedPart.priceUsed || 'No disponible'}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-black border border-white/10">
                  <span className="text-white/40 text-[9px] uppercase block">Mano de Obra</span>
                  <span className="text-purple-400 font-black">{selectedPart.laborCost || 'No disponible'}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-black border border-purple-500/40">
                  <span className="text-purple-400 text-[9px] uppercase block">Coste Total Est.</span>
                  <span className="text-white font-black">{selectedPart.totalCost || 'No disponible'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
