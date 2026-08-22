import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Edit3, ArrowRight, ShieldCheck, Sparkles, Check, X } from 'lucide-react';
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
      vehicleId: identification.matchedVehicle ? identification.matchedVehicle.id : 'unsupported-vehicle',
      brand: identification.brand || 'Vehículo Desconocido',
      model: identification.model || 'Modelo Desconocido',
      generation: identification.generation || '',
      engine: identification.engine || 'Motor no especificado',
      fuel: identification.fuel || 'Gasolina',
      power: identification.power || 0,
      transmission: identification.transmission || 'Manual',
      yearRange: `${identification.year || 2018}`,
      confidence: identification.confidence || 0.0,
      matchingTraits: identification.evidence || []
    }
  );

  const isHighConfidence = (selectedCandidate.confidence || 0) >= 0.75;
  const isUnknown = identification.status === 'UNKNOWN' || (!identification.brand && !identification.model) || identification.brand === 'Vehículo No Identificado' || identification.brand === 'Vehículo Desconocido';

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#07090E] text-white p-4 sm:p-6 max-w-md mx-auto flex flex-col justify-center space-y-6 pb-24 sm:pb-8">
      
      {/* Header Prompt */}
      <div className="text-center space-y-1.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/50 block">
          PASO 2 DE 3 · CONFIRMACIÓN
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          ¿Es este coche?
        </h1>
        <p className="text-xs text-white/60 font-medium">
          Confirma para aplicar las averías endémicas y precios de mercado correctos.
        </p>
      </div>

      {/* Main Identification Card */}
      <div className="bg-gradient-to-b from-[#141824] to-[#0E111A] border border-white/10 rounded-3xl p-6 shadow-2xl text-center space-y-5">
        
        {/* Visual Icon & Status Badge */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-inner">
            🚗
          </div>

          <div>
            {isUnknown ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-black uppercase">
                🟡 No identificado con certeza
              </span>
            ) : isHighConfidence ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-black uppercase">
                🟢 CONFIRMADO POR VISIÓN IA
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-black uppercase">
                🟡 No estoy completamente seguro
              </span>
            )}
          </div>
        </div>

        {/* Vehicle Identity */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            {selectedCandidate.brand} {selectedCandidate.model}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-cyan-400 font-bold mt-1">
            <span>{selectedCandidate.yearRange || selectedCandidate.generation || '2018'}</span>
            <span>•</span>
            <span>{selectedCandidate.engine || 'Motor térmico'}</span>
            {selectedCandidate.power > 0 && <span>({selectedCandidate.power} CV)</span>}
          </div>
        </div>

        {/* Specs Pill Summary */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-white/10">
          <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
            <span className="text-white/40 block text-[10px] uppercase font-bold">Combustible</span>
            <span className="font-black text-white">{selectedCandidate.fuel || 'Diésel'}</span>
          </div>
          <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
            <span className="text-white/40 block text-[10px] uppercase font-bold">Cambio</span>
            <span className="font-black text-white">{selectedCandidate.transmission || 'Manual'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {!isUnknown && (
            <button
              id="confirm-vehicle-yes-btn"
              type="button"
              onClick={() => onConfirm(selectedCandidate)}
              className="w-full py-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all cursor-pointer"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>SÍ, ES ESTE COCHE</span>
            </button>
          )}

          <button
            id="confirm-vehicle-no-btn"
            type="button"
            onClick={onManualOverride}
            className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isUnknown
                ? 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-400/20'
                : 'bg-white/10 hover:bg-white/15 text-white/80 border border-white/10'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>{isUnknown ? 'Introducir marca y modelo a mano' : 'No, corregir datos'}</span>
          </button>
        </div>
      </div>

      {/* Alternative Candidate selector if multiple were found */}
      {identification?.candidates && identification.candidates.length > 1 && (
        <div className="space-y-2 bg-[#0E111A] border border-white/10 rounded-2xl p-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-white/50 block">
            Otras versiones parecidas:
          </span>
          <div className="space-y-1.5">
            {identification.candidates.slice(1, 3).map((cand, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedCandidate(cand)}
                className="w-full p-2.5 rounded-xl bg-black/40 hover:bg-white/5 border border-white/5 text-left flex items-center justify-between text-xs cursor-pointer"
              >
                <div>
                  <span className="font-black text-white">{cand.brand} {cand.model}</span>
                  <span className="text-white/50 block text-[10px]">{cand.engine} · {cand.yearRange}</span>
                </div>
                <span className="text-cyan-400 font-bold text-[11px]">Elegir</span>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};


