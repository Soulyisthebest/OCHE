import React, { useState } from 'react';
import { BookmarkCheck, Trash2, ArrowRightLeft, Car, Calendar, Euro, ShieldCheck, ChevronRight } from 'lucide-react';
import { CarAnalysisReport } from '../types';

interface GarageHistoryProps {
  savedReports: CarAnalysisReport[];
  onSelectReport: (report: CarAnalysisReport) => void;
  onDeleteReport: (id: string) => void;
  onStartNewScan: () => void;
}

export const GarageHistory: React.FC<GarageHistoryProps> = ({
  savedReports,
  onSelectReport,
  onDeleteReport,
  onStartNewScan
}) => {
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const toggleCompare = (id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const compareReports = savedReports.filter((r) => selectedForCompare.includes(r.id));

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0C] text-white p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-xs font-black text-blue-400 uppercase tracking-widest mb-2">
            <BookmarkCheck className="w-4 h-4" />
            <span>MI GARAJE • ANÁLISIS GUARDADOS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic">
            Historial de Inspecciones
          </h1>
          <p className="text-xs text-white/50 font-bold uppercase tracking-wider">
            Compara candidatos analizados previamente para tomar la mejor decisión de compra.
          </p>
        </div>

        <button
          onClick={onStartNewScan}
          className="px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider bg-white hover:bg-blue-50 text-black flex items-center gap-1.5 shadow-lg cursor-pointer transition-all"
        >
          <Car className="w-4 h-4 text-blue-600" />
          <span>Escanear Coche</span>
        </button>
      </div>

      {/* Compare Drawer if 2 selected */}
      {compareReports.length === 2 && (
        <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl p-6 shadow-2xl mb-8 animate-fade-in">
          <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm mb-4">
            <ArrowRightLeft className="w-4 h-4" />
            <span>COMPARATIVA DIRECTA DE CANDIDATOS</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            {compareReports.map((r) => (
              <div key={r.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-extrabold text-sm text-white block">
                  {r.identity.make} {r.identity.model}
                </span>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Puntuación:</span>
                  <span className={`font-black text-sm px-2 py-0.5 rounded-md ${
                    r.score >= 80 ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                  }`}>
                    {r.score} / 100
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Precio anunciado:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {r.userPrice?.toLocaleString('es-ES')} €
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Coste Real Max:</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {r.realCost.totalMax.toLocaleString('es-ES')} €
                  </span>
                </div>

                <button
                  onClick={() => onSelectReport(r)}
                  className="w-full mt-2 py-2 rounded-xl bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 font-bold text-[11px] transition-colors"
                >
                  Ver Informe
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports List */}
      {savedReports.length === 0 ? (
        <div className="bg-[#16161D] border border-white/10 rounded-[32px] p-12 text-center my-8">
          <div className="w-16 h-16 rounded-full bg-black text-white/40 flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Car className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-1">
            Tu garaje está vacío
          </h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto mb-6 font-bold uppercase tracking-wider">
            Aún no has guardado ninguna inspección de vehículo. Escanea un coche con la cámara para guardarlo aquí.
          </p>
          <button
            onClick={onStartNewScan}
            className="px-6 py-3 rounded-full bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-blue-50 transition-colors shadow-lg cursor-pointer"
          >
            📸 ESCANEAR MI PRIMER COCHE
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedReports.map((r) => {
            const isCompared = selectedForCompare.includes(r.id);
            const photoUrl = Object.values(r.photos)[0] || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={r.id}
                className="bg-[#16161D] border border-white/10 rounded-[28px] p-5 shadow-2xl hover:border-blue-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={photoUrl}
                      alt={r.identity.model}
                      className="w-20 h-16 rounded-2xl object-cover bg-black border border-white/10 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          r.score >= 80
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          🏆 {r.score}/100 • {r.scoreLabel}
                        </span>

                        <button
                          onClick={() => onDeleteReport(r.id)}
                          className="text-white/40 hover:text-red-400 transition-colors p-1 cursor-pointer"
                          title="Eliminar del garaje"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h3 className="font-black text-base text-white uppercase italic tracking-tighter truncate">
                        {r.identity.make} {r.identity.model}
                      </h3>
                      <p className="text-[11px] text-white/50 font-bold uppercase truncate">
                        {r.identity.generation || r.identity.engine} • {r.mileageKm?.toLocaleString('es-ES')} km
                      </p>
                    </div>
                  </div>

                  <div className="bg-black p-3 rounded-2xl border border-white/5 grid grid-cols-2 gap-2 text-xs mb-4">
                    <div>
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Precio pedido:</span>
                      <span className="font-black text-white">
                        {r.userPrice?.toLocaleString('es-ES')} €
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Coste Real Est.:</span>
                      <span className="font-black text-blue-400">
                        {r.realCost.totalMin.toLocaleString('es-ES')}–{r.realCost.totalMax.toLocaleString('es-ES')} €
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => toggleCompare(r.id)}
                    className={`flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-colors cursor-pointer ${
                      isCompared
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-black text-white/60 border-white/10 hover:text-white'
                    }`}
                  >
                    {isCompared ? 'Comparando ✓' : 'Comparar'}
                  </button>

                  <button
                    onClick={() => onSelectReport(r)}
                    className="flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider bg-white/10 hover:bg-white text-white hover:text-black transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Ver Informe</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
