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
  Globe
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

        {/* Global Action Controls: Symptom Search + Model Selector + 2D/3D Mode */}
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

          {/* 3D vs 2D List Mode Toggle */}
          <div className="flex items-center p-1 bg-black/60 border border-white/10 rounded-2xl">
            <button
              onClick={() => setViewMode('3D')}
              className={`p-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                viewMode === '3D' ? 'bg-blue-600 text-white shadow-md' : 'text-white/50 hover:text-white'
              }`}
              title="Vista 3D Interactiva"
            >
              <Box className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('2D_LIST')}
              className={`p-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                viewMode === '2D_LIST' ? 'bg-blue-600 text-white shadow-md' : 'text-white/50 hover:text-white'
              }`}
              title="Vista de Lista Accesible"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Model Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedModel.id}
              onChange={(e) => handleModelChange(e.target.value)}
              className="appearance-none bg-black/80 text-white text-xs font-black uppercase tracking-wider py-2.5 pl-3 pr-8 rounded-2xl border border-white/15 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {allModels.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#16161D] text-white">
                  {m.make} {m.model} ({m.engine})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-white/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
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
            {selectedModel.zones.map((zone) => {
              const isZoneSelected = selectedZone?.id === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => {
                    setSelectedZone(zone);
                    setActiveCameraPreset(zone.cameraPreset);
                    const firstPartInZone = selectedModel.parts.find((p) => p.zoneId === zone.id);
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
