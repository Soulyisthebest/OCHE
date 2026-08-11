import React, { useState } from 'react';
import { ShieldCheck, ChevronRight, ChevronLeft, AlertTriangle, CheckCircle2, RotateCcw, Volume2, Flame, Wrench } from 'lucide-react';
import { AssistantStep } from '../types';

const ASSISTANT_STEPS: AssistantStep[] = [
  {
    id: 1,
    title: 'Comprobación del Motor en Frío',
    zone: 'Vano Motor',
    instruction: 'Pide al vendedor tocar con cuidado la tapa del motor o el tubo de escape para verificar que no lo ha arrancado justo antes de que llegaras.',
    question: '¿El motor está totalmente frío?',
    options: [
      {
        label: 'SÍ, está frío',
        type: 'yes',
        advice: '✅ Excelente. Arrancar en frío es la mejor prueba para detectar traqueteos de cadena, humo o fallos de inyección.',
        riskLevel: 'low'
      },
      {
        label: 'NO, está caliente',
        type: 'no',
        advice: '⚠️ Precaución: Algunos vendedores calientan el coche antes para ocultar ruidos de arranque en frío o humo inicial. Pide volver a probarlo tras enfriar.',
        riskLevel: 'medium'
      },
      {
        label: 'NO ESTOY SEGURO',
        type: 'unsure',
        advice: '💡 Pon la mano sobre el capó. Si despide calor, el coche ha estado encendido recientemente.',
        riskLevel: 'low'
      }
    ]
  },
  {
    id: 2,
    title: 'Arranque y Sonido del Ralentí',
    zone: 'Sonido y Vibraciones',
    instruction: 'Arranca el motor (o pide al vendedor que lo haga) con la puerta abierta y la ventana bajada. Escucha atentamente durante 15 segundos.',
    question: '¿Escuchas un ruido metálico metálico, chirrido agudo o traqueteo?',
    options: [
      {
        label: 'NO, suena suave y redondo',
        type: 'no',
        advice: '🟢 Muy buena señal. El ralentí es estable y no hay ruidos sospechosos en la distribución.',
        riskLevel: 'low'
      },
      {
        label: 'SÍ, un ruido metálico o chirrido',
        type: 'yes',
        advice: '⚠️ Esto puede indicar un problema en la cadena de distribución, tensor o polea del alternador. No significa que esté roto, pero exige revisión técnica.',
        riskLevel: 'high'
      },
      {
        label: 'NO ESTOY SEGURO',
        type: 'unsure',
        advice: '💡 Pide acelerar levemente hasta 1.500 rpm. Si el ruido aumenta de ritmo, anótalo para el mecánico.',
        riskLevel: 'medium'
      }
    ]
  },
  {
    id: 3,
    title: 'Humo del Tubo de Escape',
    zone: 'Escape',
    instruction: 'Mientras alguien acelera levemente a 2.000 rpm en parado, observa la salida del tubo de escape.',
    question: '¿Sale un humo denso de color AZUL o NEGRO espeso?',
    options: [
      {
        label: 'NO, apenas humo o vapor transparente',
        type: 'no',
        advice: '🟢 Correcto. La combustión y el consumo de aceite parecen estar en orden.',
        riskLevel: 'low'
      },
      {
        label: 'SÍ, humo azul o negro denso',
        type: 'yes',
        advice: '🔴 ALTO RIESGO: El humo azul indica consumo de aceite por retenes/turbo. El humo negro es exceso de combustible o inyectores sucios.',
        riskLevel: 'high'
      },
      {
        label: 'NO ESTOY SEGURO',
        type: 'unsure',
        advice: '💡 Un humo blanco muy ligero en días fríos es solo condensación. El peligro es el humo azulado que huele a aceite quemado.',
        riskLevel: 'medium'
      }
    ]
  },
  {
    id: 4,
    title: 'Prueba del Pedal de Embrague',
    zone: 'Transmisión',
    instruction: 'Con el motor en marcha y el freno de mano echado, mete 3ª marcha e intenta soltar el embrague despacio.',
    question: '¿El motor se cala inmediatamente o el embrague patina?',
    options: [
      {
        label: 'Se cala de golpe (Normal)',
        type: 'no',
        advice: '🟢 Perfecto. Significa que el disco de embrague aún tiene buen agarre y fuerza de fricción.',
        riskLevel: 'low'
      },
      {
        label: 'El motor no se cala / sube de vueltas (Patina)',
        type: 'yes',
        advice: '🔴 El embrague está en el límite de su vida útil. Requerirá sustitución inminente (entre 500 € y 900 €).',
        riskLevel: 'high'
      },
      {
        label: 'NO ESTOY SEGURO',
        type: 'unsure',
        advice: '💡 Si al pisar el pedal sientes una vibración fuerte en el pie, el bimasa puede tener desgaste.',
        riskLevel: 'medium'
      }
    ]
  },
  {
    id: 5,
    title: 'Comprobación de Aceite e Inspección Visual',
    zone: 'Mantenimiento',
    instruction: 'Con el motor apagado, saca la varilla del aceite y mira el reverso del tapón del aceite.',
    question: '¿Hay una pasta blanquecina estilo "mayonesa" bajo el tapón?',
    options: [
      {
        label: 'NO, está limpio / solo aceite',
        type: 'no',
        advice: '🟢 Sin signos de mezcla de junta de culata.',
        riskLevel: 'low'
      },
      {
        label: 'SÍ, hay una pasta cremosa blanquecina',
        type: 'yes',
        advice: '🔴 RIESGO EXTREMO: Indica mezcla de refrigerante con aceite (Junta de culata dañada). Desaconsejamos la compra sin prueba de presión.',
        riskLevel: 'high'
      },
      {
        label: 'NO ESTOY SEGURO',
        type: 'unsure',
        advice: '💡 En trayectos extremadamente cortos de invierno puede formarse un poso leve de condensación, pero si es abundante es junta de culata.',
        riskLevel: 'high'
      }
    ]
  }
];

