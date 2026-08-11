import React, { useEffect, useState } from 'react';
import { Camera, Sparkles, CheckCircle2, Shield, Eye, Cpu, Zap } from 'lucide-react';

const ANALYSIS_STEPS = [
  'Procesando fotografías con visión multimodal...',
  'Identificando marca, modelo y generación exacta...',
  'Inspeccionando carrocería, faros y abolladuras...',
  'Evaluando desgaste del interior y mandos...',
  'Analizando cuadro de instrumentos en busca de testigos...',
  'Cruzando base de datos de averías conocidas del modelo...',
  'Calculando costes reales de mantenimiento y reparaciones...',
  'Generando informe de puntuación y recomendación final...'
];

export const AnalysisLoading: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });

      setProgress((prev) => {
        if (prev < 92) {
          return prev + Math.floor(Math.random() * 12) + 8;
        }
        return 96;
      });
    }, 900);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow and grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="w-80 h-80 bg-cyan-500/15 blur-[120px] rounded-full absolute pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center relative z-10 flex flex-col items-center">
        {/* Animated Scanner Ring */}
        <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
          <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
          <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-inner">
            <Cpu className="w-10 h-10 text-cyan-400 animate-pulse" />
          </div>
        </div>

        <h2 className="text-2xl font-black tracking-tight text-white mb-2">
          CARCHECK <span className="text-cyan-400">AI</span>
        </h2>
        <p className="text-xs font-semibold text-slate-400 mb-6 uppercase tracking-widest">
          Inspeccionando vehículo...
        </p>

        {/* Progress bar */}
        <div className="w-full bg-slate-950 rounded-full h-3 mb-6 p-0.5 border border-slate-800 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 h-full rounded-full transition-all duration-500 shadow-lg shadow-cyan-500/50"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Dynamic step ticker */}
        <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 text-left space-y-2 mb-4">
          {ANALYSIS_STEPS.map((stepText, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                className={`flex items-center gap-2.5 text-xs transition-all ${
                  isDone
                    ? 'text-emerald-400 font-medium'
                    : isCurrent
                    ? 'text-cyan-300 font-bold'
                    : 'text-slate-600 opacity-50'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-slate-800 flex-shrink-0" />
                )}
                <span className="truncate">{stepText}</span>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-500">
          Un momento. Analizando detalles técnicos en lenguaje sencillo...
        </p>
      </div>
    </div>
  );
};
