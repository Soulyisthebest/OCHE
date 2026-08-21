/**
 * OCHE / CARCHECK AI — Interactive 3D/Vector Canvas Component (FASE 7)
 * Renders interactive vehicle stage with 360 rotation, zoom, pan, camera presets,
 * exploded view abstraction, touch gesture recognition, and observation hotspots.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Layers,
  Eye,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import {
  Car3DModel,
  Car3DPart,
  Car3DZone,
  CameraPresetId,
  VisualObservationStatus,
  ObservationEvidenceItem
} from '../../types/vehicle3D';
import { StandardSystemType } from '../../types/vehicleKnowledge';
import { CAMERA_PRESETS } from '../../data/car3DModelsDatabase';

interface Car3DCanvasProps {
  model: Car3DModel;
  selectedZone: Car3DZone | null;
  selectedPart: Car3DPart | null;
  activeSystemFilter: StandardSystemType | 'ALL';
  isExplodedView: boolean;
  activeCameraPreset: CameraPresetId;
  evidenceMap: Record<string, ObservationEvidenceItem>;
  onSelectPart: (part: Car3DPart) => void;
  onSelectZone: (zone: Car3DZone) => void;
  onCameraPresetChange: (presetId: CameraPresetId) => void;
}

export const Car3DCanvas: React.FC<Car3DCanvasProps> = ({
  model,
  selectedZone,
  selectedPart,
  activeSystemFilter,
  isExplodedView,
  activeCameraPreset,
  evidenceMap,
  onSelectPart,
  onSelectZone,
  onCameraPresetChange
}) => {
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [pitchAngle, setPitchAngle] = useState<number>(15);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [touchDistance, setTouchDistance] = useState<number | null>(null);
  const [hoveredPart, setHoveredPart] = useState<Car3DPart | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with camera preset changes
  useEffect(() => {
    const preset = CAMERA_PRESETS.find((p) => p.id === activeCameraPreset);
    if (preset) {
      setRotationAngle(preset.rotationAngle);
      setZoomLevel(preset.zoom);
      setPitchAngle(activeCameraPreset === 'UNDERBODY' ? -25 : activeCameraPreset === 'ENGINE' ? 25 : 15);
      setPanOffset({ x: 0, y: 0 });
    }
  }, [activeCameraPreset]);

  // Rotation & Zoom Controls
  const handleRotateLeft = () => setRotationAngle((prev) => (prev - 45 + 360) % 360);
  const handleRotateRight = () => setRotationAngle((prev) => (prev + 45) % 360);
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 2.0));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.7));
  const handleReset = () => {
    onCameraPresetChange('FULL_CAR');
    setRotationAngle(0);
    setPitchAngle(15);
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  // Mouse Drag Events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    if (e.shiftKey) {
      // Pan
      setPanOffset((prev) => ({ x: prev.x + deltaX * 0.5, y: prev.y + deltaY * 0.5 }));
    } else {
      // Rotate
      setRotationAngle((prev) => (prev + deltaX * 0.5) % 360);
      setPitchAngle((prev) => Math.max(-45, Math.min(60, prev - deltaY * 0.3)));
    }
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch Gesture Events (Mobile pinch & swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchDistance(dist);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const deltaX = e.touches[0].clientX - dragStart.x;
      const deltaY = e.touches[0].clientY - dragStart.y;
      setRotationAngle((prev) => (prev + deltaX * 0.6) % 360);
      setPitchAngle((prev) => Math.max(-45, Math.min(60, prev - deltaY * 0.4)));
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2 && touchDistance !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = (dist - touchDistance) * 0.005;
      setZoomLevel((prev) => Math.max(0.7, Math.min(2.0, prev + delta)));
      setTouchDistance(dist);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchDistance(null);
  };

  // Filter visible parts by active system
  const visibleParts = model.parts.filter((part) => {
    if (activeSystemFilter !== 'ALL' && part.systemId !== activeSystemFilter) {
      return false;
    }
    return true;
  });

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] sm:h-[480px] bg-gradient-to-b from-[#101015] to-[#0A0A0D] rounded-3xl border border-white/10 overflow-hidden select-none flex flex-col justify-between shadow-2xl touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Architectural Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_80%,rgba(0,0,0,0.8))] pointer-events-none" />

      {/* Top Floating Bar: Model info + Exploded badge */}
      <div className="relative z-10 p-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="px-3 py-1 rounded-full bg-black/70 border border-white/10 text-[10px] font-black uppercase tracking-wider text-blue-400 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>3D INTERACTIVO</span>
          </span>

          {isExplodedView && (
            <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-[10px] font-black uppercase tracking-wider text-purple-300 backdrop-blur-md flex items-center gap-1.5 animate-fade-in shadow-lg">
              <Layers className="w-3 h-3" />
              <span>VISTA DESPIECE / EXPLOSION</span>
            </span>
          )}
        </div>

        {/* Viewport Control Buttons */}
        <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-xl pointer-events-auto">
          <button
            onClick={handleRotateLeft}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Girar a la izquierda (-45º)"
            id="btn-rotate-left"
          >
            <RotateCw className="w-4 h-4 -scale-x-100 text-blue-400" />
          </button>
          <button
            onClick={handleRotateRight}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Girar a la derecha (+45º)"
            id="btn-rotate-right"
          >
            <RotateCw className="w-4 h-4 text-blue-400" />
          </button>
          <div className="w-[1px] h-4 bg-white/20 mx-0.5" />
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Acercar zoom"
            id="btn-zoom-in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Alejar zoom"
            id="btn-zoom-out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-white/20 mx-0.5" />
          <button
            onClick={handleReset}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Restablecer vista"
            id="btn-reset-view"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3D Perspective Stage */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing">
        <div
          className="relative transition-transform duration-300 ease-out flex items-center justify-center w-full max-w-[540px] px-6"
          style={{
            transform: `perspective(1000px) rotateX(${pitchAngle}deg) rotateY(${rotationAngle}deg) scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`
          }}
        >
          {/* Floor Shadow Ring */}
          <div className="absolute -bottom-10 w-72 sm:w-96 h-12 bg-blue-500/10 rounded-full blur-2xl pointer-events-none transform -rotateX(60deg)" />

          {/* SVG Vector Vehicle Multi-Layer Blueprint */}
          <div className="relative w-full h-56 sm:h-64 flex items-center justify-center">
            {/* Base Layer: Chassis / Body Shell */}
            <div
              className="absolute inset-0 transition-transform duration-500 ease-out flex items-center justify-center"
              style={{
                transform: isExplodedView ? 'translateY(-35px) scale(1.05)' : 'translateY(0)'
              }}
            >
              <svg viewBox="0 0 600 280" className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]">
                {/* Silhouette & Glass */}
                <defs>
                  <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="50%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                  <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Car Profile Body Outer Outline */}
                <path
                  d="M 60,180 L 110,180 C 120,150 160,150 170,180 L 410,180 C 420,150 460,150 470,180 L 540,180 C 555,180 565,165 560,145 L 530,120 L 430,90 L 260,85 L 150,115 L 70,135 C 55,140 50,155 50,165 Z"
                  fill="url(#bodyGrad)"
                  stroke="#475569"
                  strokeWidth="2.5"
                  opacity={isExplodedView ? 0.65 : 0.85}
                />

                {/* Windshield & Side Windows */}
                <path
                  d="M 175,120 L 265,95 L 420,98 L 475,120 Z"
                  fill="url(#glassGrad)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  opacity="0.8"
                />

                {/* Door & Panel Crease Lines */}
                <path d="M 270,95 L 265,180" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 2" />
                <path d="M 385,98 L 380,180" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 2" />
                <path d="M 140,125 L 535,125" stroke="#475569" strokeWidth="1" />
              </svg>
            </div>

            {/* Middle Layer: Powertrain & Mechanical Systems */}
            <div
              className="absolute inset-0 transition-transform duration-500 ease-out flex items-center justify-center pointer-events-none"
              style={{
                transform: isExplodedView ? 'translateY(15px) scale(0.98)' : 'translateY(0)'
              }}
            >
              <svg viewBox="0 0 600 280" className="w-full h-full">
                {/* Engine Block Graphic */}
                <rect x="95" y="115" width="70" height="50" rx="8" fill="#ef4444" fillOpacity="0.25" stroke="#ef4444" strokeWidth="1.8" />
                <circle cx="130" cy="140" r="14" fill="#ef4444" fillOpacity="0.3" />
                <text x="130" y="144" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">ENGINE</text>

                {/* Transmission & Driveshaft */}
                <rect x="170" y="125" width="45" height="35" rx="6" fill="#8b5cf6" fillOpacity="0.25" stroke="#8b5cf6" strokeWidth="1.8" />
                <line x1="215" y1="142" x2="430" y2="142" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="6 3" />

                {/* Exhaust Line & DPF */}
                <path d="M 150,155 L 220,165 L 430,168 L 545,170" fill="none" stroke="#10b981" strokeWidth="2.5" />
                <rect x="360" y="160" width="40" height="16" rx="4" fill="#10b981" fillOpacity="0.3" stroke="#10b981" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Bottom Layer: Wheels & Suspension */}
            <div
              className="absolute inset-0 transition-transform duration-500 ease-out flex items-center justify-center pointer-events-none"
              style={{
                transform: isExplodedView ? 'translateY(40px)' : 'translateY(0)'
              }}
            >
              <svg viewBox="0 0 600 280" className="w-full h-full">
                {/* Front Wheel & Brake */}
                <circle cx="140" cy="180" r="32" fill="#0f172a" stroke="#06b6d4" strokeWidth="3" />
                <circle cx="140" cy="180" r="18" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                <circle cx="140" cy="180" r="6" fill="#ffffff" />

                {/* Rear Wheel & Brake */}
                <circle cx="440" cy="180" r="32" fill="#0f172a" stroke="#06b6d4" strokeWidth="3" />
                <circle cx="440" cy="180" r="18" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                <circle cx="440" cy="180" r="6" fill="#ffffff" />
              </svg>
            </div>

            {/* Hotspots for Visible 3D Parts */}
            {visibleParts.map((part) => {
              const isSelected = selectedPart?.id === part.id || selectedPart?.partId === part.partId;
              const evidence = evidenceMap[part.id] || evidenceMap[part.partId];
              const isObserved = evidence?.status === 'OBSERVED';
              const isPossible = evidence?.status === 'POSSIBLE';

              // Visual coordinates
              let posX = part.hotspot.x;
              let posY = part.hotspot.y;

              // Apply exploded offset to hotspots
              if (isExplodedView) {
                if (part.systemId === 'ENGINE' || part.systemId === 'COOLING') posY -= 6;
                if (part.systemId === 'SUSPENSION' || part.systemId === 'BRAKES') posY += 8;
                if (part.systemId === 'EXHAUST') posY += 5;
              }

              return (
                <div
                  key={part.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPart(part);
                    }}
                    onMouseEnter={() => setHoveredPart(part)}
                    onMouseLeave={() => setHoveredPart(null)}
                    className={`relative p-2.5 rounded-full transition-all duration-300 transform cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 border-2 border-white text-white scale-125 shadow-[0_0_20px_rgba(59,130,246,0.8)] z-30'
                        : isObserved
                        ? 'bg-red-600 border-2 border-red-300 text-white scale-110 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-bounce'
                        : isPossible
                        ? 'bg-amber-500 border-2 border-amber-200 text-white hover:scale-110 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                        : 'bg-slate-900/90 border border-white/20 text-white/80 hover:border-blue-400 hover:bg-blue-950 hover:text-white hover:scale-110'
                    }`}
                    title={part.name}
                    id={`hotspot-${part.id}`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-current" />

                    {/* Status Ring */}
                    {isSelected && (
                      <span className="absolute -inset-1 rounded-full border border-blue-400 animate-ping pointer-events-none" />
                    )}

                    {/* Observation Pill Badge */}
                    {isObserved && (
                      <span className="absolute -top-2 -right-2 w-3.5 h-3.5 bg-red-500 border border-white rounded-full flex items-center justify-center text-[8px] font-black text-white">
                        !
                      </span>
                    )}
                  </button>

                  {/* Hover Floating Label */}
                  {(hoveredPart?.id === part.id || isSelected) && (
                    <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-black/90 border border-white/20 text-[11px] font-black text-white whitespace-nowrap pointer-events-none shadow-2xl backdrop-blur-md flex items-center gap-1.5 z-40 animate-fade-in">
                      {isObserved && <AlertCircle className="w-3 h-3 text-red-400" />}
                      <span>{part.name}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Camera Presets & Zone Strip */}
      <div className="relative z-10 p-3 bg-black/60 backdrop-blur-md border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
        {/* Camera Quick-Angle Presets */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mr-1 hidden sm:inline">
            Cámara:
          </span>
          {CAMERA_PRESETS.map((preset) => {
            const isActive = activeCameraPreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onCameraPresetChange(preset.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all border cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                    : 'bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10'
                }`}
                title={preset.description}
                id={`preset-${preset.id}`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>

        {/* Gesture Instruction Tip */}
        <div className="text-[10px] font-bold text-white/40 flex items-center gap-1">
          <span>Arrastra para girar • Rueda para zoom</span>
        </div>
      </div>
    </div>
  );
};
