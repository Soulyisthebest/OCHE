import React, { useState } from 'react';
import {
  Wrench, CheckCircle2, AlertTriangle, XCircle, ChevronRight,
  ChevronLeft, RotateCcw, Volume2, Flame, ShieldAlert, Sparkles, Check
} from 'lucide-react';

interface InspectionStep {
  id: number;
  title: string;
  category: string;
  iconEmoji: string;
  instruction: string;
  testAction?: {
    label: string;
    steps: string[];
  };
  options: {
    label: string;
    status: 'good' | 'warning' | 'danger';
    advice: string;
    estimatedCost?: string;
  }[];
}

const IN_SITU_STEPS: InspectionStep[] = [
  {
    id: 1,
    title: 'Comprobar motor en frío',
    category: 'Vano Motor',
    iconEmoji: '❄️',
    instruction: 'Toca el capó con la mano antes de arrancar. Debe estar totalmente frío.',
    testAction: {
      label: '¿Por qué es importante?',
      steps: [
        'Muchos vendedores calientan el motor antes para ocultar humo de arranque o ruidos de cadena.',
        'Si está caliente, pide esperar 20 minutos o probarlo en frío.'
      ]
    },
    options: [
      {
        label: '🟢 Está frío (Normal)',
        status: 'good',
        advice: 'Perfecto. Podrás comprobar si la cadena suena o echa humo al arrancar.'
      },
      {
        label: '🟡 Está caliente (Sospechoso)',
        status: 'warning',
        advice: 'Atención: Arrancar en caliente disimula fallos de inyectores o taqués.',
        estimatedCost: 'Revisión en taller: 50 €'
      }
    ]
  },
  {
    id: 2,
    title: 'Sonido al arrancar y ralentí',
    category: 'Sonido y Distribución',
    iconEmoji: '👂',
    instruction: 'Abre la puerta, arranca el motor y escucha durante 15 segundos con atención.',
    testAction: {
      label: 'Prueba auditiva:',
      steps: [
        '1. Gira la llave o pulsa arranque con la ventana bajada.',
        '2. Escucha si suena un "cla-cla-cla" metálico durante los primeros 3 segundos.',
        '3. Comprueba si el ralentí oscila o vibra el volante.'
      ]
    },
    options: [
      {
        label: '🟢 Suave y estable (Bien)',
        status: 'good',
        advice: 'El motor suena redondo y sin holguras aparentes en la distribución.'
      },
      {
        label: '🟡 Chirrido o silbido agudo',
        status: 'warning',
        advice: 'Probable correa auxiliar o polea del alternador desgastada.',
        estimatedCost: '80–200 €'
      },
      {
        label: '🔴 Traqueteo metálico fuerte',
        status: 'danger',
        advice: 'Posible holgura de cadena de distribución o taqués hidráulicos.',
        estimatedCost: '600–1.400 €'
      }
    ]
  },
  {
    id: 3,
    title: 'Prueba del pedal de embrague',
    category: 'Caja y Transmisión',
    iconEmoji: '🦶',
    instruction: 'Esto NO se puede ver en una foto. Haz esta prueba física en parado:',
    testAction: {
      label: 'Cómo probar el embrague en 10 segundos:',
      steps: [
        '1. Freno de mano bien puesto.',
        '2. Mete 3ª marcha (no primera).',
        '3. Acelera suavemente a 1.500 rpm.',
        '4. Suelta el pedal del embrague poco a poco.'
      ]
    },
    options: [
      {
        label: '🟢 El motor se cala de golpe (Normal)',
        status: 'good',
        advice: 'El disco de embrague muerde con fuerza. El desgaste es correcto.'
      },
      {
        label: '🔴 El motor sube de vueltas sin calarse (Patina)',
        status: 'danger',
        advice: 'El embrague está al final de su vida útil y patina bajo carga.',
        estimatedCost: '500–900 €'
      },
      {
        label: '🟡 Pedal muy duro o vibra el pie',
        status: 'warning',
        advice: 'Maza de embrague o volante bimasa con fatiga.',
        estimatedCost: '400–800 €'
      }
    ]
  },
  {
    id: 4,
    title: 'Humo del tubo de escape',
    category: 'Gases y Combustión',
    iconEmoji: '💨',
    instruction: 'Pide que aceleren levemente en punto muerto y mira el escape.',
    testAction: {
      label: 'Qué buscar en el color del humo:',
      steps: [
        '• Blanco tenue en frío: Solo vapor de agua (normal).',
        '• Azulado con olor a quemado: Consumo de aceite por motor o turbo.',
        '• Negro denso: Mala combustión o inyectores sucios.'
      ]
    },
    options: [
      {
        label: '🟢 Sin humo o vapor transparente (Bien)',
        status: 'good',
        advice: 'Combustión limpia y sin consumo anómalo visible de aceite.'
      },
      {
        label: '🟡 Humo negro al acelerar',
        status: 'warning',
        advice: 'Inyección sucia o filtro de partículas saturado.',
        estimatedCost: '150–400 €'
      },
      {
        label: '🔴 Humo azulado persistente',
        status: 'danger',
        advice: 'Aceite entrando en los cilindros (segmentos, guías o turbo).',
        estimatedCost: '800–2.000 €'
      }
    ]
  },
  {
    id: 5,
    title: 'Revisión del tapón del aceite',
    category: 'Circuito de Refrigeración',
    iconEmoji: '🧪',
    instruction: 'Con el motor apagado, desenrosca el tapón de llenado de aceite y mira la base.',
    testAction: {
      label: 'Comprobación visual rápida:',
      steps: [
        '1. Mira el reverso de la rosca del tapón.',
        '2. ¿Ves aceite normal marrón/negro?',
        '3. ¿O hay una pasta espesa amarillenta parecida a mayonesa?'
      ]
    },
    options: [
      {
        label: '🟢 Solo aceite limpio / negro (Correcto)',
        status: 'good',
        advice: 'Sin indicios de mezcla entre anticongelante y aceite.'
      },
      {
        label: '🔴 Pasta blanquecina o "mayonesa"',
        status: 'danger',
        advice: 'Anticongelante mezclándose con aceite (posible junta de culata dañada). Desaconsejamos la compra sin prueba de presión.',
        estimatedCost: '900–1.800 €'
      }
    ]
  }
];

