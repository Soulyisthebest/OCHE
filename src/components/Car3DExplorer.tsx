/**
 * OCHE / CARCHECK AI — Interactive 3D Vehicle Knowledge System (FASE 7, 15, 16 & 17)
 * UX Simplification: "TOCO -> MIRO -> ENTIENDO"
 * Dynamic capability detection, exterior / interior / engine / internal view,
 * clean non-technical terminology, and clear separation between 3D model and real car scan.
 */

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Wrench,
  Search,
  Sparkles,
  Info,
  Car,
  ChevronLeft,
  ChevronDown,
  Eye,
  AlertTriangle,
  FileCheck,
  Zap,
  RotateCw,
  Compass,
  CheckCircle2
} from 'lucide-react';
import {
  Car3DModel,
  Car3DPart,
  Car3DZone,
  PartKnowledgeCard,
  CameraPresetId,
  ObservationEvidenceItem
} from '../types/vehicle3D';
import { StandardSystemType } from '../types/vehicleKnowledge';
import { CarAnalysisReport } from '../types';
import { VehicleAnalysisSession } from '../types/analysisSession';
import { CountryEngine } from '../services/CountryEngine';
import { Vehicle3DService } from '../services/Vehicle3DService';
import { GLBAssetLoaderService, AssetLoadResult } from '../services/GLBAssetLoaderService';
import { Car3DCanvas } from './3d/Car3DCanvas';
import { PartDetailDrawer } from './3d/PartDetailDrawer';
import { SymptomExplorerModal } from './3d/SymptomExplorerModal';
import { AccessibilityPartsList } from './3d/AccessibilityPartsList';

interface Car3DExplorerProps {
  report?: CarAnalysisReport | null;
  session?: VehicleAnalysisSession | null;
  onNavigateToChat?: (initialPrompt?: string) => void;
  onNavigateToReport?: () => void;
}

