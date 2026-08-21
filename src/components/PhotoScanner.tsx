import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle2, ChevronRight, ChevronLeft, RotateCcw, AlertCircle, Sparkles, X, Plus, Zap, Check } from 'lucide-react';
import { PhotoSlotId, PhotoSlot } from '../types';
import { SAMPLE_DEMO_CARS, SampleDemoCar } from '../data/sampleCars';
import { compressImage } from '../utils/imageCompressor';
import { AnalyticsService } from '../services/AnalyticsService';

const QUICK_PHOTO_SLOTS: PhotoSlot[] = [
  {
    id: 'front',
    label: '1. FRONTAL',
    guide: 'Fotografía el frontal completo del vehículo.',
    iconName: 'Car',
    required: true
  },
  {
    id: 'left',
    label: '2. LATERAL',
    guide: 'Ahora fotografía el lateral para ver la línea y carrocería.',
    iconName: 'Car'
  },
  {
    id: 'interior',
    label: '3. INTERIOR',
    guide: 'Ahora el interior: volante, asientos y consola central.',
    iconName: 'Car'
  },
  {
    id: 'dashboard',
    label: '4. CUADRO DE INSTRUMENTOS',
    guide: 'Ahora el cuadro con contacto/motor en marcha para revisar testigos.',
    iconName: 'Gauge'
  }
];

