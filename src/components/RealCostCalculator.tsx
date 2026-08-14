import React, { useState } from 'react';
import { Calculator, Euro, CheckCircle2, AlertTriangle, Info, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { RealCostBreakdown, RepairItem } from '../types';

interface RealCostCalculatorProps {
  initialCost: RealCostBreakdown;
  repairs: RepairItem[];
  onCostChange?: (updatedTotalMin: number, updatedTotalMax: number) => void;
}

export const RealCostCalculator: React.FC<RealCostCalculatorProps> = ({
  initialCost,
  repairs,
  onCostChange
}) => {
  const [askingPrice, setAskingPrice] = useState<number>(initialCost.askingPrice);
  const [transferFee, setTransferFee] = useState<number>(initialCost.transferFees || 200);
  const [includeMaintenance, setIncludeMaintenance] = useState<boolean>(true);
  
  // Track selected optional repair toggles
  const [selectedRepairIds, setSelectedRepairIds] = useState<string[]>(
    repairs.map((r) => r.id)
  );

  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Maintenance initial cost estimate
  const maintMin = includeMaintenance ? (initialCost.initialMaintenanceMin || 250) : 0;
  const maintMax = includeMaintenance ? (initialCost.initialMaintenanceMax || 400) : 0;

  // Selected repairs cost sum
  const activeRepairs = repairs.filter((r) => selectedRepairIds.includes(r.id));
  const repairsMin = activeRepairs.reduce((acc, r) => acc + r.totalEstimatedMin, 0);
  const repairsMax = activeRepairs.reduce((acc, r) => acc + r.totalEstimatedMax, 0);

  // Total Real Cost
  const totalMin = askingPrice + transferFee + maintMin + repairsMin;
  const totalMax = askingPrice + transferFee + maintMax + repairsMax;

  const toggleRepair = (id: string) => {
    setSelectedRepairIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-[#16161D] border border-white/10 rounded-[28px] p-6 shadow-2xl relative overflow-hidden">
      {/* Background Accent Gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight uppercase">
              💰 ¿CUÁNTO TE COSTARÁ REALMENTE?
            </h3>
            <p className="text-xs text-white/50 font-bold uppercase tracking-wider">
              Calculadora transparente de inversión inicial
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2.5 rounded-2xl bg-black border border-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Big Result Banner */}
      <div className="bg-black border border-blue-500/30 rounded-2xl p-5 mb-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                COSTE REAL ESTIMADO TOTAL
              </span>
              {initialCost.isDemoData && (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase border border-amber-500/30">
                  DEMO DATA
                </span>
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-400 tracking-tighter mt-0.5">
              {totalMin.toLocaleString('es-ES')} € – {totalMax.toLocaleString('es-ES')} €
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-[10px] font-black text-blue-300 uppercase">
              RECOMENDADO CON MANTENIMIENTO
            </span>
          </div>
        </div>
      </div>

      {/* Target Negotiation Price Box */}
      <div className="bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 mb-6 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            🎯 PRECIO OBJETIVO PARA NEGOCIAR
          </span>
          <span className="text-[9px] text-white/50 font-bold uppercase">Estimación orientativa</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
          <div className="bg-black/60 p-3 rounded-xl border border-emerald-500/20">
            <span className="text-white/50 text-[10px] block uppercase">Precio Objetivo Sugerido</span>
            <span className="text-xl font-black text-emerald-400">
              {Math.max(1000, askingPrice - (repairsMax + Math.round(maintMin * 0.5))).toLocaleString('es-ES')} €
            </span>
          </div>

          <div className="bg-black/60 p-3 rounded-xl border border-amber-500/20">
            <span className="text-white/50 text-[10px] block uppercase">Precio Máximo Recomendado</span>
            <span className="text-xl font-black text-amber-400">
              {Math.max(1000, askingPrice - Math.round(repairsMax * 0.5)).toLocaleString('es-ES')} €
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Breakdown Controls */}
      {isExpanded && (
        <div className="space-y-4 text-xs">
          {/* Row 1: Asking Price Slider/Input */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-200">1. Precio del coche (Anunciado)</span>
              <span className="font-mono text-cyan-400 font-bold text-sm">
                {askingPrice.toLocaleString('es-ES')} €
              </span>
            </div>
            <input
              type="range"
              min={Math.max(1000, askingPrice - 3000)}
              max={askingPrice + 5000}
              step={100}
              value={askingPrice}
              onChange={(e) => setAskingPrice(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Row 2: Transfer Fees & Maintenance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-200">2. Transferencia / Trámites</p>
                <p className="text-[11px] text-slate-400">Tasas DGT + Gestoría</p>
              </div>
              <span className="font-mono font-bold text-slate-300">
                +{transferFee} €
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-200">3. Puesta a punto inicial</p>
                <p className="text-[11px] text-slate-400">Aceite + Filtros de seguridad</p>
              </div>
              <button
                onClick={() => setIncludeMaintenance(!includeMaintenance)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  includeMaintenance
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {includeMaintenance ? `+${maintMin}–${maintMax} €` : 'Omitido'}
              </button>
            </div>
          </div>

          {/* Row 3: Repairs checklist toggle */}
          {repairs.length > 0 && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2.5">
              <span className="font-bold text-slate-200 block mb-1">
                4. Reparaciones o mejoras aconsejadas ({activeRepairs.length} seleccionadas)
              </span>

              {repairs.map((rep) => {
                const isChecked = selectedRepairIds.includes(rep.id);
                return (
                  <div
                    key={rep.id}
                    onClick={() => toggleRepair(rep.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isChecked
                        ? 'bg-slate-900 border-cyan-500/40 text-slate-200'
                        : 'bg-slate-950 border-slate-850 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isChecked
                            ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                            : 'border-slate-700'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className="font-semibold text-[11px]">{rep.partName}</span>
                    </div>

                    <span className="font-mono font-bold text-cyan-300 text-[11px]">
                      +{rep.totalEstimatedMin}–{rep.totalEstimatedMax} €
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p>
              Nota: No inventamos precios exactos de mercado sin datos en tiempo real de API externa. Esta estimación sirve de guía clara para no llevarte sorpresas tras la compra.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
