import React, { useState } from 'react';
import {
  BarChart3, Users, Clock, AlertTriangle, Download, Trash2,
  CheckCircle2, X, RefreshCw, Smartphone, Eye, Sparkles
} from 'lucide-react';
import { PilotSessionService } from '../services/PilotSessionService';

interface PilotDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PilotDashboardModal: React.FC<PilotDashboardModalProps> = ({
  isOpen,
  onClose
}) => {
  const [metrics, setMetrics] = useState(() => PilotSessionService.getAggregatedMetrics());
  const [showExportToast, setShowExportToast] = useState(false);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const jsonStr = PilotSessionService.exportPilotDatasetAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oche_pilot_dataset_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 2500);
  };

  const handleClearSessions = () => {
    if (confirm('¿Eliminar todos los datos y sesiones del piloto local?')) {
      PilotSessionService.clearAllSessions();
      setMetrics(PilotSessionService.getAggregatedMetrics());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0B0F19] border border-cyan-500/40 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                Panel de Control de Piloto Real
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  FASE 12
                </span>
              </h2>
              <p className="text-xs text-white/60">
                Métricas agregadas y validación de campo en vehículos reales.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning: Minimum sample size awareness */}
        <div className="bg-blue-500/10 border border-blue-500/25 rounded-2xl p-3.5 flex items-start gap-3 text-xs">
          <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <span className="font-black text-cyan-300">ESTADO DE MUESTRA REAL: {metrics.sampleSize} SESIONES</span>
            <p className="text-white/70">
              {metrics.sampleSize < 5
                ? 'Muestra inicial reducida. Los porcentajes deben interpretarse con cautela hasta alcanzar una muestra representativa de campo.'
                : 'Muestra en crecimiento para calibración de costes y satisfacción.'}
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-black/50 border border-white/5 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold block">Sesiones Totales</span>
            <div className="text-2xl font-black text-white">{metrics.totalSessions}</div>
            <span className="text-[10px] text-emerald-400 font-bold">
              {metrics.completionRate}% completadas
            </span>
          </div>

          <div className="bg-black/50 border border-white/5 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold block">Duración Media</span>
            <div className="text-2xl font-black text-cyan-300">
              {metrics.avgDurationSeconds > 0 ? `${Math.round(metrics.avgDurationSeconds / 60)} min` : '0 min'}
            </div>
            <span className="text-[10px] text-white/50 font-medium">
              {metrics.avgDurationSeconds} s por coche
            </span>
          </div>

          <div className="bg-black/50 border border-white/5 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold block">Facilidad (1-5)</span>
            <div className="text-2xl font-black text-amber-300">
              {metrics.avgEaseRating > 0 ? `${metrics.avgEaseRating} ★` : '—'}
            </div>
            <span className="text-[10px] text-white/50 font-medium">
              {metrics.feedbackCount} valoraciones
            </span>
          </div>

          <div className="bg-black/50 border border-white/5 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold block">Reintentos Cámara</span>
            <div className="text-2xl font-black text-purple-300">{metrics.retryRate}%</div>
            <span className="text-[10px] text-white/50 font-medium">
              {metrics.totalRetries} de {metrics.totalPhotos} fotos
            </span>
          </div>
        </div>

        {/* Funnel breakdown */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-white/80 flex items-center justify-between">
            <span>Embudo de Inspección</span>
            <span className="text-[10px] text-white/40">Abandono por fase</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-white/70">1. Escáner iniciado</span>
              <span className="font-bold text-white">{metrics.totalSessions}</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div className="bg-cyan-400 h-full w-full" />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-white/70">2. Inspección finalizada con éxito</span>
              <span className="font-bold text-emerald-400">{metrics.completedSessions}</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all"
                style={{ width: `${metrics.completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
          <button
            onClick={handleClearSessions}
            className="px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar datos</span>
          </button>

          <button
            id="export-pilot-json-btn"
            onClick={handleExportJSON}
            className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar dataset (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
