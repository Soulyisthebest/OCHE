import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle2, ChevronRight, ChevronLeft, RotateCcw, AlertCircle, Sparkles, X, Plus } from 'lucide-react';
import { PhotoSlotId, PhotoSlot } from '../types';
import { SAMPLE_DEMO_CARS, SampleDemoCar } from '../data/sampleCars';

const PHOTO_SLOTS: PhotoSlot[] = [
  {
    id: 'front',
    label: 'Parte delantera',
    guide: 'Fotografía el frontal completo. Intenta que el coche ocupe la mayor parte de la pantalla.',
    iconName: 'Car',
    required: true
  },
  {
    id: 'back',
    label: 'Parte trasera',
    guide: 'Fotografía la zaga del coche abarcando pilotos, tubo de escape y maletero cerrado.',
    iconName: 'Car'
  },
  {
    id: 'left',
    label: 'Lateral izquierdo',
    guide: 'Captura el lateral completo de lado a lado para verificar línea de puertas y pintura.',
    iconName: 'Car'
  },
  {
    id: 'right',
    label: 'Lateral derecho',
    guide: 'Captura el otro lateral desde el paso de rueda delantero al trasero.',
    iconName: 'Car'
  },
  {
    id: 'interior',
    label: 'Interior y asientos',
    guide: 'Muestra el estado del volante, asiento del conductor y consola central.',
    iconName: 'Car'
  },
  {
    id: 'dashboard',
    label: 'Cuadro de instrumentos',
    guide: 'Fotografía el cuadro con el motor en marcha para revisar si hay testigos de avería encendidos.',
    iconName: 'Gauge'
  },
  {
    id: 'engine',
    label: 'Vano Motor',
    guide: 'Abre el capó y haz una foto limpia del motor. Importante para buscar manchas de aceite o manchones.',
    iconName: 'Cpu'
  },
  {
    id: 'tires',
    label: 'Neumáticos',
    guide: 'Enfoca de cerca el dibujo del neumático delantero para revisar el desgaste visual.',
    iconName: 'CircleDot'
  },
  {
    id: 'trunk',
    label: 'Maletero',
    guide: 'Abre el maletero y fotografía la zona de la rueda de repuesto o kit antipinchazos.',
    iconName: 'Package'
  },
  {
    id: 'docs',
    label: 'Matrícula / Documentación (Opcional)',
    guide: 'Si lo deseas, fotografía la ficha técnica o permiso para verificar versión exacta.',
    iconName: 'FileText'
  }
];

interface PhotoScannerProps {
  onPhotosComplete: (
    photos: Partial<Record<PhotoSlotId, { url?: string; base64?: string }>>,
    mileageKm?: number,
    askingPrice?: number
  ) => void;
  onCancel: () => void;
  onSelectSampleCar: (car: SampleDemoCar) => void;
}

