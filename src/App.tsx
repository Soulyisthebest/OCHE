import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNavBar } from './components/BottomNavBar';
import { HeroHome } from './components/HeroHome';
import { PhotoScanner } from './components/PhotoScanner';
import { SellerDataCards } from './components/SellerDataCards';
import { AnalysisLoading } from './components/AnalysisLoading';
import { VehicleConfirmCard } from './components/VehicleConfirmCard';
import { MissingDataPrompt } from './components/MissingDataPrompt';
import { AnalysisReport } from './components/AnalysisReport';
import { GarageHistory } from './components/GarageHistory';
import { Car3DExplorer } from './components/Car3DExplorer';
import { AssistantMode } from './components/AssistantMode';
import { LearnCars } from './components/LearnCars';
import { CarChatAssistant } from './components/CarChatAssistant';
import { CarComparator } from './components/CarComparator';
import { ManualIdentificationModal, ManualVehicleData } from './components/ManualIdentificationModal';
import { PilotDashboardModal } from './components/PilotDashboardModal';
import { CarAnalysisReport, PhotoSlotId } from './types';
import { VehicleAnalysisSession, AnalysisStatus, VehicleIdentificationCandidate } from './types/analysisSession';
import { SampleDemoCar } from './data/sampleCars';
import { AnalysisSessionService } from './services/AnalysisSessionService';
import { localVehicleRepository } from './repositories/LocalVehicleRepository';
import { CountryEngine } from './services/CountryEngine';
import { LocalizationService } from './services/LocalizationService';
import { AnalyticsService } from './services/AnalyticsService';
import { CountryProfile, CountryCode } from './types/country';
import { AlertTriangle } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [currentSession, setCurrentSession] = useState<VehicleAnalysisSession | null>(null);
  const [currentReport, setCurrentReport] = useState<CarAnalysisReport | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [isPilotDashboardOpen, setIsPilotDashboardOpen] = useState<boolean>(false);
  const [countryProfile, setCountryProfile] = useState<CountryProfile>(() => {
    return CountryEngine.autoDetectCountry();
  });

  // Pipeline loading state
  const [loadingStatus, setLoadingStatus] = useState<AnalysisStatus>('SCANNING');
  const [loadingProgress, setLoadingProgress] = useState<number>(20);
  const [loadingMessage, setLoadingMessage] = useState<string>('Iniciando análisis del vehículo...');

  // Temporary captured photos from scanner before seller data step
  const [pendingPhotos, setPendingPhotos] = useState<
    Partial<Record<PhotoSlotId, { url?: string; base64?: string }>>
  >({});
  const [tempMileage, setTempMileage] = useState<number | undefined>(undefined);
  const [tempPrice, setTempPrice] = useState<number | undefined>(undefined);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);

  const [savedReports, setSavedReports] = useState<CarAnalysisReport[]>(() => {
    try {
      const stored = localStorage.getItem('carcheck_saved_reports');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage whenever savedReports changes
  useEffect(() => {
    try {
      localStorage.setItem('carcheck_saved_reports', JSON.stringify(savedReports));
    } catch (e) {
      console.warn('Failed to save reports to localStorage:', e);
    }
  }, [savedReports]);

  const handleCountryChange = (profile: CountryProfile) => {
    setCountryProfile(profile);
    CountryEngine.setActiveCountryCode(profile.countryCode);
    LocalizationService.setActiveLanguage(profile.language);
  };

  // Start new scan flow -> initializes pilot session
  const handleStartScanFlow = () => {
    AnalyticsService.startPilotSession();
    setCurrentView('scan');
  };

  // Handle photo scanning completion -> proceeds to Seller Data Cards
  const handlePhotosComplete = (
    photos: Partial<Record<PhotoSlotId, { url?: string; base64?: string }>>,
    mileageKm?: number,
    askingPrice?: number
  ) => {
    const photoCount = Object.keys(photos).length;
    AnalyticsService.updatePilotSession({
      identificationMethod: photoCount > 0 ? 'photo' : 'none',
      photosProvided: photoCount
    });
    setPendingPhotos(photos);
    setTempMileage(mileageKm);
    setTempPrice(askingPrice);
    setCurrentView('seller_data');
  };

  // Run the full vehicle analysis pipeline
  const executeAnalysisPipeline = async (sellerData: {
    askingPrice?: number;
    mileageKm?: number;
    year?: number;
    fuel?: string;
    transmission?: string;
    brandHint?: string;
    modelHint?: string;
    generationHint?: string;
    engineHint?: string;
    powerHint?: number;
    trimHint?: string;
    vinHint?: string;
    licensePlateHint?: string;
    isEngineUnknown?: boolean;
  }) => {
    setCurrentView('loading');
    setLoadingStatus('SCANNING');
    setLoadingProgress(15);
    setLoadingMessage('Procesando fotografías y clasificando ángulos...');

    try {
      const session = await AnalysisSessionService.runAnalysis(
        {
          photos: pendingPhotos,
          askingPrice: sellerData.askingPrice,
          mileageKm: sellerData.mileageKm,
          year: sellerData.year,
          fuel: sellerData.fuel,
          transmission: sellerData.transmission,
          brandHint: sellerData.brandHint,
          modelHint: sellerData.modelHint,
          generationHint: sellerData.generationHint,
          engineHint: sellerData.engineHint,
          powerHint: sellerData.powerHint,
          trimHint: sellerData.trimHint,
          vinHint: sellerData.vinHint,
          licensePlateHint: sellerData.licensePlateHint,
          isEngineUnknown: sellerData.isEngineUnknown
        },
        (status, progress, message) => {
          setLoadingStatus(status);
          setLoadingProgress(progress);
          setLoadingMessage(message);
        }
      );

      setCurrentSession(session);
      const report = AnalysisSessionService.sessionToLegacyReport(session);
      setCurrentReport(report);

      AnalyticsService.updatePilotSession({
        analysisCompleted: true,
        vehicleIdentified: session.identification?.brand
          ? `${session.identification.brand} ${session.identification.model}`
          : null
      });

      // Always present vehicle confirmation view for verification
      if (session.identification) {
        setCurrentView('confirm_vehicle');
      } else {
        setCurrentView('report');
      }
    } catch (err) {
      console.error('Analysis execution failed:', err);
      setCurrentView('report');
    }
  };

  // Handle manual vehicle modal save (Test C, Test D, Test F, Test G, Phase 14.5)
  const handleManualVehicleSave = async (manualData: ManualVehicleData) => {
    setIsManualModalOpen(false);
    AnalyticsService.updatePilotSession({
      identificationMethod: Object.keys(pendingPhotos).length > 0 ? 'both' : 'manual'
    });
    await executeAnalysisPipeline({
      askingPrice: manualData.askingPrice || currentSession?.askingPrice || tempPrice,
      mileageKm: manualData.mileageKm || currentSession?.mileage || tempMileage,
      year: manualData.year || currentSession?.year,
      fuel: manualData.fuel,
      transmission: manualData.transmission,
      brandHint: manualData.brand,
      modelHint: manualData.model,
      generationHint: manualData.generation,
      engineHint: manualData.isEngineUnknown ? 'Motor no especificado' : manualData.engine,
      powerHint: manualData.power,
      trimHint: manualData.trim,
      vinHint: manualData.vin,
      licensePlateHint: manualData.licensePlate,
      isEngineUnknown: manualData.isEngineUnknown
    });
  };

  // Handle vehicle confirmation
  const handleConfirmVehicle = async (candidate: VehicleIdentificationCandidate) => {
    AnalyticsService.updatePilotSession({
      vehicleConfirmed: true,
      vehicleIdentified: `${candidate.brand} ${candidate.model}`
    });
    if (currentSession) {
      const matchedDomainVehicle = await localVehicleRepository.getDomainVehicleById(candidate.vehicleId);
      const updatedSession: VehicleAnalysisSession = {
        ...currentSession,
        vehicle: matchedDomainVehicle || currentSession.vehicle,
        identification: {
          ...currentSession.identification!,
          brand: candidate.brand,
          model: candidate.model,
          generation: candidate.generation,
          engine: candidate.engine,
          fuel: candidate.fuel,
          power: candidate.power,
          transmission: candidate.transmission,
          confidence: candidate.confidence,
          isContradictory: false
        }
      };
      setCurrentSession(updatedSession);
      setCurrentReport(AnalysisSessionService.sessionToLegacyReport(updatedSession));
    }
    setCurrentView('report');
  };

  // Select preloaded sample car
  const handleSelectSampleCar = (sample: SampleDemoCar) => {
    setCurrentReport(sample.report);
    setCurrentView('report');
  };

  // Save report to garage
  const handleSaveReport = (report: CarAnalysisReport) => {
    setSavedReports((prev) => {
      if (prev.some((r) => r.id === report.id)) {
        return prev;
      }
      return [report, ...prev];
    });
  };

  // Delete report from garage
  const handleDeleteReport = (id: string) => {
    setSavedReports((prev) => prev.filter((r) => r.id !== id));
  };

  const isCurrentReportSaved = currentReport
    ? savedReports.some((r) => r.id === currentReport.id)
    : false;

  return (
    <div
      dir={countryProfile.direction}
      className={`min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 ${countryProfile.direction === 'rtl' ? 'rtl font-[Tahoma,sans-serif]' : 'ltr'}`}
    >
      {/* Header bar */}
      <Header
        currentView={currentView}
        onNavigate={(v) => setCurrentView(v)}
        savedCount={savedReports.length}
        currentCountry={countryProfile.countryCode}
        onCountryChange={handleCountryChange}
        onOpenPilotDashboard={() => setIsPilotDashboardOpen(true)}
      />

      {/* Pilot Dashboard Modal */}
      <PilotDashboardModal
        isOpen={isPilotDashboardOpen}
        onClose={() => setIsPilotDashboardOpen(false)}
      />

      {/* Main View Router */}
      <main className="pb-16 sm:pb-0">
        {currentView === 'home' && (
          <HeroHome
            onStartScan={handleStartScanFlow}
            onNavigate={(v) => setCurrentView(v)}
            onSelectSample={handleSelectSampleCar}
            onQuickStartWithData={(data) => {
              setPendingPhotos({});
              setTempMileage(data.mileage);
              setTempPrice(data.price);
              executeAnalysisPipeline({
                askingPrice: data.price,
                mileageKm: data.mileage,
                year: data.year,
                brandHint: data.make,
                modelHint: data.model
              });
            }}
            savedCount={savedReports.length}
          />
        )}

        {currentView === 'scan' && (
          <PhotoScanner
            onPhotosComplete={handlePhotosComplete}
            onCancel={() => setCurrentView('home')}
            onSelectSampleCar={handleSelectSampleCar}
            onManualEntry={() => setIsManualModalOpen(true)}
          />
        )}

        {currentView === 'seller_data' && (
          <SellerDataCards
            initialPrice={tempPrice}
            initialMileage={tempMileage}
            onSubmit={(data) => executeAnalysisPipeline(data)}
            onSkip={() => executeAnalysisPipeline({ askingPrice: tempPrice, mileageKm: tempMileage })}
          />
        )}

        {currentView === 'loading' && (
          <AnalysisLoading
            status={loadingStatus}
            progressPercent={loadingProgress}
            stageMessage={loadingMessage}
          />
        )}

        {currentView === 'confirm_vehicle' && currentSession?.identification && (
          <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
            {/* Contradiction Warning Banner (Test F) */}
            {currentSession.identification.isContradictory && (
              <div className="bg-amber-500/15 border-2 border-amber-500/50 rounded-3xl p-5 space-y-3 animate-fade-in shadow-xl">
                <div className="flex items-center gap-2.5 text-amber-300 font-black text-sm uppercase tracking-wide">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span>Posible contradicción entre selección manual y análisis fotográfico</span>
                </div>
                <p className="text-xs text-white/90 leading-relaxed">
                  Has seleccionado manualmente <strong>{currentSession.identification.brand} {currentSession.identification.model}</strong>, pero los rasgos visuales de las fotos aportadas corresponden con alta probabilidad a un <strong>{currentSession.identification.conflictingDetectedVehicle?.brand} {currentSession.identification.conflictingDetectedVehicle?.model}</strong>.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      // Keep user's explicit selection
                      setCurrentSession({
                        ...currentSession,
                        identification: {
                          ...currentSession.identification!,
                          isContradictory: false
                        }
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Mantener mi selección ({currentSession.identification.brand} {currentSession.identification.model})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const detected = currentSession.identification?.conflictingDetectedVehicle;
                      if (detected) {
                        handleManualVehicleSave({
                          brand: detected.brand,
                          model: detected.model,
                          generation: detected.generation,
                          fuel: 'Gasolina',
                          transmission: 'Manual'
                        });
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer font-bold shadow-lg shadow-amber-500/20"
                  >
                    Revisar y cambiar a {currentSession.identification.conflictingDetectedVehicle?.brand} {currentSession.identification.conflictingDetectedVehicle?.model}
                  </button>
                </div>
              </div>
            )}

            <VehicleConfirmCard
              identification={currentSession.identification}
              onConfirm={handleConfirmVehicle}
              onManualOverride={() => setIsManualModalOpen(true)}
            />
          </div>
        )}

        {/* Manual Identification Modal */}
        <ManualIdentificationModal
          isOpen={isManualModalOpen}
          initialData={
            currentSession?.identification
              ? {
                  brand: currentSession.identification.brand === 'Vehículo No Identificado' ? '' : currentSession.identification.brand,
                  model: currentSession.identification.model === 'Modelo Desconocido' ? '' : currentSession.identification.model,
                  generation: currentSession.identification.generation === 'Pendiente de confirmación' ? '' : currentSession.identification.generation,
                  year: currentSession.identification.year,
                  engine: currentSession.identification.engine,
                  fuel: currentSession.identification.fuel as any,
                  power: currentSession.identification.power,
                  transmission: currentSession.identification.transmission as any,
                  isEngineUnknown: currentSession.identification.isEngineKnown === false,
                  askingPrice: currentSession.askingPrice || tempPrice,
                  mileageKm: currentSession.mileage || tempMileage
                }
              : (tempPrice || tempMileage)
              ? {
                  askingPrice: tempPrice,
                  mileageKm: tempMileage
                }
              : undefined
          }
          onClose={() => setIsManualModalOpen(false)}
          onSave={handleManualVehicleSave}
        />

        {currentView === 'report' && currentReport && (
          <AnalysisReport
            report={currentReport}
            onSaveToGarage={handleSaveReport}
            isSaved={isCurrentReportSaved}
            onLaunchAssistant={() => setCurrentView('assistant')}
            onLaunch3D={() => setCurrentView('3d')}
            countryProfile={countryProfile}
          />
        )}

        {currentView === 'garage' && (
          <GarageHistory
            savedReports={savedReports}
            onSelectReport={(r) => {
              setCurrentReport(r);
              setCurrentView('report');
            }}
            onDeleteReport={handleDeleteReport}
            onStartNewScan={() => setCurrentView('scan')}
          />
        )}

        {currentView === 'compare' && (
          <CarComparator
            savedReports={savedReports}
            onBack={() => setCurrentView('home')}
            onSelectReport={(r) => {
              setCurrentReport(r);
              setCurrentView('report');
            }}
            onLaunch3D={(r) => {
              setCurrentReport(r);
              setCurrentView('3d');
            }}
          />
        )}

        {currentView === 'chat' && (
          <CarChatAssistant
            report={currentReport}
            initialPrompt={chatInitialPrompt}
            onBack={() => {
              setChatInitialPrompt(undefined);
              setCurrentView(currentReport ? 'report' : 'home');
            }}
          />
        )}

        {currentView === '3d' && (
          <Car3DExplorer
            report={currentReport}
            session={currentSession}
            onNavigateToChat={(prompt) => {
              setChatInitialPrompt(prompt);
              setCurrentView('chat');
            }}
            onNavigateToReport={() => setCurrentView('report')}
          />
        )}

        {currentView === 'assistant' && (
          <AssistantMode onFinish={() => setCurrentView('home')} />
        )}

        {currentView === 'learn' && <LearnCars />}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavBar
        currentView={currentView}
        onNavigate={(v) => setCurrentView(v)}
        savedCount={savedReports.length}
      />
    </div>
  );
}