export const Car3DExplorer: React.FC<Car3DExplorerProps> = ({
  report,
  session,
  onNavigateToChat,
  onNavigateToReport
}) => {
  // Available models
  const allModels = Vehicle3DService.getAllModels();

  // Selected 3D Model (defaults to matching report vehicle or first canonical)
  const initialModel = Vehicle3DService.getModelForVehicle({
    make: report?.identity.make,
    model: report?.identity.model,
    engine: report?.identity.engine
  });

  const [selectedModel, setSelectedModel] = useState<Car3DModel>(initialModel);
  const [selectedZone, setSelectedZone] = useState<Car3DZone | null>(initialModel.zones[0] || null);
  const [selectedPart, setSelectedPart] = useState<Car3DPart | null>(initialModel.parts[0] || null);
  const [activeSystemFilter, setActiveSystemFilter] = useState<StandardSystemType | 'ALL'>('ALL');
  const [isExplodedView, setIsExplodedView] = useState<boolean>(false);
  const [activeCameraPreset, setActiveCameraPreset] = useState<CameraPresetId>('FULL_CAR');
  const [viewMode, setViewMode] = useState<'3D' | '2D_LIST'>('3D');
  const [isSymptomModalOpen, setIsSymptomModalOpen] = useState<boolean>(false);
  const [isAssetInfoModalOpen, setIsAssetInfoModalOpen] = useState<boolean>(false);
  const [assetLoadResult, setAssetLoadResult] = useState<AssetLoadResult | null>(null);
  const [interactionToast, setInteractionToast] = useState<{ message: string; type: 'info' | 'warning' } | null>(null);

  // Knowledge Card state
  const [card, setCard] = useState<PartKnowledgeCard | null>(null);
  const [isCardLoading, setIsCardLoading] = useState<boolean>(false);

  // Map of scan observations
  const [evidenceMap, setEvidenceMap] = useState<Record<string, ObservationEvidenceItem>>({});

  // Active country code
  const activeCountry = CountryEngine.getActiveCountryCode() || 'ES';

  // Synchronize observations from report
  useEffect(() => {
    const evMap = Vehicle3DService.mapReportEvidenceTo3DParts(selectedModel, report, session);
    setEvidenceMap(evMap);
  }, [selectedModel, report, session]);

  // Load Real Asset profile & capability flags
  useEffect(() => {
    let isCancelled = false;
    async function loadAssetProfile() {
      try {
        const vehicleId = selectedModel.id.replace('model-3d-', 'asset-').replace('generic-car', 'generic-car-architecture');
        const res = await GLBAssetLoaderService.loadVehicle3DAsset(vehicleId);
        if (!isCancelled) {
          setAssetLoadResult(res);
        }
      } catch (e) {
        console.warn('Could not load asset profile:', e);
      }
    }
    loadAssetProfile();
    return () => {
      isCancelled = true;
    };
  }, [selectedModel]);

  // Load Part Knowledge Card whenever selected part or country changes
  useEffect(() => {
    let isCancelled = false;

    async function loadCard() {
      if (!selectedPart) {
        setCard(null);
        return;
      }
      setIsCardLoading(true);
      try {
        const generatedCard = await Vehicle3DService.getPartKnowledgeCard(
          selectedPart.partId,
          selectedModel,
          activeCountry,
          report,
          session
        );
        if (!isCancelled) {
          setCard(generatedCard);
        }
      } catch (err) {
        console.error('Error loading part knowledge card:', err);
      } finally {
        if (!isCancelled) {
          setIsCardLoading(false);
        }
      }
    }

    loadCard();

    return () => {
      isCancelled = true;
    };
  }, [selectedPart, selectedModel, activeCountry, report, session]);

  // Handle Model Change
  const handleModelChange = (modelId: string) => {
    const newModel = Vehicle3DService.getModelById(modelId);
    setSelectedModel(newModel);
    setSelectedZone(newModel.zones[0] || null);
    setSelectedPart(newModel.parts[0] || null);
    setActiveCameraPreset('FULL_CAR');
    setIsExplodedView(false);
  };

  // Handle Part Selection
  const handleSelectPart = (part: Car3DPart) => {
    setSelectedPart(part);
    const matchingZone = selectedModel.zones.find((z) => z.id === part.zoneId);
    if (matchingZone) {
      setSelectedZone(matchingZone);
      setActiveCameraPreset(matchingZone.cameraPreset);
    }
  };

  // Dynamic Capabilities Detection (Phase 16 & 17)
  const hasInterior = assetLoadResult?.asset?.hasInterior ?? selectedModel.parts.some((p) => p.zoneId === 'CABIN' || p.category === 'interior');
  const hasEngine = assetLoadResult?.asset?.hasEngine ?? selectedModel.parts.some((p) => p.systemId === 'ENGINE' || p.zoneId === 'ENGINE_BAY');

  // Handle Exterior View
  const handleViewExterior = () => {
    setActiveCameraPreset('FULL_CAR');
    setIsExplodedView(false);
    setViewMode('3D');
    showToast('Mostrando vista exterior completa 360º.', 'info');
  };

  // Handle Inspect Engine button
  const handleInspectEngine = () => {
    if (hasEngine) {
      setActiveCameraPreset('ENGINE');
      setIsExplodedView(false);
      setViewMode('3D');
      const enginePart = selectedModel.parts.find((p) => p.systemId === 'ENGINE');
      if (enginePart) setSelectedPart(enginePart);
      showToast('Enfocando conjunto del motor.', 'info');
    } else {
      showToast('Motor 3D específico no disponible para este modelo.', 'warning');
    }
  };

  // Handle View Interior button
  const handleViewInterior = () => {
    if (hasInterior) {
      setActiveCameraPreset('CABIN');
      setIsExplodedView(false);
      setViewMode('3D');
      const cabinPart = selectedModel.parts.find((p) => p.zoneId === 'CABIN' || p.category === 'interior');
      if (cabinPart) setSelectedPart(cabinPart);
      showToast('Mostrando vista del habitáculo interior.', 'info');
    } else {
      showToast('Interior 3D no disponible para este modelo.', 'warning');
    }
  };

  // Handle Explode / Internal View Toggle
  const handleToggleInternalView = () => {
    setIsExplodedView(!isExplodedView);
    setViewMode('3D');
    showToast(!isExplodedView ? 'Mostrando piezas internas del coche.' : 'Vista normal restaurada.', 'info');
  };

  const showToast = (message: string, type: 'info' | 'warning') => {
    setInteractionToast({ message, type });
    setTimeout(() => {
      setInteractionToast(null);
    }, 3500);
  };

  // Handle Ask OCHE button
  const handleAskOche = (knowledgeCard: PartKnowledgeCard) => {
    const vehicleName = `${selectedModel.make} ${selectedModel.model} (${selectedModel.engine})`;
    const chatContext = Vehicle3DService.generateChatContext(knowledgeCard, vehicleName);
    if (onNavigateToChat) {
      onNavigateToChat(chatContext.initialPrompt);
    }
  };

  // Vehicle display name
  const vehicleDisplayName = `${selectedModel.make} ${selectedModel.model} ${selectedModel.engine}`;
  const isVehicleWithoutSpecific3D = report?.identity?.make && !Vehicle3DService.has3DModelForVehicle(report.identity);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0D] text-white p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Toast Notification */}
      {interactionToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 animate-slide-up backdrop-blur-md ${
            interactionToast.type === 'warning'
              ? 'bg-amber-950/90 border-amber-500 text-amber-200'
              : 'bg-cyan-950/90 border-cyan-500 text-cyan-200'
          }`}
        >
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>{interactionToast.message}</span>
        </div>
      )}

      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          {onNavigateToReport && (
            <button
              onClick={onNavigateToReport}
              className="text-xs font-black uppercase tracking-wider text-white/70 hover:text-white flex items-center gap-1.5 bg-[#16161D] px-4 py-2 rounded-full border border-white/10 mb-3 cursor-pointer"
              id="btn-back-to-report"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver al informe
            </button>
          )}

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-xs font-black text-cyan-400 uppercase tracking-widest mb-1">
            <Eye className="w-4 h-4" />
            <span>EXPLORADOR DEL COCHE</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter">
            {vehicleDisplayName}
          </h1>
          <p className="text-xs text-white/50 font-bold uppercase tracking-wider mt-0.5">
            Exploración interactiva de componentes mecánicos y puntos clave
          </p>
        </div>

        {/* Model Selector Pill */}
        <div className="flex items-center gap-2 bg-[#16161D] p-1.5 rounded-2xl border border-white/10">
          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">
            Modelo:
          </label>
          <select
            value={selectedModel.id}
            onChange={(e) => handleModelChange(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            id="select-vehicle-3d-model"
          >
            {allModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.make} {m.model} ({m.engine})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Distinction & Context Banner: 3D Model vs Real Car Scan (Phase 17 User Spec) */}
      <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-white/90 font-bold">
            <span className="text-cyan-400 uppercase">Modelo 3D de referencia:</span> Muestra la arquitectura del vehículo y qué conviene revisar.
          </p>
          <p className="text-white/50 text-[11px]">
            El estado real de tu unidad concreta proviene de las fotografías y el informe de escaneo. En este modelo conviene revisar estos puntos de forma preventiva.
          </p>
        </div>
      </div>

      {/* Fallback Banner for Vehicles Without Specific 3D Model */}
      {isVehicleWithoutSpecific3D && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>VISTA 3D ESPECÍFICA EN DESARROLLO</span>
            </span>
            <p className="text-xs text-white/90 font-bold">
              Mostrando la arquitectura general para {report?.identity?.make} {report?.identity?.model}.
            </p>
            <p className="text-[11px] text-white/60">
              Esta vista es orientativa y te permite comprender el funcionamiento de cada sistema mecánico.
            </p>
          </div>
          <button
            onClick={() => handleModelChange('model-3d-generic-car')}
            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider flex-shrink-0 transition-colors cursor-pointer"
          >
            🔧 Ver cómo funciona el coche
          </button>
        </div>
      )}

      {/* Main View Buttons: [ 🚗 EXTERIOR ], [ 🪑 INTERIOR ], [ 🔧 MOTOR ], [ 💥 VER POR DENTRO ], [ 🧩 LISTA DE PIEZAS ] */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-[#14141A] border border-white/10">
        {/* 1. Exterior (Always available) */}
        <button
          onClick={handleViewExterior}
          className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeCameraPreset === 'FULL_CAR' && !isExplodedView && viewMode === '3D'
              ? 'bg-cyan-500 text-black shadow-lg font-black'
              : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
          }`}
          id="btn-view-exterior"
        >
          <Car className="w-4 h-4" />
          <span>🚗 Exterior</span>
        </button>

        {/* 2. Interior (Shown ONLY if hasInterior is true) */}
        {hasInterior && (
          <button
            onClick={handleViewInterior}
            className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeCameraPreset === 'CABIN' && !isExplodedView && viewMode === '3D'
                ? 'bg-cyan-500 text-black shadow-lg font-black'
                : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
            }`}
            id="btn-view-interior"
          >
            <span>🪑 Interior</span>
          </button>
        )}

        {/* 3. Motor (Shown ONLY if hasEngine is true) */}
        {hasEngine && (
          <button
            onClick={handleInspectEngine}
            className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeCameraPreset === 'ENGINE' && !isExplodedView && viewMode === '3D'
                ? 'bg-cyan-500 text-black shadow-lg font-black'
                : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
            }`}
            id="btn-view-engine"
          >
            <Wrench className="w-4 h-4" />
            <span>🔧 Motor</span>
          </button>
        )}

        {/* 4. Ver por dentro (Internal / Exploded Layer toggle) */}
        <button
          onClick={handleToggleInternalView}
          className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            isExplodedView
              ? 'bg-purple-500 text-white shadow-lg font-black border border-purple-400'
              : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
          }`}
          id="btn-view-internal"
        >
          <Layers className="w-4 h-4" />
          <span>💥 {isExplodedView ? 'Ocultar interior' : 'Ver por dentro'}</span>
        </button>

        {/* 5. Lista de piezas / Vista 2D Accesible */}
        <button
          onClick={() => setViewMode(viewMode === '3D' ? '2D_LIST' : '3D')}
          className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ml-auto ${
            viewMode === '2D_LIST'
              ? 'bg-blue-600 text-white shadow-lg font-black'
              : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
          }`}
          id="btn-toggle-view-mode"
        >
          <span>🧩 {viewMode === '2D_LIST' ? 'Volver a vista 3D' : 'Lista de piezas (Sin 3D)'}</span>
        </button>
      </div>

      {/* Main Workspace (Grid: Left Canvas 7 cols, Right Detail Drawer 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive 3D Canvas or Accessible Parts List */}
        <div className="lg:col-span-7 space-y-4">
          {viewMode === '3D' ? (
            <Car3DCanvas
              model={selectedModel}
              selectedZone={selectedZone}
              selectedPart={selectedPart}
              activeSystemFilter={activeSystemFilter}
              isExplodedView={isExplodedView}
              activeCameraPreset={activeCameraPreset}
              evidenceMap={evidenceMap}
              onSelectPart={handleSelectPart}
              onSelectZone={(z) => {
                setSelectedZone(z);
                setActiveCameraPreset(z.cameraPreset);
              }}
              onCameraPresetChange={setActiveCameraPreset}
            />
          ) : (
            <AccessibilityPartsList
              model={selectedModel}
              selectedPart={selectedPart}
              activeSystemFilter={activeSystemFilter}
              evidenceMap={evidenceMap}
              onSelectPart={handleSelectPart}
              onSystemFilterChange={setActiveSystemFilter}
            />
          )}

          {/* Quick Zone Navigation Pills */}
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mr-1">
              Zonas:
            </span>
            {(selectedModel?.zones || []).map((zone) => {
              const isZoneSelected = selectedZone?.id === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => {
                    setSelectedZone(zone);
                    setActiveCameraPreset(zone.cameraPreset);
                    const firstPartInZone = (selectedModel?.parts || []).find((p) => p.zoneId === zone.id);
                    if (firstPartInZone) setSelectedPart(firstPartInZone);
                  }}
                  className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                    isZoneSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                      : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
                  }`}
                  id={`zone-btn-${zone.id}`}
                >
                  {zone.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Part Detail Card & Actions (5 cols) */}
        <div className="lg:col-span-5">
          <PartDetailDrawer
            card={card}
            isLoading={isCardLoading}
            vehicleName={vehicleDisplayName}
            hasScanObservation={card?.observationStatus === 'OBSERVED'}
            onAskOche={handleAskOche}
            onViewInReport={onNavigateToReport}
          />
        </div>
      </div>

      {/* Symptom Explorer Modal */}
      <SymptomExplorerModal
        isOpen={isSymptomModalOpen}
        onClose={() => setIsSymptomModalOpen(false)}
        onSelectSystemFilter={(sysId) => {
          setActiveSystemFilter(sysId);
          setViewMode('3D');
        }}
      />
    </div>
  );
};
