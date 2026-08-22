import React, { useState, useRef } from 'react';
import {
  Camera, Upload, CheckCircle2, ChevronRight, ChevronLeft,
  RotateCcw, Sparkles, X, Plus, Zap, Check, Eye, AlertCircle
} from 'lucide-react';
import { PhotoSlotId, PhotoSlot } from '../types';
import { SAMPLE_DEMO_CARS, SampleDemoCar } from '../data/sampleCars';
import { compressImage } from '../utils/imageCompressor';
import { AnalyticsService } from '../services/AnalyticsService';

interface InspectionMissionStep {
  id: PhotoSlotId;
  label: string;
  stepName: string;
  challengeTitle: string;
  instruction: string;
  frameGuide: string;
  iconEmoji: string;
  required?: boolean;
}

const MISSION_STEPS: InspectionMissionStep[] = [
  {
    id: 'front',
    label: 'Frontal',
    stepName: 'Misión 1: Frontal completo',
    challengeTitle: 'FRENTE Y MATRÍCULA',
    instruction: 'Encuadra el morro completo con los faros y la matrícula dentro del marco.',
    frameGuide: 'Encuadra el frontal completo',
    iconEmoji: '🚗',
    required: true
  },
  {
    id: 'dashboard',
    label: 'Cuadro',
    stepName: 'Misión 2: Cuadro de mandos',
    challengeTitle: 'TESTIGOS Y KILÓMETROS',
    instruction: 'Haz la foto al cuadro con el contacto puesto para leer los km y testigos.',
    frameGuide: 'Encuadra el velocímetro y pantalla',
    iconEmoji: '⏱️'
  },
  {
    id: 'tires',
    label: 'Neumáticos',
    stepName: 'Misión 3: Neumático delantero',
    challengeTitle: 'DESGASTE Y DIBUJO',
    instruction: 'Acércate a la rueda delantera para comprobar la profundidad del dibujo y flancos.',
    frameGuide: 'Encuadra el dibujo de la rueda',
    iconEmoji: '🛞'
  },
  {
    id: 'engine',
    label: 'Motor',
    stepName: 'Misión 4: Vano motor',
    challengeTitle: 'MOTOR Y FUGAS',
    instruction: 'Abre el capó y haz una foto general para detectar fugas o cables sueltos.',
    frameGuide: 'Encuadra el vano motor abierto',
    iconEmoji: '🔧'
  },
  {
    id: 'interior',
    label: 'Interior',
    stepName: 'Misión 5: Puesto de mando',
    challengeTitle: 'VOLANTE Y PEDALES',
    instruction: 'Fotografía el volante, asiento del conductor y pomo del cambio.',
    frameGuide: 'Encuadra volante y asiento',
    iconEmoji: '🪑'
  },
  {
    id: 'left',
    label: 'Lateral',
    stepName: 'Misión 6: Costado izquierdo',
    challengeTitle: 'LÍNEAS Y PINTURA',
    instruction: 'Fotografía el lateral desde la esquina para ver reflejos, abolladuras y holguras.',
    frameGuide: 'Encuadra el costado completo',
    iconEmoji: '🚙'
  },
  {
    id: 'back',
    label: 'Trasera',
    stepName: 'Misión 7: Parte trasera',
    challengeTitle: 'ESCAPE Y PILOTOS',
    instruction: 'Fotografía el portón del maletero, paragolpes trasero y escape.',
    frameGuide: 'Encuadra la zaga completa',
    iconEmoji: '🚘'
  },
  {
    id: 'right',
    label: 'Lateral Dcho.',
    stepName: 'Misión 8: Costado derecho',
    challengeTitle: 'AJUSTE DE PUERTAS',
    instruction: 'Termina revisando el costado derecho para cerrar la comprobación 360º.',
    frameGuide: 'Encuadra el lateral derecho',
    iconEmoji: '🚙'
  }
];