export const PhotoScanner: React.FC<PhotoScannerProps> = ({
  onPhotosComplete,
  onCancel,
  onSelectSampleCar
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [capturedPhotos, setCapturedPhotos] = useState<
    Partial<Record<PhotoSlotId, { url: string; base64?: string }>>
  >({});
  
  // Optional extra fast inputs right on step page
  const [mileageInput, setMileageInput] = useState<string>('');
  const [priceInput, setPriceInput] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentSlot = PHOTO_SLOTS[activeStepIndex];
  const totalCaptured = Object.keys(capturedPhotos).length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      setCapturedPhotos((prev) => ({
        ...prev,
        [currentSlot.id]: {
          url: base64,
          base64: base64
        }
      }));

      // Advance automatically to next step if available
      if (activeStepIndex < PHOTO_SLOTS.length - 1) {
        setActiveStepIndex((prev) => prev + 1);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removePhoto = (slotId: PhotoSlotId) => {
    setCapturedPhotos((prev) => {
      const copy = { ...prev };
      delete copy[slotId];
      return copy;
    });
  };

  const handleStartAnalysis = () => {
    if (totalCaptured === 0) return;

    const parsedMileage = mileageInput ? parseInt(mileageInput, 10) : undefined;
    const parsedPrice = priceInput ? parseInt(priceInput, 10) : undefined;

    onPhotosComplete(capturedPhotos, parsedMileage, parsedPrice);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0C] text-white p-4 sm:p-6 max-w-5xl mx-auto flex flex-col justify-between">
      {/* Top Bar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onCancel}
            className="text-xs font-black uppercase tracking-wider text-white/70 hover:text-white flex items-center gap-1 bg-[#16161D] px-4 py-2 rounded-full border border-white/10 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </button>

          <div className="text-right">
            <span className="text-xs text-white/40 font-black uppercase tracking-widest">Fotos capturadas:</span>
            <span className="ml-2 px-3 py-1 text-xs font-black rounded-full bg-blue-500 text-black">
              {totalCaptured} / {PHOTO_SLOTS.length}
            </span>
          </div>
        </div>

        {/* Quick Sample Selector Bar */}
        <div className="bg-[#16161D] border border-white/10 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-white/80 font-bold">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="uppercase tracking-wider">¿Sin fotos? Prueba un coche demo:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_DEMO_CARS.map((demo) => (
              <button
                key={demo.id}
                onClick={() => onSelectSampleCar(demo)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-blue-600 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                {demo.name}
              </button>
            ))}
          </div>
        </div>

        {/* Guided Slot Selector Pill Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {PHOTO_SLOTS.map((slot, idx) => {
            const isCaptured = !!capturedPhotos[slot.id];
            const isActive = idx === activeStepIndex;

            return (
              <button
                key={slot.id}
                onClick={() => setActiveStepIndex(idx)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : isCaptured
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-[#16161D] text-white/60 border border-white/5 hover:bg-white/10'
                }`}
              >
                {isCaptured ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-black text-[10px] flex items-center justify-center font-black">
                    {idx + 1}
                  </span>
                )}
                <span>{slot.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Guided Phone Viewport Screen */}
      <div className="flex-1 flex flex-col items-center justify-center my-2">
        <div className="w-full max-w-md bg-[#16161D] border border-white/10 rounded-[32px] p-6 shadow-2xl relative flex flex-col items-center">
          
          {/* Header instructions for step */}
          <div className="w-full text-center mb-4">
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full mb-2">
              PASO {activeStepIndex + 1} DE {PHOTO_SLOTS.length}
            </span>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center justify-center gap-2">
              <span>📸</span>
              <span>{currentSlot.label}</span>
            </h2>
            <p className="text-xs text-white/70 mt-1 max-w-xs mx-auto leading-relaxed font-medium">
              {currentSlot.guide}
            </p>
          </div>

          {/* Phone Camera Canvas Placeholder */}
          <div className="w-full h-64 bg-black rounded-2xl border-2 border-dashed border-white/20 hover:border-blue-500 transition-colors relative overflow-hidden flex flex-col items-center justify-center group">
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
                    className="p-2 rounded-full bg-black/80 text-red-400 hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
                    title="Eliminar foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-emerald-500 text-black text-xs font-black uppercase px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  PERFECTO
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full flex flex-col items-center justify-center p-4 text-center cursor-pointer"
              >
                {/* Visual Phone Placement Outline Overlay */}
                <div className="w-32 h-20 border-2 border-blue-500/40 rounded-2xl flex items-center justify-center bg-blue-500/10 mb-3 group-hover:scale-105 group-hover:border-blue-400 transition-all">
                  <Camera className="w-8 h-8 text-blue-400 animate-bounce" />
                </div>
                <p className="text-xs font-black uppercase text-blue-400 tracking-wider">
                  TOCA AQUÍ PARA TOMAR O SUBIR FOTO
                </p>
                <p className="text-[10px] font-bold text-white/40 mt-1 uppercase">
                  FORMATOS JPG, PNG, WEBP
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

          {/* Navigation Controls inside card */}
          <div className="w-full flex items-center justify-between mt-4 gap-2">
            <button
              disabled={activeStepIndex === 0}
              onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
              className="px-3.5 py-2 rounded-xl text-xs font-black uppercase text-white/60 bg-black border border-white/10 hover:text-white disabled:opacity-30 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-white hover:bg-blue-50 text-black flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Camera className="w-4 h-4 text-blue-600" />
              {capturedPhotos[currentSlot.id] ? 'Cambiar Foto' : 'Hacer Foto'}
            </button>

            <button
              disabled={activeStepIndex === PHOTO_SLOTS.length - 1}
              onClick={() => setActiveStepIndex((prev) => Math.min(PHOTO_SLOTS.length - 1, prev + 1))}
              className="px-3.5 py-2 rounded-xl text-xs font-black uppercase text-white/60 bg-black border border-white/10 hover:text-white disabled:opacity-30 flex items-center gap-1 cursor-pointer"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Optional fast details input */}
      <div className="bg-[#16161D] border border-white/10 rounded-2xl p-4 my-4">
        <p className="text-xs font-black uppercase tracking-wider text-white mb-2 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-blue-400" />
          DATOS OPCIONALES PARA MAYOR PRECISIÓN DE COSTE:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-1">
              Kilómetros aproximados:
            </label>
            <input
              type="number"
              placeholder="Ej: 145000"
              value={mileageInput}
              onChange={(e) => setMileageInput(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-1">
              Precio del vendedor en Euros (€):
            </label>
            <input
              type="number"
              placeholder="Ej: 8900"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Main Bottom Trigger */}
      <div className="pt-2 border-t border-white/10">
        <button
          disabled={totalCaptured === 0}
          onClick={handleStartAnalysis}
          className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl transition-all ${
            totalCaptured > 0
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30 scale-100 hover:scale-[1.01] active:scale-95 cursor-pointer'
              : 'bg-[#16161D] text-white/30 border border-white/5 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-5 h-5 text-white" />
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
