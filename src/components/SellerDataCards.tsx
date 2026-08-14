import React, { useState } from 'react';
import { Euro, Gauge, Calendar, Fuel, Cog, ArrowRight, Sparkles, Check, ChevronRight } from 'lucide-react';

interface SellerDataCardsProps {
  initialPrice?: number;
  initialMileage?: number;
  initialYear?: number;
  initialFuel?: string;
  initialTransmission?: string;
  onSubmit: (data: {
    askingPrice?: number;
    mileageKm?: number;
    year?: number;
    fuel?: string;
    transmission?: string;
  }) => void;
  onSkip: () => void;
}

const PRICE_PRESETS = [4500, 7500, 9900, 12500, 16000, 22000];
const MILEAGE_PRESETS = [65000, 110000, 145000, 185000, 220000, 260000];
const FUEL_OPTIONS = ['Diésel', 'Gasolina', 'Híbrido', 'GLP / GNC', 'Eléctrico'];
const TRANSMISSION_OPTIONS = ['Manual', 'Automático (DSG/Tiptronic)', 'Automático (CVT/Convertidor)'];

export const SellerDataCards: React.FC<SellerDataCardsProps> = ({
  initialPrice,
  initialMileage,
  initialYear,
  initialFuel,
  initialTransmission,
  onSubmit,
  onSkip
}) => {
  const [askingPrice, setAskingPrice] = useState<number | undefined>(initialPrice || 8900);
  const [mileageKm, setMileageKm] = useState<number | undefined>(initialMileage || 145000);
  const [year, setYear] = useState<number | undefined>(initialYear || 2015);
  const [fuel, setFuel] = useState<string>(initialFuel || 'Diésel');
  const [transmission, setTransmission] = useState<string>(initialTransmission || 'Manual');

  const handleContinue = () => {
    onSubmit({
      askingPrice,
      mileageKm,
      year,
      fuel,
      transmission
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0C] text-white p-4 sm:p-6 max-w-4xl mx-auto flex flex-col justify-between space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          PASO CLAVE DE ANÁLISIS
        </div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
          Datos del Anuncio o Vendedor
        </h1>
        <p className="text-xs sm:text-sm text-white/60 max-w-lg mx-auto">
          Indica estos 4 datos clave para que el motor de OCHE calcule el <strong className="text-white">precio objetivo de compra</strong> y los <strong className="text-white">riesgos reales</strong>.
        </p>
      </div>

      {/* Grid of Interactive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Precio */}
        <div className="bg-[#16161D] border border-white/10 rounded-[28px] p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-blue-400">
                <Euro className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-wider">¿Cuánto pide el vendedor?</span>
              </div>
              <span className="text-[10px] text-white/40 font-bold uppercase">En Euros (€)</span>
            </div>

            <div className="relative mt-2">
              <input
                type="number"
                value={askingPrice || ''}
                onChange={(e) => setAskingPrice(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                placeholder="Ej: 8500"
                className="w-full bg-black border-2 border-white/10 focus:border-blue-500 rounded-2xl py-3 px-4 text-xl font-black text-white focus:outline-none tracking-tight"
              />
              <span className="absolute right-4 top-3.5 text-lg font-black text-white/40">€</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1.5">
              Valores rápidos:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRICE_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAskingPrice(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    askingPrice === p
                      ? 'bg-blue-600 text-white font-black'
                      : 'bg-white/5 hover:bg-white/10 text-white/70'
                  }`}
                >
                  {p.toLocaleString('es-ES')} €
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Kilómetros */}
        <div className="bg-[#16161D] border border-white/10 rounded-[28px] p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-cyan-400">
                <Gauge className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-wider">¿Cuántos kilómetros tiene?</span>
              </div>
              <span className="text-[10px] text-white/40 font-bold uppercase">En Kilómetros (km)</span>
            </div>

            <div className="relative mt-2">
              <input
                type="number"
                value={mileageKm || ''}
                onChange={(e) => setMileageKm(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                placeholder="Ej: 145000"
                className="w-full bg-black border-2 border-white/10 focus:border-cyan-500 rounded-2xl py-3 px-4 text-xl font-black text-white focus:outline-none tracking-tight"
              />
              <span className="absolute right-4 top-3.5 text-sm font-black text-white/40">KM</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1.5">
              Valores rápidos:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {MILEAGE_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMileageKm(m)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mileageKm === m
                      ? 'bg-cyan-600 text-white font-black'
                      : 'bg-white/5 hover:bg-white/10 text-white/70'
                  }`}
                >
                  {(m / 1000).toFixed(0)}k km
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Año de Fabricación */}
        <div className="bg-[#16161D] border border-white/10 rounded-[28px] p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Calendar className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-wider">¿De qué año es?</span>
              </div>
              <span className="text-[10px] text-white/40 font-bold uppercase">Matriculación</span>
            </div>

            <div className="relative mt-2">
              <input
                type="number"
                min={1995}
                max={2026}
                value={year || ''}
                onChange={(e) => setYear(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                placeholder="Ej: 2015"
                className="w-full bg-black border-2 border-white/10 focus:border-emerald-500 rounded-2xl py-3 px-4 text-xl font-black text-white focus:outline-none tracking-tight"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[2011, 2013, 2015, 2017, 2019, 2021].map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  year === y
                    ? 'bg-emerald-600 text-white font-black'
                    : 'bg-white/5 hover:bg-white/10 text-white/70'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Combustible y Transmisión */}
        <div className="bg-[#16161D] border border-white/10 rounded-[28px] p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-colors">
          <div>
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <Fuel className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-wider">Combustible & Cambio</span>
            </div>

            <div className="space-y-3 mt-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1">
                  Combustible:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {FUEL_OPTIONS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFuel(f)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        fuel === f
                          ? 'bg-purple-600 text-white font-black'
                          : 'bg-white/5 hover:bg-white/10 text-white/70'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1">
                  Transmisión:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Manual', 'Automático'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTransmission(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        transmission.toLowerCase().includes(t.toLowerCase())
                          ? 'bg-purple-600 text-white font-black'
                          : 'bg-white/5 hover:bg-white/10 text-white/70'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors cursor-pointer py-2 px-4"
        >
          Saltar / Usar valores estimados
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
        >
          <span>CALCULAR ANÁLISIS COMPLETO</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