interface AssistantModeProps {
  onFinish?: () => void;
}

export const AssistantMode: React.FC<AssistantModeProps> = ({ onFinish }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showSummary, setShowSummary] = useState<boolean>(false);

  const currentStep = IN_SITU_STEPS[currentStepIdx];
  const selectedOptIdx = answers[currentStep?.id];

  const handleSelectOption = (optIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentStep.id]: optIdx
    }));
  };

  const handleNext = () => {
    if (currentStepIdx < IN_SITU_STEPS.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentStepIdx(0);
    setShowSummary(false);
  };

  // Compute final in-situ verdict
  const totalAnswered = Object.keys(answers).length;
  const dangerCount = Object.entries(answers).filter(
    ([stepId, optIdx]) => IN_SITU_STEPS.find((s) => s.id === Number(stepId))?.options[Number(optIdx)]?.status === 'danger'
  ).length;
  const warningCount = Object.entries(answers).filter(
    ([stepId, optIdx]) => IN_SITU_STEPS.find((s) => s.id === Number(stepId))?.options[Number(optIdx)]?.status === 'warning'
  ).length;

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#07090E] text-white p-4 sm:p-6 max-w-lg mx-auto flex flex-col justify-between pb-24 sm:pb-8">
      {!showSummary ? (
        <>
          {/* Top Progress */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <button
                id="assistant-back-btn"
                onClick={onFinish}
                className="text-xs font-bold text-white/60 hover:text-white flex items-center gap-1 bg-[#121622] px-3 py-1.5 rounded-full border border-white/10 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Salir</span>
              </button>

              <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                GUÍAME • PASO {currentStepIdx + 1}/{IN_SITU_STEPS.length}
              </span>

              <span className="text-xs text-white/50">
                {totalAnswered} comprobados
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#141824] h-1.5 rounded-full overflow-hidden mb-5">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${((currentStepIdx + 1) / IN_SITU_STEPS.length) * 100}%`
                }}
              />
            </div>

            {/* Step Header */}
            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-cyan-300 text-[10px] font-black uppercase tracking-wider mb-2">
                <span>{currentStep.category}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">{currentStep.iconEmoji}</span>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {currentStep.title}
                </h2>
              </div>
              <p className="text-sm text-white/80 font-medium mt-1.5">
                {currentStep.instruction}
              </p>
            </div>

            {/* Test Action Box */}
            {currentStep.testAction && (
              <div className="bg-[#101420] border border-cyan-500/20 rounded-2xl p-4 mb-4 space-y-2">
                <div className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{currentStep.testAction.label}</span>
                </div>
                <div className="space-y-1.5 text-xs text-white/80">
                  {currentStep.testAction.steps.map((s, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Options Selector */}
            <div className="space-y-2.5 mb-4">
              <div className="text-xs font-bold text-white/50 uppercase tracking-wider">
                ¿Qué has observado?
              </div>
              {currentStep.options.map((opt, idx) => {
                const isSelected = selectedOptIdx === idx;
                return (
                  <button
                    key={idx}
                    id={`assistant-opt-${currentStep.id}-${idx}`}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                      isSelected
                        ? opt.status === 'good'
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/10'
                          : opt.status === 'warning'
                          ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                          : 'bg-red-500/20 border-red-400 text-white shadow-lg shadow-red-500/10'
                        : 'bg-[#11141E] border-white/10 hover:border-white/20 text-white/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-cyan-300 stroke-[3]" />}
                    </div>
                    {isSelected && (
                      <div className="mt-2 pt-2 border-t border-white/10 text-xs text-white/90">
                        <p>{opt.advice}</p>
                        {opt.estimatedCost && (
                          <p className="mt-1 text-amber-300 font-bold">
                            💰 Coste estimado de reparación: {opt.estimatedCost}
                          </p>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
            <button
              id="assistant-prev-btn"
              disabled={currentStepIdx === 0}
              onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
              className="py-3 px-4 rounded-xl bg-[#121622] text-white/70 hover:text-white text-xs font-bold disabled:opacity-30 cursor-pointer"
            >
              ← Anterior
            </button>

            <button
              id="assistant-next-btn"
              disabled={selectedOptIdx === undefined}
              onClick={handleNext}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{currentStepIdx === IN_SITU_STEPS.length - 1 ? 'Ver Veredicto Final' : 'Siguiente'}</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </>
      ) : (
        /* Summary Screen at the end of Guided Inspection */
        <div className="space-y-5 my-auto">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-3xl mx-auto mb-3">
              {dangerCount > 0 ? '⚠️' : warningCount > 0 ? '🟡' : '🟢'}
            </div>
            <h2 className="text-2xl font-black text-white">
              Inspección In Situ Completada
            </h2>
            <p className="text-xs text-white/60 mt-1">
              Has revisado los 5 puntos mecánicos críticos del coche.
            </p>
          </div>

          {/* Verdict Box */}
          <div className={`p-4 rounded-2xl border ${
            dangerCount > 0
              ? 'bg-red-500/15 border-red-500/40 text-red-100'
              : warningCount > 0
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-100'
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-100'
          }`}>
            <div className="text-xs font-black uppercase tracking-wider">
              {dangerCount > 0
                ? '🔴 ALTO RIESGO DETECTADO'
                : warningCount > 0
                ? '🟡 RECOMENDACIÓN: NEGOCIAR REBAJA'
                : '🟢 COCHE EN BUEN ESTADO APARENTE'}
            </div>
            <p className="text-xs mt-1.5 leading-relaxed font-medium">
              {dangerCount > 0
                ? `Se han detectado ${dangerCount} puntos graves que desaconsejan la compra sin prueba mecánica previa en taller profesional.`
                : warningCount > 0
                ? `Se han encontrado ${warningCount} desgastes moderados. Te sugerimos usarlos para negociar una rebaja del precio de venta.`
                : 'No se han apreciado fallos graves en frío, embrague ni humo. Buen candidato para comprar.'}
            </p>
          </div>

          {/* List of checked items */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-white/50 uppercase tracking-wider">
              Resumen de comprobaciones:
            </div>
            {IN_SITU_STEPS.map((step) => {
              const optIdx = answers[step.id];
              const opt = optIdx !== undefined ? step.options[optIdx] : null;
              return (
                <div
                  key={step.id}
                  className="bg-[#11141E] border border-white/5 rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-white">{step.title}</span>
                  <span className="font-bold">
                    {opt ? opt.label.split(' ')[0] + ' ' + opt.label.split(' ')[1] : '⚪ No comprobado'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button
              id="assistant-finish-to-home-btn"
              onClick={onFinish}
              className="w-full py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Finalizar e ir a Inicio
            </button>
            <button
              id="assistant-repeat-btn"
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-white/60 text-xs font-bold cursor-pointer"
            >
              Repetir comprobación
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
