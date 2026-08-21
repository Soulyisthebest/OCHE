/**
 * OCHE / CARCHECK AI — Interactive 3D Vehicle Knowledge System (FASE 7)
 * Comprehensive visual knowledge explorer connecting 3D Parts, Vehicle Knowledge,
 * Symptom Diagnostics, Inspection Guides, and dynamic Country-based Cost Engines.
 */

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Layers,
  Activity,
  List,
  Box,
  Wrench,
  Search,
  Sparkles,
  Info,
  Car,
  ChevronDown,
  Globe,
  Eye,
  ShieldAlert,
  FileCheck,
  Zap
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
import { Car3DAsset } from '../types/vehicle3DAsset';
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

  // Load Real GLB Asset profile
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

  // Handle Inspect Engine button
  const handleInspectEngine = () => {
    const hasEngine = assetLoadResult?.asset?.hasEngine ?? true;
    if (hasEngine) {
      setActiveCameraPreset('ENGINE');
      const enginePart = selectedModel.parts.find((p) => p.systemId === 'ENGINE');
      if (enginePart) setSelectedPart(enginePart);
      showToast('Enfocando conjunto propulsor y motor.', 'info');
    } else {
      showToast('Motor 3D específico no disponible.', 'warning');
    }
  };

  // Handle View Interior button
  const handleViewInterior = () => {
    const hasInterior = assetLoadResult?.asset?.hasInterior ?? false;
    if (hasInterior) {
      setActiveCameraPreset('CABIN');
      showToast('Accediendo a vista de habitáculo interior.', 'info');
    } else {
      showToast('Interior 3D específico no disponible.', 'warning');
    }
  };

  const showToast = (message: string, type: 'info' | 'warning') => {
    setInteractionToast({ message, type });
    setTimeout(() => {
      setInteractionToast(null);
    }, 4000);
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
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0D] text-white p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-xs font-black text-blue-400 uppercase tracking-widest mb-2 border border-blue-500/30">
            <Compass className="w-4 h-4" />
            <span>INTERACTIVE 3D VEHICLE KNOWLEDGE SYSTEM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tighter uppercase italic">
            Explorador Técnico OCHE
          </h1>
          <p className="text-xs text-white/50 font-bold uppercase tracking-wider mt-0.5">
            Explora la anatomía mecánica, diagnósticos y costes reales pieza por pieza
          </p>
        </div>

        {/* Global Action Controls: Symptom Search + Model Selector + 2D/3D Mode + Asset Specs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Symptom Explorer Button */}
          <button
            onClick={() => setIsSymptomModalOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            id="btn-symptom-explorer"
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Buscador de Síntomas</span>
          </button>

          {/* Inspect Engine Action */}
          <button
            onClick={handleInspectEngine}
            className="px-3.5 py-2.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            id="btn-inspect-engine"
            title="Inspeccionar vano motor"
          >
            <Wrench className="w-4 h-4 text-emerald-400" />
            <span>Motor</span>
          </button>

          {/* View Interior Action */}
          <button
            onClick={handleViewInterior}
            className="px-3.5 py-2.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            id="btn-view-interior"
            title="Ver habitáculo interior"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Interior</span>
          </button>

          {/* Exploded View Toggle */}
          <button
            onClick={() => setIsExplodedView((prev) => !prev)}
            className={`px-3.5 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              isExplodedView
                ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-500/20'
                : 'bg-black/60 text-white/60 border-white/10 hover:text-white hover:bg-white/10'
            }`}
            id="btn-exploded-view"
            title="Separar componentes mecánicos en capas"
          >
            <Layers className="w-4 h-4" />
            <span>Despiece</span>
          </button>

          {/* 3D vs 2D List Mode Toggle (Accessibility requirement) */}
          <div className="flex items-center p-1 bg-black/60 border border-white/10 rounded-2xl">
            <button
              onClick={() => setViewMode('3D')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === '3D' ? 'bg-blue-600 text-white shadow-md' : 'text-white/50 hover:text-white'
              }`}
              title="Vista 3D Interactiva"
              id="btn-view-mode-3d"
            >
              <Box className="w-4 h-4" />
              <span className="hidden sm:inline">3D</span>
            </button>
            <button
              onClick={() => setViewMode('2D_LIST')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === '2D_LIST' ? 'bg-blue-600 text-white shadow-md' : 'text-white/50 hover:text-white'
              }`}
              title="Ver información sin 3D (Accesible)"
              id="btn-view-mode-2d"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Sin 3D</span>
            </button>
          </div>

          {/* Asset Info Button */}
          <button
            onClick={() => setIsAssetInfoModalOpen(true)}
            className="px-3 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-black uppercase flex items-center gap-1 transition-all cursor-pointer"
            id="btn-asset-specs"
            title="Especificaciones técnicas y licencia del modelo 3D"
          >
            <Info className="w-4 h-4 text-blue-400" />
            <span className="hidden xl:inline">Pipeline 3D</span>
          </button>

          {/* Model Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedModel?.id || ''}
              onChange={(e) => handleModelChange(e.target.value)}
              className="appearance-none bg-black/80 text-white text-xs font-black uppercase tracking-wider py-2.5 pl-3 pr-8 rounded-2xl border border-white/15 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {(allModels || []).map((m) => (
                <option key={m.id} value={m.id} className="bg-[#16161D] text-white">
                  {m.make} {m.model} ({m.engine})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-white/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Interaction Toast */}
      {interactionToast && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xl transition-all ${
            interactionToast.type === 'warning'
              ? 'bg-amber-950/90 text-amber-200 border border-amber-500/50'
              : 'bg-blue-950/90 text-blue-200 border border-blue-500/50'
          }`}
        >
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>{interactionToast.message}</span>
        </div>
      )}

      {/* Fallback Banner if vehicle has no specific 3D model */}
      {isVehicleWithoutSpecific3D && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="text-amber-400 font-black text-sm">ℹ️</span>
            <div>
              <span className="text-white font-bold block">
                Modelo 3D específico no disponible para este vehículo ({report?.identity.make} {report?.identity.model}).
              </span>
              <span className="text-white/60 text-[11px] block">
                Puedes explorar la arquitectura general de referencia o consultar el informe fotográfico.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
            <button
              onClick={() => handleModelChange('model-3d-generic-car')}
              className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-300 hover:text-white text-[11px] font-black uppercase whitespace-nowrap transition-colors cursor-pointer"
              id="btn-explore-universal"
            >
              Explorar arquitectura general
            </button>
            {onNavigateToReport && (
              <button
                onClick={onNavigateToReport}
                className="px-3 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-300 hover:text-white text-[11px] font-black uppercase whitespace-nowrap transition-colors cursor-pointer"
                id="btn-back-to-report"
              >
                Volver al informe
              </button>
            )}
          </div>
        </div>
      )}

      {/* Non-Diagnostic Architectural Disclaimer */}
      <div className="px-3.5 py-2 rounded-xl bg-blue-950/20 border border-blue-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-blue-300/80">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span>
            <strong>Aviso de Arquitectura 3D:</strong> El modelo 3D representa la arquitectura de referencia del modelo. El estado real del vehículo proviene exclusivamente de las fotografías y la inspección física.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-[10px] font-mono text-amber-400 border border-amber-500/20">
            {assetLoadResult?.state || 'WAITING_FOR_REAL_GLB_ASSET'}
          </span>
          <span className="hidden md:inline-block px-2 py-0.5 rounded bg-blue-500/10 text-[10px] font-mono text-blue-400 border border-blue-500/20">
            GLB / DRACO
          </span>
        </div>
      </div>

      {/* System Filters Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mr-1 flex-shrink-0">
          Sistemas:
        </span>
        {(['ALL', 'ENGINE', 'COOLING', 'TRANSMISSION', 'BRAKES', 'SUSPENSION', 'EXHAUST', 'ELECTRICAL'] as const).map(
          (sys) => {
            const isActive = activeSystemFilter === sys;
            return (
              <button
                key={sys}
                onClick={() => setActiveSystemFilter(sys)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                    : 'bg-black/60 text-white/60 border-white/10 hover:text-white hover:bg-white/10'
                }`}
                id={`filter-sys-${sys}`}
              >
                {sys === 'ALL'
                  ? 'Todos'
                  : sys === 'ENGINE'
                  ? 'Motor'
                  : sys === 'COOLING'
                  ? 'Refrigeración'
                  : sys === 'TRANSMISSION'
                  ? 'Transmisión'
                  : sys === 'BRAKES'
                  ? 'Frenos'
                  : sys === 'SUSPENSION'
                  ? 'Suspensión'
                  : sys === 'EXHAUST'
                  ? 'Escape/FAP'
                  : 'Eléctrico'}
              </button>
            );
          }
        )}
      </div>

      {/* Main Grid: 3D Stage / 2D List (Left 7 cols) & Deep Part Knowledge Drawer (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols) */}
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
                  className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                    isZoneSelected
                      ? 'bg-white/20 text-white border-white/40'
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

        {/* Right Column: Deep Part Knowledge Card & Actions (5 cols) */}
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

      {/* Technical Asset Specifications Modal (Phase 16) */}
      {isAssetInfoModalOpen && assetLoadResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121218] border border-white/15 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-black uppercase tracking-wide">Ficha Técnica de Asset 3D</h3>
              </div>
              <button
                onClick={() => setIsAssetInfoModalOpen(false)}
                className="text-white/50 hover:text-white text-sm font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex justify-between">
                <span className="text-white/50">Estado de Asset:</span>
                <span className="font-mono font-bold text-amber-400">{assetLoadResult.state}</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex justify-between">
                <span className="text-white/50">Formato / Compresión:</span>
                <span className="font-mono font-bold text-white">GLB / DRACO Meshopt</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex justify-between">
                <span className="text-white/50">Conteo de Polígonos:</span>
                <span className="font-mono font-bold text-white">
                  {assetLoadResult.diagnostics.polygonCount.toLocaleString()} triángulos
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex justify-between">
                <span className="text-white/50">Tamaño Estimado:</span>
                <span className="font-mono font-bold text-white">
                  {(assetLoadResult.diagnostics.fileSizeEstimateBytes / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex justify-between">
                <span className="text-white/50">Resolución de Texturas:</span>
                <span className="font-mono font-bold text-white">{assetLoadResult.diagnostics.textureResolution}</span>
              </div>

              <div className="p-3 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-1">
                <span className="text-blue-300 font-bold block">Licencia & Derechos:</span>
                <p className="text-[11px] text-white/70">{assetLoadResult.messages.licenseNotice}</p>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-white/50 font-bold block">Componentes Detectados:</span>
                <p className="text-[11px] text-white/80">• {assetLoadResult.messages.engineStatus}</p>
                <p className="text-[11px] text-white/80">• {assetLoadResult.messages.interiorStatus}</p>
              </div>
            </div>

            <button
              onClick={() => setIsAssetInfoModalOpen(false)}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-wider transition-colors cursor-pointer"
            >
              Cerrar Ficha Técnica
            </button>
          </div>
        </div>
      )}

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