interface PhotoScannerProps {
  initialMode?: 'quick' | 'full';
  onPhotosComplete: (
    photos: Partial<Record<PhotoSlotId, { url?: string; base64?: string }>>,
    mileageKm?: number,
    askingPrice?: number
  ) => void;
  onCancel: () => void;
  onSelectSampleCar: (car: SampleDemoCar) => void;
  onManualEntry?: () => void;
}

export const PhotoScanner: React.FC<PhotoScannerProps> = ({
  onPhotosComplete,
  onCancel,
  onSelectSampleCar,
  onManualEntry
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [capturedPhotos, setCapturedPhotos] = useState<
    Partial<Record<PhotoSlotId, { url: string; base64: string }>>
  >({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [stepFeedback, setStepFeedback] = useState<{ slotId: PhotoSlotId; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentStep = MISSION_STEPS[activeStepIndex] || MISSION_STEPS[0];
  const totalCaptured = Object.keys(capturedPhotos).length;
  const currentPhoto = capturedPhotos[currentStep.id];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const compressedBase64 = await compressImage(file, 1200, 0.82);
      const url = URL.createObjectURL(file);

      setCapturedPhotos((prev) => ({
        ...prev,
        [currentStep.id]: {
          url,
          base64: compressedBase64
        }
      }));

      AnalyticsService.track('photo_captured', {
        slot: currentStep.id,
        total: totalCaptured + 1
      });

      // Quick positive feedback
      setStepFeedback({
        slotId: currentStep.id,
        text: '¡Foto guardada correctamente!'
      });

      setTimeout(() => {
        setStepFeedback(null);
        if (activeStepIndex < MISSION_STEPS.length - 1) {
          setActiveStepIndex((prev) => prev + 1);
        }
      }, 700);
    } catch (err) {
      console.error('Error procesando imagen', err);
    } finally {
      setIsProcessing(false);
      if (e.target) e.target.value = '';
    }
  };

  const removePhoto = (slotId: PhotoSlotId) => {
    setCapturedPhotos((prev) => {
      const copy = { ...prev };
      delete copy[slotId];
      return copy;
    });
  };

  const handleFinish = () => {
    AnalyticsService.trackScanStarted(totalCaptured, 'full');
    onPhotosComplete(capturedPhotos);
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#07090E] text-white p-4 sm:p-6 max-w-lg mx-auto flex flex-col justify-between pb-24 sm:pb-8">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Mission Progress Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <button
            id="scanner-back-btn"
            onClick={onCancel}
            className="text-xs font-bold text-white/60 hover:text-white flex items-center gap-1 bg-[#121622] px-3 py-1.5 rounded-full border border-white/10 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Salir</span>
          </button>

          {/* Game-like Step Indicators (Dots) */}
          <div className="flex items-center gap-1.5" title={`${totalCaptured} de ${MISSION_STEPS.length} completadas`}>
            {MISSION_STEPS.map((step, idx) => {
              const isDone = !!capturedPhotos[step.id];
              const isCurrent = idx === activeStepIndex;
              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`cursor-pointer transition-all ${
                    isCurrent
                      ? 'w-4 h-2 rounded-full bg-cyan-400'
                      : isDone
                      ? 'w-2 h-2 rounded-full bg-emerald-400'
                      : 'w-2 h-2 rounded-full bg-white/20'
                  }`}
                />
              );
            })}
          </div>

          <span className="px-2.5 py-1 text-[11px] font-black rounded-full bg-[#141824] border border-white/10 text-cyan-300">
            {activeStepIndex + 1}/{MISSION_STEPS.length}
          </span>
        </div>

        {/* Current Mission Challenge */}
        <div className="text-center my-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black tracking-widest uppercase mb-1">
            <span>PASO {activeStepIndex + 1} DE {MISSION_STEPS.length}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">{currentStep.iconEmoji}</span>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              {currentStep.challengeTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-white/70 font-medium max-w-sm mx-auto mt-1">
            {currentStep.instruction}
          </p>
        </div>

        {/* Game-like Camera Viewfinder & Preview */}
        <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border-2 border-white/15 bg-[#0A0D15] flex flex-col items-center justify-center mb-4 shadow-2xl">
          {/* Visual Framing Overlay */}
          <div className="absolute inset-4 border border-dashed border-cyan-400/30 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
            <div className="flex justify-between">
              <span className="w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
              <span className="w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
            </div>
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/80 bg-black/60 px-2.5 py-1 rounded-full border border-cyan-400/20 backdrop-blur-sm">
                {currentStep.frameGuide}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
              <span className="w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
            </div>
          </div>

          {currentPhoto ? (
            <div className="relative w-full h-full group">
              <img
                src={currentPhoto.url}
                alt={currentStep.stepName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-white text-black font-black text-xs uppercase"
                >
                  Repetir foto
                </button>
                <button
                  type="button"
                  onClick={() => removePhoto(currentStep.id)}
                  className="px-3 py-1.5 rounded-xl bg-red-500 text-white font-black text-xs uppercase"
                >
                  Eliminar
                </button>
              </div>
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500 text-black text-[11px] font-black uppercase flex items-center gap-1 shadow-lg">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                Comprobado
              </div>
            </div>
          ) : (
            <div className="text-center p-6 space-y-2 z-10">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mx-auto flex items-center justify-center text-3xl shadow-inner">
                {currentStep.iconEmoji}
              </div>
              <div className="text-xs font-bold text-white/70">
                Apunta con la cámara y encuadra aquí
              </div>
            </div>
          )}

          {/* Micro Feedback Toast */}
          {stepFeedback && (
            <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-2 animate-scale-in">
              <div className="w-12 h-12 rounded-full bg-emerald-400 text-black flex items-center justify-center">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <span className="text-sm font-black uppercase text-emerald-300 tracking-wider">
                {stepFeedback.text}
              </span>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-black/80 z-30 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold text-cyan-300">Comprobando imagen...</span>
            </div>
          )}
        </div>

        {/* Primary Action Button: Take Photo */}
        <div className="space-y-2.5">
          <button
            id="scanner-take-photo-btn"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 active:scale-[0.99] transition-all cursor-pointer"
          >
            <Camera className="w-5 h-5 stroke-[2.5]" />
            <span>{currentPhoto ? 'Repetir foto' : 'Tomar o subir foto'}</span>
          </button>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              id="scanner-prev-step-btn"
              disabled={activeStepIndex === 0}
              onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
              className="py-2.5 px-4 rounded-xl bg-[#121622] hover:bg-[#181D2B] text-white/70 hover:text-white text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              ← Anterior
            </button>

            {activeStepIndex < MISSION_STEPS.length - 1 ? (
              <button
                type="button"
                id="scanner-skip-step-btn"
                onClick={() => setActiveStepIndex((prev) => prev + 1)}
                className="py-2.5 px-4 rounded-xl bg-[#121622] hover:bg-[#181D2B] text-white/70 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                Saltar paso →
              </button>
            ) : (
              <button
                type="button"
                id="scanner-finish-step-btn"
                onClick={handleFinish}
                className="py-2.5 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Finalizar inspección →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar: Finish / Sample / Manual */}
      <div className="pt-4 border-t border-white/10 space-y-3 mt-4">
        {totalCaptured > 0 && (
          <button
            type="button"
            id="scanner-complete-analysis-btn"
            onClick={handleFinish}
            className="w-full py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <span>Analizar ahora con {totalCaptured} {totalCaptured === 1 ? 'foto' : 'fotos'}</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        )}

        <div className="flex items-center justify-between text-xs text-white/50">
          {onManualEntry && (
            <button
              type="button"
              onClick={onManualEntry}
              className="text-cyan-400 hover:underline font-bold text-[11px] cursor-pointer"
            >
              Introducir datos a mano
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">O probar:</span>
            {SAMPLE_DEMO_CARS.slice(0, 2).map((demo) => (
              <button
                key={demo.id}
                type="button"
                onClick={() => onSelectSampleCar(demo)}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold"
              >
                {demo.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
