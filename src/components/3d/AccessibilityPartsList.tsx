/**
 * OCHE / CARCHECK AI — 2D Accessible Parts Explorer (FASE 7)
 * Accessible alternative for screen-readers, low-power devices, and dense tabular inspection.
 */

import React, { useState } from 'react';
import { Search, Wrench, AlertTriangle, ShieldCheck, ChevronRight, Filter } from 'lucide-react';
import { Car3DModel, Car3DPart, ObservationEvidenceItem } from '../../types/vehicle3D';
import { StandardSystemType } from '../../types/vehicleKnowledge';

interface AccessibilityPartsListProps {
  model: Car3DModel;
  selectedPart: Car3DPart | null;
  activeSystemFilter: StandardSystemType | 'ALL';
  evidenceMap: Record<string, ObservationEvidenceItem>;
  onSelectPart: (part: Car3DPart) => void;
  onSystemFilterChange: (sys: StandardSystemType | 'ALL') => void;
}

export const AccessibilityPartsList: React.FC<AccessibilityPartsListProps> = ({
  model,
  selectedPart,
  activeSystemFilter,
  evidenceMap,
  onSelectPart,
  onSystemFilterChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredParts = model.parts.filter((p) => {
    if (activeSystemFilter !== 'ALL' && p.systemId !== activeSystemFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.systemId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-[#14141A] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Wrench className="w-4 h-4 text-cyan-400" />
            <span>Lista de Componentes ({filteredParts.length})</span>
          </h3>
          <p className="text-xs text-white/50 font-bold">
            Exploración accesible sin vista 3D
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar pieza..."
            className="w-full pl-9 pr-3 py-1.5 bg-black/60 border border-white/10 rounded-xl text-xs font-bold text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Parts Table / List */}
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {filteredParts.length === 0 ? (
          <div className="text-center py-8 text-white/40 text-xs font-bold">
            No se encontraron componentes que coincidan con el filtro.
          </div>
        ) : (
          filteredParts.map((part) => {
            const isSelected = selectedPart?.id === part.id || selectedPart?.partId === part.partId;
            const evidence = evidenceMap[part.id] || evidenceMap[part.partId];
            const isObserved = evidence?.status === 'OBSERVED';
            const isPossible = evidence?.status === 'POSSIBLE';

            return (
              <button
                key={part.id}
                onClick={() => onSelectPart(part)}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-950/60 border-blue-500 shadow-md'
                    : isObserved
                    ? 'bg-red-950/40 border-red-500/50 hover:border-red-400'
                    : 'bg-black/40 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white uppercase">{part.name}</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-black text-blue-400 uppercase">
                      {part.systemId}
                    </span>
                    {isObserved && (
                      <span className="px-2 py-0.5 rounded bg-red-600/30 border border-red-500 text-red-300 text-[9px] font-black uppercase">
                        Hallazgo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/60 font-bold line-clamp-1">
                    {part.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      part.importance === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400'
                        : part.importance === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {part.importance}
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
