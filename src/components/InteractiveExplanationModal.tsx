import React from 'react';
import { X, HelpCircle, DollarSign, Wrench, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

export type ExplanationType = 'WHY' | 'HOW_MUCH' | 'HOW_TO_CHECK';

export interface ExplanationData {
  type: ExplanationType;
  title: string;
  subtitle?: string;
  category?: string;
  // Why?
  plainExplanation?: string;
  evidenceSource?: string;
  confidence?: number;
  confidenceTier?: string;
  // How much?
  partCost?: { min: number; expected: number; max: number };
  laborCost?: { min: number; expected: number; max: number };
  totalCost?: { min: number; expected: number; max: number };
  costType?: 'REAL' | 'DEMO' | 'UNKNOWN';
  // How to check?
  steps?: string[];
  tips?: string[];
}

interface InteractiveExplanationModalProps {
  data: ExplanationData | null;
  onClose: () => void;
}

export const InteractiveExplanationModal: React.FC<InteractiveExplanationModalProps> = ({
  data,
  onClose
}) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#16161D] border border-white/10 rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Badge */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {data.type === 'WHY' && (
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                ¿POR QUÉ? • EXPLICACIÓN TRANSPARENTE
              </span>
            )}
            {data.type === 'HOW_MUCH' && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                ¿CUÁNTO CUESTA? • DESGLOSE DE TALLER
              </span>
            )}
            {data.type === 'HOW_TO_CHECK' && (
              <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                ¿CÓMO LO COMPRUEBO? • GUÍA PRÁCTICA
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="text-xs text-white/60 font-medium mt-1">{data.subtitle}</p>
          )}
        </div>

        {/* Dynamic Content Body */}
        {data.type === 'WHY' && (
          <div className="space-y-4">
            <div className="bg-black/60 p-4 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block">
                Explicación en lenguaje sencillo:
              </span>
              <p className="text-xs text-white/90 leading-relaxed font-medium">
                {data.plainExplanation || 'Nuestros algoritmos contrastan las evidencias visuales y los registros técnicos históricos del motor para calcular este indicador sin conjeturas.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-white/40 font-black uppercase block">Origen</span>
                <span className="text-xs font-black text-white">{data.evidenceSource || 'Visión por IA + Base técnica'}</span>
              </div>
              <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-white/40 font-black uppercase block">Nivel de Confianza</span>
                <span className="text-xs font-black text-emerald-400">{data.confidenceTier || 'Alta confianza (90%)'}</span>
              </div>
            </div>
          </div>
        )}

        {data.type === 'HOW_MUCH' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-black/60 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] text-white/40 font-black uppercase block">Mínimo</span>
                <span className="text-sm font-black text-emerald-400">{data.totalCost?.min || data.partCost?.min || 0} €</span>
              </div>
              <div className="bg-black/60 p-3 rounded-xl border border-blue-500/30 text-center bg-blue-500/5">
                <span className="text-[10px] text-blue-400 font-black uppercase block">Esperado</span>
                <span className="text-base font-black text-white">{data.totalCost?.expected || data.partCost?.expected || 0} €</span>
              </div>
              <div className="bg-black/60 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] text-white/40 font-black uppercase block">Máximo</span>
                <span className="text-sm font-black text-amber-400">{data.totalCost?.max || data.partCost?.max || 0} €</span>
              </div>
            </div>

            <div className="bg-black/60 p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                <span className="text-white/60">Recambio / Pieza nueva:</span>
                <span className="font-bold text-white">
                  {data.partCost ? `${data.partCost.min} € – ${data.partCost.max} €` : 'Incluido'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                <span className="text-white/60">Mano de obra estimada:</span>
                <span className="font-bold text-white">
                  {data.laborCost ? `${data.laborCost.min} € – ${data.laborCost.max} €` : 'Estimada según baremo'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-white/60">Tipo de cálculo:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  data.costType === 'REAL' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {data.costType || 'Estimación técnica'}
                </span>
              </div>
            </div>
          </div>
        )}

        {data.type === 'HOW_TO_CHECK' && (
          <div className="space-y-4">
            <div className="space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 block">
                Pasos sencillos para comprobarlo tú mismo:
              </span>
              {(data.steps && data.steps.length > 0 ? data.steps : [
                'Arranca el motor en frío y escucha si aparecen traqueteos metálicos.',
                'Realiza una prueba de conducción en aceleración y frenada firme.',
                'Revisa el libro de revisiones o facturas oficiales de taller.'
              ]).map((step, idx) => (
                <div key={idx} className="bg-black/60 p-3.5 rounded-xl border border-white/5 flex items-start gap-3 text-xs text-white/90 font-medium">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          ENTENDIDO
        </button>
      </div>
    </div>
  );
};
