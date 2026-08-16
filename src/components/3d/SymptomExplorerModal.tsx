/**
 * OCHE / CARCHECK AI — Symptom Explorer Component (FASE 7)
 * Interactive symptom diagnostic guide: "El coche vibra", "Humo azul", "Silbidos".
 * Maps symptoms to candidate systems, parts, inspection tips without false certainty.
 */

import React, { useState } from 'react';
import {
  Search,
  AlertTriangle,
  Activity,
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Car
} from 'lucide-react';
import { SymptomCandidate } from '../../types/vehicle3D';
import { StandardSystemType } from '../../types/vehicleKnowledge';
import { Vehicle3DService } from '../../services/Vehicle3DService';

interface SymptomExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSystemFilter: (systemId: StandardSystemType) => void;
}

export const SymptomExplorerModal: React.FC<SymptomExplorerModalProps> = ({
  isOpen,
  onClose,
  onSelectSystemFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomCandidate | null>(null);

  if (!isOpen) return null;

  const symptoms = Vehicle3DService.getSymptomCandidates(searchQuery);

  const handleInspectSystem = (systemId: StandardSystemType) => {
    onSelectSystemFilter(systemId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#14141A] border border-white/15 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                Buscador de Síntomas & Diagnóstico
              </h2>
              <p className="text-xs text-white/50 font-bold">
                Explora posibles causas mecánicas antes de comprar o reparar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-5 border-b border-white/10 bg-black/40">
          <div className="relative">
            <Search className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ej: 'El coche vibra al frenar', 'Humo azul', 'Silbido al acelerar'..."
              className="w-full pl-12 pr-4 py-3 bg-[#1A1A24] border border-white/10 rounded-2xl text-sm font-bold text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {symptoms.length === 0 ? (
            <div className="text-center py-10 text-white/50 text-xs font-bold space-y-2">
              <p>No se encontraron síntomas con ese término.</p>
              <p className="text-white/40">Prueba con palabras como "freno", "humo", "ruido", "vibración" o "temperatura".</p>
            </div>
          ) : (
            <div className="space-y-4">
              {symptoms.map((sym) => {
                const isSelected = selectedSymptom?.symptomId === sym.symptomId;
                return (
                  <div
                    key={sym.symptomId}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-[#1C1C28] border-blue-500 shadow-xl'
                        : 'bg-black/50 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span>{sym.symptomName}</span>
                      </h3>
                      <button
                        onClick={() => setSelectedSymptom(isSelected ? null : sym)}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 underline text-left cursor-pointer"
                      >
                        {isSelected ? 'Ocultar detalles' : 'Ver posibles causas →'}
                      </button>
                    </div>

                    <p className="text-xs text-white/70 font-bold leading-relaxed mb-3">
                      {sym.description}
                    </p>

                    {/* Candidate Systems Breakdown */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-fade-in">
                        <div className="space-y-3">
                          <span className="text-[10px] font-black text-white/50 uppercase tracking-wider block">
                            🔧 Sistemas y Componentes a Verificar:
                          </span>

                          {sym.candidateSystems.map((cand, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-black/70 border border-white/10 space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-black text-white uppercase">
                                  {cand.systemName}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                      cand.likelihood === 'HIGH'
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        : cand.likelihood === 'MEDIUM'
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    }`}
                                  >
                                    Probabilidad {cand.likelihood}
                                  </span>

                                  <button
                                    onClick={() => handleInspectSystem(cand.systemId)}
                                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>Ver en 3D</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              <p className="text-white/80 font-bold leading-relaxed">
                                {cand.inspectionTip}
                              </p>

                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {cand.candidateParts.map((p, pIdx) => (
                                  <span
                                    key={pIdx}
                                    className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-white/70"
                                  >
                                    {p}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Safe Driving Advice */}
                        <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-1 text-xs text-blue-200">
                          <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-blue-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Consejo de Seguridad OCHE</span>
                          </span>
                          <p className="font-bold leading-relaxed">
                            {sym.safeDrivingAdvice}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/60 flex items-center justify-between text-xs text-white/40 font-bold">
          <span>OCHE Knowledge Diagnostics Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black uppercase text-xs cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
