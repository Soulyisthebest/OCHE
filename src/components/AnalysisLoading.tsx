import React from 'react';
import { Cpu, CheckCircle2, ShieldCheck, Sparkles, Activity } from 'lucide-react';
import { AnalysisStatus } from '../types/analysisSession';

interface AnalysisLoadingProps {
  status?: AnalysisStatus;
  progressPercent?: number;
  stageMessage?: string;
}

const DEFAULT_STAGES = [
  { key: 'SCANNING', label: '1. Procesamiento visual de fotos y clasificación de ángulos' },
  { key: 'IDENTIFYING', label: '2. Identificación de marca, generación y motorización' },
  { key: 'ANALYZING', label: '3. Detección de evidencias y fallos endémicos' },
  { key: 'CALCULATING', label: '4. Cálculo de matriz de riesgo, costes reales y precio objetivo' },
  { key: 'READY', label: '5. Generación de informe técnico final' }
];

export const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({
  status = 'SCANNING',
  progressPercent = 35,
  stageMessage = 'Analizando vehículo con visión artificial y base técnica...'
}) => {
  const getStageIndex = (s: AnalysisStatus | string) => {
    switch (s) {
      case 'SCANNING': return 0;
      case 'IDENTIFYING': return 1;
      case 'ANALYZING': return 2;
      case 'CALCULATING': return 3;
      case 'READY': return 4;
      default: return 1;
    }
  };

  const currentIndex = getStageIndex(status);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0C] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="w-96 h-96 bg-cyan-500/10 blur-[140px] rounded-full absolute pointer-events-none" />

      <div className="max-w-md w-full bg-[#16161D] border border-white/10 rounded-[32px] p-8 shadow-2xl backdrop-blur-xl text-center relative z-10 flex flex-col items-center space-y-6">
        {/* Animated Scanner Radar */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />
          <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
          <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-inner">
            <Cpu className="w-10 h-10 text-cyan-400 animate-pulse" />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            OCHE MOTOR DETERMINISTA
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">
            Inspeccionando Coche
          </h2>
          <p className="text-xs text-white/60 mt-1 font-medium">
            {stageMessage}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-1.5">
          <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-white/50">
            <span>Progreso</span>
            <span className="text-cyan-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-black rounded-full h-3 p-0.5 border border-white/10 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500 shadow-lg shadow-cyan-500/50"
              style={{ width: `${Math.min(100, Math.max(10, progressPercent))}%` }}
            />
          </div>
        </div>

        {/* Pipeline Stage Checklist */}
        <div className="w-full bg-black/60 border border-white/5 rounded-2xl p-4 text-left space-y-2.5">
          {DEFAULT_STAGES.map((st, idx) => {
            const isDone = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div
                key={st.key}
                className={`flex items-center gap-2.5 text-xs transition-all ${
                  isDone
                    ? 'text-emerald-400 font-medium'
                    : isCurrent
                    ? 'text-cyan-300 font-bold'
                    : 'text-white/30'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-white/10 flex-shrink-0" />
                )}
                <span className="truncate">{st.label}</span>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-white/40 font-medium">
          Traduciendo datos mecánicos complejos a lenguaje claro y accionable...
        </p>
      </div>
    </div>
  );
};
