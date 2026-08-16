import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
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
import { CarAnalysisReport, PhotoSlotId } from './types';
import { VehicleAnalysisSession, AnalysisStatus, VehicleIdentificationCandidate } from './types/analysisSession';
import { SampleDemoCar } from './data/sampleCars';
import { AnalysisSessionService } from './services/AnalysisSessionService';
import { localVehicleRepository } from './repositories/LocalVehicleRepository';
import { CountryEngine } from './services/CountryEngine';
import { LocalizationService } from './services/LocalizationService';
import { CountryProfile, CountryCode } from './types/country';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [currentSession, setCurrentSession] = useState<VehicleAnalysisSession | null>(null);
  const [currentReport, setCurrentReport] = useState<CarAnalysisReport | null>(null);
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

  // Handle photo scanning completion -> proceeds to Seller Data Cards
  const handlePhotosComplete = (
    photos: Partial<Record<PhotoSlotId, { url?: string; base64?: string }>>,
    mileageKm?: number,
    askingPrice?: number
  ) => {
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
          transmission: sellerData.transmission
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

      // If identification produced candidates, show confirmation card
      if (session.identification?.candidates && session.identification.candidates.length > 0) {
        setCurrentView('confirm_vehicle');
      } else {
        setCurrentView('report');
      }
    } catch (err) {
      console.error('Analysis execution failed:', err);
      setCurrentView('report');
    }
  };

  // Handle vehicle confirmation
  const handleConfirmVehicle = async (candidate: VehicleIdentificationCandidate) => {
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
          confidence: candidate.confidence
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
      />

      {/* Main View Router */}
      <main>
        {currentView === 'home' && (
          <HeroHome
            onStartScan={() => setCurrentView('scan')}
            onNavigate={(v) => setCurrentView(v)}
            onSelectSample={handleSelectSampleCar}
            savedCount={savedReports.length}
          />
        )}

        {currentView === 'scan' && (
          <PhotoScanner
            onPhotosComplete={handlePhotosComplete}
            onCancel={() => setCurrentView('home')}
            onSelectSampleCar={handleSelectSampleCar}
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
          <VehicleConfirmCard
            identification={currentSession.identification}
            onConfirm={handleConfirmVehicle}
            onManualOverride={() => setCurrentView('report')}
          />
        )}

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
    </div>
  );
}
