import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Edit3, ArrowRight, ShieldCheck, Sparkles, ChevronRight, Car } from 'lucide-react';
import { VehicleIdentificationResult, VehicleIdentificationCandidate } from '../types/analysisSession';

interface VehicleConfirmCardProps {
  identification: VehicleIdentificationResult;
  onConfirm: (confirmedCandidate: VehicleIdentificationCandidate) => void;
  onManualOverride: () => void;
}

export const VehicleConfirmCard: React.FC<VehicleConfirmCardProps> = ({
  identification,
  onConfirm,
  onManualOverride
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<VehicleIdentificationCandidate>(
    identification.candidates[0] || {
      vehicleId: 'golf-7-tdi',
      brand: identification.brand,
      model: identification.model,
      generation: identification.generation,
      engine: identification.engine,
      fuel: identification.fuel,
      power: identification.power,
      transmission: identification.transmission,
      yearRange: `${identification.year}`,
      confidence: identification.confidence,
      matchingTraits: identification.evidence
    }
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0C] text-white p-4 sm:p-6 max-w-4xl mx-auto flex flex-col justify-center space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          IDENTIFICACIÓN AUTOMÁTICA
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">
          ¿Es este el vehículo que estás analizando?
        </h1>
        <p className="text-xs sm:text-sm text-white/60 max-w-lg mx-auto">
          Hemos analizado las fotos y la base de datos de modelos. Confirma o selecciona el modelo exacto para aplicar las tablas mecánicas correctas.
        </p>
      </div>

      {/* Main Selected Identification Hero Card */}
      <div className="bg-[#16161D] border-2 border-emerald-500/50 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
              CANDIDATO PRINCIPAL ({(selectedCandidate.confidence * 100).toFixed(0)}% COINCIDENCIA)
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-white italic mt-1">
              {selectedCandidate.brand} {selectedCandidate.model}
            </h2>
            <p className="text-sm font-bold text-white/80 mt-1">
              {selectedCandidate.generation} • {selectedCandidate.yearRange}
            </p>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                Motor Detectado
              </span>
              <span className="text-xs font-black text-white">
                {selectedCandidate.engine} ({selectedCandidate.power} CV)
              </span>
            </div>
          </div>
        </div>

        {/* Specs Pill List */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-white/5">
          <div className="bg-black/60 p-3 rounded-xl border border-white/5">
            <span className="text-[10px] text-white/40 font-black uppercase block">Combustible</span>
            <span className="text-xs font-black text-white">{selectedCandidate.fuel}</span>
          </div>
          <div className="bg-black/60 p-3 rounded-xl border border-white/5">
            <span className="text-[10px] text-white/40 font-black uppercase block">Cambio</span>
            <span className="text-xs font-black text-white">{selectedCandidate.transmission}</span>
          </div>
          <div className="bg-black/60 p-3 rounded-xl border border-white/5">
            <span className="text-[10px] text-white/40 font-black uppercase block">Potencia</span>
            <span className="text-xs font-black text-white">{selectedCandidate.power} CV</span>
          </div>
          <div className="bg-black/60 p-3 rounded-xl border border-white/5">
            <span className="text-[10px] text-white/40 font-black uppercase block">Generación</span>
            <span className="text-xs font-black text-white">{selectedCandidate.generation}</span>
          </div>
        </div>

        {/* Evidences List */}
        {selectedCandidate.matchingTraits && selectedCandidate.matchingTraits.length > 0 && (
          <div className="space-y-2 bg-black/40 p-4 rounded-2xl border border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
              Evidencias visuales de coincidencia:
            </span>
            <div className="space-y-1.5">
              {selectedCandidate.matchingTraits.map((trait, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-white/80 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{trait}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Alternative Candidates */}
      {identification.candidates.length > 1 && (
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block px-2">
            Otras versiones o modelos similares detectados:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {identification.candidates.map((cand) => (
              <button
                key={cand.vehicleId}
                type="button"
                onClick={() => setSelectedCandidate(cand)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedCandidate.vehicleId === cand.vehicleId
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                    : 'bg-[#16161D] border-white/10 text-white/70 hover:bg-white/5'
                }`}
              >
                <div>
                  <div className="text-xs font-black uppercase text-white">
                    {cand.brand} {cand.model} ({cand.generation})
                  </div>
                  <div className="text-[11px] text-white/50 font-medium">
                    {cand.engine} • {cand.fuel} • {cand.yearRange}
                  </div>
                </div>
                <span className="text-xs font-black text-blue-400">
                  {(cand.confidence * 100).toFixed(0)}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onManualOverride}
          className="text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer py-2 px-4"
        >
          <Edit3 className="w-4 h-4" />
          <span>No es este coche / Corregir manualmente</span>
        </button>

        <button
          type="button"
          onClick={() => onConfirm(selectedCandidate)}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>SÍ, CONFIRMAR Y VER INFORME</span>
        </button>
      </div>
    </div>
  );
};