interface AssistantModeProps {
  onFinish?: () => void;
}

export const AssistantMode: React.FC<AssistantModeProps> = ({ onFinish }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const currentStep = ASSISTANT_STEPS[currentStepIndex];
  const selectedOptionIdx = answers[currentStep.id];

  const handleSelectOption = (optIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentStep.id]: optIdx
    }));
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentStepIndex(0);
  };

  const highRiskCount = Object.entries(answers).filter(([stepId, optIdx]) => {
    const step = ASSISTANT_STEPS.find((s) => s.id === Number(stepId));
    const idx = Number(optIdx);
    return step?.options[idx]?.riskLevel === 'high';
  }).length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0C] text-white p-4 sm:p-6 max-w-2xl mx-auto flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-xs font-black text-emerald-400 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>MODO ASISTENTE IN SITU</span>
          </div>

          <button
            onClick={handleReset}
            className="text-xs font-black text-white/50 hover:text-white uppercase tracking-wider flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reiniciar
          </button>
        </div>

        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-1">
          🧑‍🔧 No sé qué mirar
        </h1>
        <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-6">
          Te guiamos paso a paso delante del coche para comprobar los puntos clave de seguridad.
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-[#16161D] rounded-full h-2 mb-6 border border-white/10 overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / ASSISTANT_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Interactive Step Card */}
      <div className="bg-[#16161D] border border-white/10 rounded-[32px] p-6 shadow-2xl relative flex-1 flex flex-col justify-between my-2">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
              PASO {currentStepIndex + 1} DE {ASSISTANT_STEPS.length} • {currentStep.zone}
            </span>
            {highRiskCount > 0 && (
              <span className="text-[10px] font-black text-red-400 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30 uppercase">
                ⚠️ {highRiskCount} RIESGOS DETECTADOS
              </span>
            )}
          </div>

          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-3">
            {currentStep.title}
          </h2>

          {/* Action Instruction Box */}
          <div className="bg-black p-4 rounded-2xl border border-white/10 mb-5 flex items-start gap-3">
            <Wrench className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-white/80 leading-relaxed font-bold">
              {currentStep.instruction}
            </p>
          </div>

          {/* Question */}
          <p className="text-sm font-black text-blue-400 uppercase tracking-wider mb-4">
            {currentStep.question}
          </p>

          {/* Option buttons */}
          <div className="space-y-2.5 mb-6">
            {currentStep.options.map((opt, idx) => {
              const isSelected = selectedOptionIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-4 rounded-2xl font-black text-xs uppercase tracking-wider text-left transition-all flex items-center justify-between border cursor-pointer ${
                    isSelected
                      ? opt.riskLevel === 'high'
                        ? 'bg-red-500/20 border-red-500 text-red-200'
                        : 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-lg'
                      : 'bg-black border-white/10 text-white/70 hover:border-white/30'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {/* Instant Advice Box */}
          {selectedOptionIdx !== undefined && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold leading-relaxed transition-all animate-fade-in ${
                currentStep.options[selectedOptionIdx].riskLevel === 'high'
                  ? 'bg-red-500/20 border-red-500/40 text-red-200'
                  : currentStep.options[selectedOptionIdx].riskLevel === 'medium'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
              }`}
            >
              {currentStep.options[selectedOptionIdx].advice}
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <button
            disabled={currentStepIndex === 0}
            onClick={() => setCurrentStepIndex((prev) => prev - 1)}
            className="px-4 py-2 rounded-xl text-xs font-black uppercase text-white/50 hover:text-white bg-black border border-white/10 disabled:opacity-30 flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          {currentStepIndex < ASSISTANT_STEPS.length - 1 ? (
            <button
              onClick={() => setCurrentStepIndex((prev) => prev + 1)}
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              Siguiente Paso
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onFinish}
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-white hover:bg-blue-50 text-black flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              Finalizar Revisión
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
