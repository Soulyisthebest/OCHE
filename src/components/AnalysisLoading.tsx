import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { AnalysisStatus } from '../types/analysisSession';

interface AnalysisLoadingProps {
  status?: AnalysisStatus;
  progressPercent?: number;
  stageMessage?: string;
}

const CLEAN_STAGES = [
  { key: 'IDENTIFYING', label: 'Identificando vehículo' },
  { key: 'SCANNING', label: 'Revisando fotos y estado' },
  { key: 'ANALYZING', label: 'Buscando puntos de riesgo' },
  { key: 'CALCULATING', label: 'Calculando coste real y negociación' }
];

export const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({
  status = 'SCANNING',
  progressPercent = 45,
  stageMessage
}) => {
  const getStageIndex = (s: AnalysisStatus | string) => {
    switch (s) {
      case 'IDENTIFYING': return 0;
      case 'SCANNING': return 1;
      case 'ANALYZING': return 2;
      case 'CALCULATING': return 3;
      case 'READY': return 4;
      default: return 1;
    }
  };

  const currentIndex = getStageIndex(status);

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#07090E] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden pb-24 sm:pb-8">
      {/* Subtle ambient light */}
      <div className="w-80 h-80 bg-cyan-500/10 blur-[120px] rounded-full absolute pointer-events-none" />

      <div className="max-w-sm w-full bg-[#0E111A] border border-white/10 rounded-3xl p-7 shadow-2xl backdrop-blur-xl text-center relative z-10 flex flex-col items-center space-y-6">
        
        {/* Animated Scanner Pulse */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />
          <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
          <div className="w-16 h-16 rounded-full bg-cyan-500/15 flex items-center justify-center text-2xl shadow-inner">
            🔍
          </div>
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block mb-1">
            CARCHECK AI
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">
            Analizando tu coche
          </h2>
          <p className="text-xs text-white/60 mt-1 font-medium">
            {stageMessage || 'Comprobando datos, fotos y precios de mercado...'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-1.5">
          <div className="w-full bg-black/60 rounded-full h-2.5 p-0.5 border border-white/10 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(15, progressPercent))}%` }}
            />
          </div>
        </div>

        {/* 4 Clean Visual Steps */}
        <div className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-left space-y-3">
          {CLEAN_STAGES.map((st, idx) => {
            const isDone = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div
                key={st.key}
                className={`flex items-center gap-3 text-xs transition-all ${
                  isDone
                    ? 'text-emerald-400 font-bold'
                    : isCurrent
                    ? 'text-cyan-300 font-black'
                    : 'text-white/30 font-medium'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" />
                )}
                <span>{st.label}</span>
              </div>
            );
          })}
        </div>

        <span className="text-[10px] text-white/40 font-medium">
          Preparando resumen claro para tomar una decisión
        </span>
      </div>
    </div>
  );
};