const FULL_PHOTO_SLOTS: PhotoSlot[] = [
  {
    id: 'front',
    label: '1. FRONTAL',
    guide: 'Fotografía el frontal completo del vehículo.',
    iconName: 'Car',
    required: true
  },
  {
    id: 'back',
    label: '2. TRASERA',
    guide: 'Ahora fotografía la zaga completa: pilotos, paragolpes y escape.',
    iconName: 'Car'
  },
  {
    id: 'left',
    label: '3. LATERAL IZQUIERDO',
    guide: 'Ahora el lateral izquierdo completo para comprobar pintura y paneles.',
    iconName: 'Car'
  },
  {
    id: 'right',
    label: '4. LATERAL DERECHO',
    guide: 'Ahora el lateral derecho desde el paso de rueda delantero al trasero.',
    iconName: 'Car'
  },
  {
    id: 'interior',
    label: '5. INTERIOR',
    guide: 'Ahora el puesto de conducción: volante, pedales y pomo del cambio.',
    iconName: 'Car'
  },
  {
    id: 'dashboard',
    label: '6. CUADRO DE INSTRUMENTOS',
    guide: 'Ahora el cuadro de mandos con el motor en marcha para ver testigos de avería.',
    iconName: 'Gauge'
  },
  {
    id: 'engine',
    label: '7. MOTOR',
    guide: 'Abre el capó y haz una foto limpia del vano motor.',
    iconName: 'Cpu'
  },
  {
    id: 'tires',
    label: '8. NEUMÁTICOS',
    guide: 'Enfoca de cerca el dibujo y flancos de los neumáticos delanteros.',
    iconName: 'CircleDot'
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
  initialMode = 'full',
  onPhotosComplete,
  onCancel,
  onSelectSampleCar,
  onManualEntry
}) => {
  const [scanMode, setScanMode] = useState<'quick' | 'full'>(initialMode);
  const activeSlots = scanMode === 'quick' ? QUICK_PHOTO_SLOTS : FULL_PHOTO_SLOTS;

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [capturedPhotos, setCapturedPhotos] = useState<
    Partial<Record<PhotoSlotId, { url: string; base64: string }>>
  >({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [mileageInput, setMileageInput] = useState<string>('');
  const [priceInput, setPriceInput] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentSlot = activeSlots[activeStepIndex] || activeSlots[0];
  const totalCaptured = Object.keys(capturedPhotos).length;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const compressedBase64 = await compressImage(file, 1200, 0.82);
      const url = URL.createObjectURL(file);

      setCapturedPhotos((prev) => ({
        ...prev,
        [currentSlot.id]: {
          url,
          base64: compressedBase64
        }
      }));

      AnalyticsService.track('photo_captured', { slot: currentSlot.id, total: totalCaptured + 1, mode: scanMode });

      // Automatically advance to the next uncaptured slot if available
      const nextUncapturedIndex = activeSlots.findIndex(
        (slot, idx) => idx > activeStepIndex && !capturedPhotos[slot.id]
      );
      if (nextUncapturedIndex !== -1) {
        setTimeout(() => setActiveStepIndex(nextUncapturedIndex), 350);
      } else if (activeStepIndex < activeSlots.length - 1) {
        setTimeout(() => setActiveStepIndex(activeStepIndex + 1), 350);
      }
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

  const handleStartAnalysis = () => {
    const mileage = mileageInput ? parseInt(mileageInput, 10) : undefined;
    const price = priceInput ? parseInt(priceInput, 10) : undefined;
    AnalyticsService.trackScanStarted(totalCaptured, scanMode);
    onPhotosComplete(capturedPhotos, mileage, price);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0C] text-white p-4 sm:p-6 max-w-4xl mx-auto flex flex-col justify-between">
      {/* Top Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onCancel}
            className="min-h-[44px] text-xs font-black uppercase tracking-wider text-white/70 hover:text-white flex items-center gap-1 bg-[#16161D] px-4 py-2 rounded-full border border-white/10 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </button>

          {/* Mode Switcher */}
          <div className="flex bg-[#16161D] p-1 rounded-full border border-white/10">
            <button
              onClick={() => {
                setScanMode('quick');
                if (activeStepIndex >= QUICK_PHOTO_SLOTS.length) setActiveStepIndex(0);
              }}
              className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer ${
                scanMode === 'quick' ? 'bg-amber-500 text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Rápido (4)
            </button>
            <button
              onClick={() => setScanMode('full')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer ${
                scanMode === 'full' ? 'bg-cyan-400 text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Completo (8)
            </button>
          </div>

          <div className="text-right">
            <span className="text-xs text-white/50 font-black uppercase tracking-widest hidden sm:inline">Fotos:</span>
            <span className="ml-2 px-3 py-1.5 text-xs font-black rounded-full bg-cyan-400 text-black">
              {totalCaptured} / {activeSlots.length}
            </span>
          </div>
        </div>

        {/* Demo car & Manual fallback shortcut */}
        <div className="bg-[#16161D] border border-white/5 rounded-2xl p-3 mb-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-white/60 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              ¿Sin fotos a mano? Prueba con un coche demo:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_DEMO_CARS.slice(0, 3).map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => onSelectSampleCar(demo)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-400 hover:text-black text-white text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {demo.name.split(' ')[0]} {demo.name.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          {onManualEntry && (
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-white/50 font-medium">
                ¿No reconocemos tu coche o prefieres introducir los datos a mano?
              </span>
              <button
                type="button"
                onClick={onManualEntry}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-400 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
              >
                <span>Introducir coche manualmente</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Step Navigation Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {activeSlots.map((slot, idx) => {
            const isCaptured = !!capturedPhotos[slot.id];
            const isActive = idx === activeStepIndex;

            return (
              <button
                key={slot.id}
                onClick={() => setActiveStepIndex(idx)}
                className={`flex-shrink-0 min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-400 text-black shadow-lg'
                    : isCaptured
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-[#16161D] text-white/60 border border-white/5 hover:bg-white/10'
                }`}
              >
                {isCaptured ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-black text-[10px] flex items-center justify-center font-black">
                    {idx + 1}
                  </span>
                )}
                <span>{slot.label.split('. ')[1] || slot.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guided Conversation Viewport Card */}
      <div className="flex-1 flex flex-col items-center justify-center my-2">
        <div className="w-full max-w-md bg-[#16161D] border border-white/10 rounded-[32px] p-6 shadow-2xl relative flex flex-col items-center">
          
          {/* Dynamic conversational instruction */}
          <div className="w-full text-center mb-4">
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full mb-2">
              PASO {activeStepIndex + 1} DE {activeSlots.length} • {currentSlot.label}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight">
              {capturedPhotos[currentSlot.id]
                ? '¡Perfecto! Foto registrada.'
                : currentSlot.guide}
            </h2>
            <p className="text-xs text-white/60 mt-1 max-w-xs mx-auto leading-relaxed font-medium">
              {capturedPhotos[currentSlot.id]
                ? 'Puedes avanzar al siguiente paso o reemplazar la foto si lo prefieres.'
                : 'Asegúrate de que la iluminación sea buena y no esté borrosa.'}
            </p>
          </div>

          {/* Camera / Photo Canvas */}
          <div className="w-full h-64 bg-black rounded-2xl border-2 border-dashed border-white/20 hover:border-cyan-400 transition-colors relative overflow-hidden flex flex-col items-center justify-center group">
            {capturedPhotos[currentSlot.id] ? (
              <div className="relative w-full h-full">
                <img
                  src={capturedPhotos[currentSlot.id]?.url}
                  alt={currentSlot.label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => removePhoto(currentSlot.id)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-black/80 text-red-400 hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
                    title="Eliminar foto"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-emerald-500 text-black text-xs font-black uppercase px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Check className="w-4 h-4 stroke-[3]" />
                  REGISTRADA
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full flex flex-col items-center justify-center p-4 text-center cursor-pointer min-h-[44px]"
              >
                <div className="w-20 h-20 border-2 border-cyan-400/40 rounded-2xl flex items-center justify-center bg-cyan-400/10 mb-3 group-hover:scale-105 group-hover:border-cyan-400 transition-all">
                  <Camera className="w-9 h-9 text-cyan-400 animate-pulse" />
                </div>
                <p className="text-xs font-black uppercase text-cyan-400 tracking-wider">
                  TOCA AQUÍ PARA TOMAR O SUBIR FOTO
                </p>
                <p className="text-[10px] font-bold text-white/40 mt-1 uppercase">
                  CÁMARA DEL MÓVIL O GALERÍA (JPG, PNG, WEBP)
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Stepper Controls */}
          <div className="w-full flex items-center justify-between mt-4 gap-2">
            <button
              disabled={activeStepIndex === 0}
              onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
              className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-black uppercase text-white/60 bg-black border border-white/10 hover:text-white disabled:opacity-30 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[44px] flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-white hover:bg-cyan-50 text-black flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Camera className="w-4 h-4 text-cyan-600" />
              {capturedPhotos[currentSlot.id] ? 'Cambiar Foto' : 'Tomar Foto'}
            </button>

            <button
              disabled={activeStepIndex === activeSlots.length - 1}
              onClick={() => setActiveStepIndex((prev) => Math.min(activeSlots.length - 1, prev + 1))}
              className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-black uppercase text-white/60 bg-black border border-white/10 hover:text-white disabled:opacity-30 flex items-center gap-1 cursor-pointer"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Frictionless Extra Info (Optional) */}
      <div className="bg-[#16161D] border border-white/5 rounded-2xl p-3.5 my-3">
        <div className="text-[11px] font-black uppercase tracking-wider text-white/70 mb-2 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
          DATOS OPCIONALES DEL ANUNCIO (AYUDAN A PRECISAR EL COSTE):
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <input
              type="number"
              placeholder="Kilómetros aproximados (ej: 145000)"
              value={mileageInput}
              onChange={(e) => setMileageInput(e.target.value)}
              className="w-full min-h-[44px] bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <input
              type="number"
              placeholder="Precio anunciado en Euros (€)"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              className="w-full min-h-[44px] bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Main Bottom Trigger (>44px touch target) */}
      <div className="pt-2 border-t border-white/10">
        <button
          disabled={totalCaptured === 0}
          onClick={handleStartAnalysis}
          className={`w-full min-h-[48px] py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl transition-all ${
            totalCaptured > 0
              ? 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-cyan-500/20 scale-100 hover:scale-[1.01] active:scale-95 cursor-pointer'
              : 'bg-[#16161D] text-white/30 border border-white/5 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-5 h-5 text-black" />
          <span>
            {totalCaptured > 0
              ? `ANALIZAR COCHE CON IA (${totalCaptured} FOTOS)`
              : 'HAZ AL MENOS 1 FOTO PARA ANALIZAR'}
          </span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
