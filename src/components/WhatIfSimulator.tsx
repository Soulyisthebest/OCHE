import React, { useState } from 'react';
import { Calculator, Check, RefreshCw, DollarSign } from 'lucide-react';
import { COMMON_WHAT_IF_SCENARIOS, CostEngine, WhatIfSimulationResult } from '../services/CostEngine';
import { CarAnalysisReport } from '../types';
import { AnalyticsService } from '../services/AnalyticsService';
import { CountryEngine } from '../services/CountryEngine';
import { CountryProfile } from '../types/country';

interface WhatIfSimulatorProps {
  report: CarAnalysisReport;
  countryProfile?: CountryProfile;
}

export function WhatIfSimulator({ report, countryProfile }: WhatIfSimulatorProps) {
  const profile = countryProfile || CountryEngine.getCountryProfile();
  const basePrice = report.userPrice || report.realCost?.askingPrice || 8500;
  const baseScore = report.score || 75;
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(['wi-timing']);

  const toggleScenario = (id: string) => {
    setSelectedScenarios((prev) => {
      const next = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id];
      AnalyticsService.track('what_if_simulated', { scenarioCount: next.length }, report.id);
      return next;
    });
  };

  const simulation: WhatIfSimulationResult = CostEngine.simulateWhatIf(
    basePrice,
    baseScore,
    report.repairs || [],
    selectedScenarios,
    profile
  );

  return (
    <div className="bg-[#12121A] border border-cyan-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-6">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              SIMULADOR DE DECISIÓN "WHAT IF"
            </span>
          </div>
          <h3 className="text-lg font-black text-white uppercase italic tracking-tight mt-1 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-cyan-400" />
            ¿Y si este coche necesita alguna reparación imprevista?
          </h3>
          <p className="text-xs text-white/60 mt-0.5">
            Selecciona averías o desgastes hipotéticos para recalcular en tiempo real el coste real de entrada y la oferta en {profile.countryName}.
          </p>
        </div>

        {selectedScenarios.length > 0 && (
          <button
            onClick={() => setSelectedScenarios([])}
            className="text-xs text-white/40 hover:text-white flex items-center gap-1 self-start sm:self-center transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restablecer simulación
          </button>
        )}
      </div>

      {/* Scenario Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {COMMON_WHAT_IF_SCENARIOS.map((scenario) => {
          const isSelected = selectedScenarios.includes(scenario.id);
          return (
            <button
              key={scenario.id}
              onClick={() => toggleScenario(scenario.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/50'
                  : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/40 bg-white/5 px-2 py-0.5 rounded-md">
                  {scenario.category}
                </span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-cyan-500 border-cyan-400 text-black'
                      : 'border-white/20 text-transparent'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              <div>
                <h4 className={`text-sm font-bold leading-snug ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                  {scenario.name}
                </h4>
                <p className="text-xs text-white/50 mt-1 leading-relaxed line-clamp-2">
                  {scenario.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-white/40">Coste est.:</span>
                <span className={`font-bold ${isSelected ? 'text-cyan-400' : 'text-white/80'}`}>
                  {CountryEngine.formatMoney(scenario.costMin, profile)} – {CountryEngine.formatMoney(scenario.costMax, profile)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Real-time Recalculated Matrix */}
      <div className="bg-black/60 border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-white/50">
            RESULTADO DE LA SIMULACIÓN
          </span>
          <span className="text-xs font-bold text-cyan-400">
            {selectedScenarios.length} {selectedScenarios.length === 1 ? 'supuesto aplicado' : 'supuestos aplicados'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Base vs Simulated Real Cost */}
          <div className="bg-white/[0.03] p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-white/40 uppercase block mb-1">Coste Total Inversión</span>
            <div className="text-base font-black font-mono text-white">
              ~{CountryEngine.formatMoney(Math.round(simulation.simulatedTotalExpected), profile)}
            </div>
            <span className="text-[10px] text-amber-400 font-bold block mt-0.5">
              +{CountryEngine.formatMoney(Math.round(simulation.costDifference), profile)} extra
            </span>
          </div>

          {/* Adjusted Purchase Score */}
          <div className="bg-white/[0.03] p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-white/40 uppercase block mb-1">Puntuación Ajustada</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl font-black font-mono ${
                simulation.adjustedScore >= 80 ? 'text-emerald-400' : simulation.adjustedScore >= 60 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {simulation.adjustedScore}
              </span>
              <span className="text-xs text-white/40">/ 100</span>
            </div>
            <span className="text-[10px] text-white/50 block mt-0.5">
              (Antes: {baseScore}/100)
            </span>
          </div>

          {/* Target Offer Price */}
          <div className="bg-white/[0.03] p-3.5 rounded-xl border border-cyan-500/20">
            <span className="text-[10px] text-cyan-400 uppercase block mb-1 font-bold">Oferta Sugerida (Target)</span>
            <div className="text-base font-black font-mono text-cyan-300">
              {CountryEngine.formatMoney(simulation.newTargetNegotiationMin, profile)} – {CountryEngine.formatMoney(simulation.newTargetNegotiationMax, profile)}
            </div>
            <span className="text-[10px] text-white/40 block mt-0.5">
              Precio objetivo de regateo
            </span>
          </div>

          {/* Maximum Recommended Price */}
          <div className="bg-white/[0.03] p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-white/40 uppercase block mb-1">Precio Máx. Recomendado</span>
            <div className="text-base font-black font-mono text-white">
              {CountryEngine.formatMoney(simulation.newMaxRecommendedPrice, profile)}
            </div>
            <span className="text-[10px] text-white/40 block mt-0.5">
              No pagar por encima
            </span>
          </div>
        </div>

        {/* Script for Buyer to Negotiate */}
        {selectedScenarios.length > 0 && (
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2 mt-3">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-cyan-400">
              <DollarSign className="w-4 h-4" />
              Argumento de negociación listo para usar con el vendedor:
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-sans bg-black/40 p-3 rounded-lg border border-white/5 select-all">
              "{simulation.negotiationScript.join(' ')}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
