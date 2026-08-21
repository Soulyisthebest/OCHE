import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Edit3, ArrowRight, ShieldCheck, Sparkles, ChevronRight, Car, HelpCircle } from 'lucide-react';
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
      brand: identification.brand || 'Vehículo No Identificado',
      model: identification.model || 'Modelo Desconocido',
      generation: identification.generation || 'Pendiente de confirmación',
      engine: identification.engine || 'Motor no especificado',
      fuel: identification.fuel || 'Gasolina',
      power: identification.power || 0,
      transmission: identification.transmission || 'Manual',
      yearRange: `${identification.year || 2020}`,
      confidence: identification.confidence || 0.0,
      matchingTraits: identification.evidence || []
    }
  );

  const isUnknown = identification.status === 'UNKNOWN' || (!identification.brand && !identification.model) || identification.brand === 'Vehículo No Identificado';
  const isUnsupported = identification.status === 'IDENTIFIED_BUT_UNSUPPORTED' || (!identification.matchedVehicle && !isUnknown);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0C] text-white p-4 sm:p-6 max-w-4xl mx-auto flex flex-col justify-center space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${
          isUnknown
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            : isUnsupported
            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          <Sparkles className="w-3.5 h-3.5" />
          {isUnknown ? 'IDENTIFICACIÓN PENDIENTE (UNKNOWN)' : isUnsupported ? 'MODELO NO CATALOGADO' : 'CONFIRMACIÓN DE VEHÍCULO'}
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">
          {isUnknown
            ? 'No hemos podido identificar el coche con certeza'
            : isUnsupported
            ? 'Vehículo reconocido pero fuera de base de averías endémicas'
            : '¿Es este el vehículo que estás analizando?'}
        </h1>
        <p className="text-xs sm:text-sm text-white/60 max-w-lg mx-auto">
          {isUnknown
            ? 'Las fotografías aportadas no contienen suficientes rasgos visuales inequívocos o el modelo no está en el catálogo visual.'
            : isUnsupported
            ? `Hemos identificado el coche como ${selectedCandidate.brand} ${selectedCandidate.model}. Puedes continuar con un análisis general o corregir los datos manualmente.`
            : 'Hemos analizado las fotos y la base de datos de modelos. Confirma o selecciona el modelo exacto para aplicar las tablas mecánicas correctas.'}
        </p>
      </div>

      {/* Main Selected Identification Hero Card */}
      <div className={`bg-[#16161D] border-2 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden ${
        isUnknown ? 'border-amber-500/40' : isUnsupported ? 'border-blue-500/40' : 'border-emerald-500/50'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
              isUnknown ? 'text-amber-400' : isUnsupported ? 'text-blue-400' : 'text-emerald-400'
            }`}>
              {isUnknown
                ? 'ESTADO: UNKNOWN / NEEDS_VERIFICATION'
                : isUnsupported
                ? 'ESTADO: IDENTIFIED_BUT_UNSUPPORTED'
                : `CANDIDATO PRINCIPAL (${(selectedCandidate.confidence * 100).toFixed(0)}% COINCIDENCIA)`}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-white italic mt-1">
              {selectedCandidate.brand} {selectedCandidate.model}
            </h2>
            <p className="text-sm font-bold text-white/80 mt-1">
              {selectedCandidate.generation} • {selectedCandidate.yearRange}
            </p>
          </div>

          <div className={`px-4 py-3 rounded-2xl border flex items-center gap-3 ${
            isUnknown
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-emerald-500/10 border-emerald-500/30'
          }`}>
            <ShieldCheck className={`w-8 h-8 flex-shrink-0 ${isUnknown ? 'text-amber-400' : 'text-emerald-400'}`} />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-white/60 block">
                Motorización
              </span>
              <span className="text-xs font-black text-white">
                {selectedCandidate.engine}
                {selectedCandidate.power > 0 ? ` (${selectedCandidate.power} CV)` : ''}
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
            <span className="text-xs font-black text-white">
              {selectedCandidate.power > 0 ? `${selectedCandidate.power} CV` : 'No especificada'}
            </span>
          </div>
          <div className="bg-black/60 p-3 rounded-xl border border-white/5">
            <span className="text-[10px] text-white/40 font-black uppercase block">Generación</span>
            <span className="text-xs font-black text-white">{selectedCandidate.generation}</span>
          </div>
        </div>

        {/* Evidences List */}
        {selectedCandidate.matchingTraits && selectedCandidate.matchingTraits.length > 0 && (
          <div className="space-y-2 bg-black/40 p-4 rounded-2xl border border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50 block">
              Notas y observaciones de identificación:
            </span>
            <div className="space-y-1.5">
              {selectedCandidate.matchingTraits.map((trait, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-white/80 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span>{trait}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Alternative Candidates */}
      {identification?.candidates && identification.candidates.length > 1 && (
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block px-2">
            Otras versiones o modelos similares detectados:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(identification.candidates || []).map((cand) => (
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

      {/* Fallback Callout Box when Unknown or Low Confidence */}
      {isUnknown && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-5 sm:p-6 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-amber-400 font-black text-sm uppercase tracking-wider">
            <HelpCircle className="w-5 h-5" />
            <span>¿No reconocemos tu coche?</span>
          </div>
          <p className="text-xs text-white/80 max-w-md mx-auto">
            Puedes introducir la marca, modelo, motorización y datos del coche manualmente en pocos segundos.
          </p>
          <button
            type="button"
            onClick={onManualOverride}
            className="px-6 py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-cyan-400/20 inline-flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>INTRODUCIR COCHE MANUALMENTE</span>
          </button>
        </div>
      )}

      {/* Confirmation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onManualOverride}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Edit3 className="w-4 h-4 text-cyan-400" />
          <span>Introducir coche manualmente</span>
        </button>

        {!isUnknown && (
          <button
            type="button"
            onClick={() => onConfirm(selectedCandidate)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>SÍ, CONFIRMAR Y VER INFORME</span>
          </button>
        )}
      </div>
    </div>
  );
};

