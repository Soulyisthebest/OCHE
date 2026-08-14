import React, { useState } from 'react';
import { Scale, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Car, ChevronLeft, Sparkles, Trophy } from 'lucide-react';
import { CarAnalysisReport } from '../types';
import { SAMPLE_DEMO_CARS } from '../data/sampleCars';

interface CarComparatorProps {
  savedReports?: CarAnalysisReport[];
  onBack: () => void;
  onSelectReport?: (report: CarAnalysisReport) => void;
}

export const CarComparator: React.FC<CarComparatorProps> = ({ savedReports = [], onBack, onSelectReport }) => {
  // Combine demo car reports and saved reports
  const allAvailableReports: { id: string; name: string; report: CarAnalysisReport; tag: string }[] = [
    ...SAMPLE_DEMO_CARS.map((c) => ({
      id: `demo-${c.id}`,
      name: `${c.report.identity.make} ${c.report.identity.model} (${c.report.identity.engine || ''})`,
      report: c.report,
      tag: 'Demo'
    })),
    ...savedReports.map((r) => ({
      id: `saved-${r.id}`,
      name: `${r.identity.make} ${r.identity.model} (${r.identity.engine || ''})`,
      report: r,
      tag: 'Guardado'
    }))
  ];

  const [carAId, setCarAId] = useState<string>(allAvailableReports[0]?.id || '');
  const [carBId, setCarBId] = useState<string>(allAvailableReports[1]?.id || allAvailableReports[0]?.id || '');

  const carA = allAvailableReports.find((c) => c.id === carAId)?.report || allAvailableReports[0]?.report;
  const carB = allAvailableReports.find((c) => c.id === carBId)?.report || allAvailableReports[1]?.report || carA;

  if (!carA || !carB) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0C] text-white p-6 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
        <Scale className="w-12 h-12 text-blue-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-black uppercase">No hay suficientes coches para comparar</h2>
        <p className="text-xs text-white/50 my-2">Escanear un coche o guardar análisis en tu garaje.</p>
        <button
          onClick={onBack}
          className="mt-4 px-6 py-2.5 rounded-full bg-white text-black font-black text-xs uppercase"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  // Calculate comparison verdict
  const scoreDiff = carA.score - carB.score;
  const costADiff = (carA.realCost.totalMin + carA.realCost.totalMax) / 2;
  const costBDiff = (carB.realCost.totalMin + carB.realCost.totalMax) / 2;

  let winner: 'A' | 'B' | 'TIE' = 'TIE';
  let conclusionText = '';

  if (scoreDiff > 5) {
    winner = 'A';
    conclusionText = `El **${carA.identity.make} ${carA.identity.model}** (Coche A) resulta una mejor compra con una puntuación de **${carA.score}/100** frente a **${carB.score}/100**, ofreciendo un menor riesgo de averías mecánicas.`;
  } else if (scoreDiff < -5) {
    winner = 'B';
    conclusionText = `El **${carB.identity.make} ${carB.identity.model}** (Coche B) resulta una opción superior con **${carB.score}/100** frente a **${carA.score}/100**, respaldado por una mejor fiabilidad general.`;
  } else {
    if (costADiff < costBDiff) {
      winner = 'A';
      conclusionText = `Ambos vehículos tienen puntuaciones similares (${carA.score} vs ${carB.score}), pero el **${carA.identity.make} ${carA.identity.model}** tiene un coste total estimado menor (${Math.round(costADiff)} € vs ${Math.round(costBDiff)} €).`;
    } else {
      winner = 'B';
      conclusionText = `Ambos vehículos están igualados en puntuación (${carA.score} vs ${carB.score}), pero el **${carB.identity.make} ${carB.identity.model}** requiere menor inversión total estimada (${Math.round(costBDiff)} € vs ${Math.round(costADiff)} €).`;
    }
  }

  const getVerdictBadge = (score: number) => {
    if (score >= 80) {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          🟢 COMPRAR
        </span>
      );
    } else if (score >= 60) {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
          🟡 NEGOCIAR
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
        🔴 EVITAR
      </span>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0C] text-white p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-black uppercase tracking-wider text-white/70 hover:text-white flex items-center gap-1 bg-[#16161D] px-4 py-2 rounded-full border border-white/10 mb-3 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-xs font-black text-blue-400 uppercase tracking-widest mb-1">
            <Scale className="w-4 h-4" />
            <span>COMPARADOR DE VEHÍCULOS</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
            ⚖️ Comparar 2 Coches
          </h1>
        </div>

        <p className="text-xs text-white/50 font-bold uppercase tracking-wider max-w-xs">
          Compara cara a cara fiabilidad, coste real, averías y puntuación global.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#16161D] p-4 rounded-2xl border border-white/10">
        <div>
          <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">
            Vehículo A:
          </label>
          <select
            value={carAId}
            onChange={(e) => setCarAId(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
          >
            {allAvailableReports.map((item) => (
              <option key={item.id} value={item.id}>
                [{item.tag}] {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-1">
            Vehículo B:
          </label>
          <select
            value={carBId}
            onChange={(e) => setCarBId(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
          >
            {allAvailableReports.map((item) => (
              <option key={item.id} value={item.id}>
                [{item.tag}] {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conclusion Card */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border-2 border-blue-500/40 rounded-[28px] p-6 shadow-2xl flex items-start gap-4">
        <Trophy className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 block mb-1">
            VEREDICTO COMPARATIVO IA
          </span>
          <p className="text-sm font-bold text-white leading-relaxed">{conclusionText}</p>
        </div>
      </div>

      {/* Side-by-side comparison table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CAR A CARD */}
        <div className={`bg-[#16161D] border rounded-[32px] p-6 shadow-2xl space-y-4 relative ${
          winner === 'A' ? 'border-2 border-blue-500 shadow-blue-500/20' : 'border-white/10'
        }`}>
          {winner === 'A' && (
            <span className="absolute top-4 right-4 bg-blue-500 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
              <Trophy className="w-3 h-3" /> GANADOR
            </span>
          )}

          <div className="space-y-1">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">COCHE A</span>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">
              {carA.identity.make} {carA.identity.model}
            </h2>
            <p className="text-xs text-white/60 font-bold uppercase">
              {carA.identity.generation} • {carA.identity.engine} ({carA.identity.powerHp} CV)
            </p>
          </div>

          <div className="flex items-center justify-between bg-black/60 p-4 rounded-2xl border border-white/5">
            <div>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Puntuación</span>
              <span className="text-4xl font-black italic text-blue-400">{carA.score}/100</span>
            </div>
            {getVerdictBadge(carA.score)}
          </div>

          <div className="space-y-2 text-xs font-semibold">
            <div className="flex justify-between p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-white/60">Precio Anunciado</span>
              <span className="font-black text-white">{carA.userPrice?.toLocaleString('es-ES')} €</span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-white/60">Coste Real Estimado</span>
              <span className="font-black text-emerald-400">{carA.realCost.totalMin} € – {carA.realCost.totalMax} €</span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-white/60">Kilometraje</span>
              <span className="font-black text-white">{carA.mileageKm?.toLocaleString('es-ES')} km</span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-white/60">Puntos Fuertes</span>
              <span className="font-black text-emerald-400 text-right max-w-[180px] truncate">
                {carA.modelProsCons.find((p) => p.type === 'pro')?.title || 'Buen confort'}
              </span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-white/60">Riesgo / Puntos Débiles</span>
              <span className="font-black text-red-400 text-right max-w-[180px] truncate">
                {carA.modelProsCons.find((p) => p.type === 'con')?.title || 'Revisar averías'}
              </span>
            </div>
          </div>

          {onSelectReport && (
            <button
              onClick={() => onSelectReport(carA)}
              className="w-full py-3 rounded-2xl bg-white hover:bg-blue-50 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Ver Informe Completo Coche A
            </button>
          )}
        </div>

        {/* CAR B CARD */}
        <div className={`bg-[#16161D] border rounded-[32px] p-6 shadow-2xl space-y-4 relative ${
          winner === 'B' ? 'border-2 border-purple-500 shadow-purple-500/20' : 'border-white/10'
        }`}>
          {winner === 'B' && (
            <span className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
              <Trophy className="w-3 h-3" /> GANADOR
            </span>
          )}

          <div className="space-y-1">
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">COCHE B</span>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">
              {carB.identity.make} {carB.identity.model}
            </h2>
            <p className="text-xs text-white/60 font-bold uppercase">
              {carB.identity.generation} • {carB.identity.engine} ({carB.identity.powerHp} CV)
            </p>
          </div>

          <div className="flex items-center justify-between bg-black/60 p-4 rounded-2xl border border-white/5">
            <div>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Puntuación</span>
              <span className="text-4xl font-black italic text-purple-400">{carB.score}/100</span>
            </div>
            {getVerdictBadge(carB.score)}
          </div>

          <div className="space-y-2 text-xs font-semibold">
            <div className="flex justify-between p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-white/60">Precio Anunciado</span>
              <span className="font-black text-white">{carB.userPrice?.toLocaleString('es-ES')} €</span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-white/60">Coste Real Estimado</span>
              <span className="font-black text-emerald-400">{carB.realCost.totalMin} € – {carB.realCost.totalMax} €</span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-white/60">Kilometraje</span>
              <span className="font-black text-white">{carB.mileageKm?.toLocaleString('es-ES')} km</span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-white/60">Puntos Fuertes</span>
              <span className="font-black text-emerald-400 text-right max-w-[180px] truncate">
                {carB.modelProsCons.find((p) => p.type === 'pro')?.title || 'Buen confort'}
              </span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-white/60">Riesgo / Puntos Débiles</span>
              <span className="font-black text-red-400 text-right max-w-[180px] truncate">
                {carB.modelProsCons.find((p) => p.type === 'con')?.title || 'Revisar averías'}
              </span>
            </div>
          </div>

          {onSelectReport && (
            <button
              onClick={() => onSelectReport(carB)}
              className="w-full py-3 rounded-2xl bg-white hover:bg-purple-50 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Ver Informe Completo Coche B
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
