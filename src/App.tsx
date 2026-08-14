import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroHome } from './components/HeroHome';
import { PhotoScanner } from './components/PhotoScanner';
import { AnalysisLoading } from './components/AnalysisLoading';
import { MissingDataPrompt } from './components/MissingDataPrompt';
import { AnalysisReport } from './components/AnalysisReport';
import { GarageHistory } from './components/GarageHistory';
import { Car3DExplorer } from './components/Car3DExplorer';
import { AssistantMode } from './components/AssistantMode';
import { LearnCars } from './components/LearnCars';
import { CarChatAssistant } from './components/CarChatAssistant';
import { CarComparator } from './components/CarComparator';
import { CarAnalysisReport, PhotoSlotId } from './types';
import { SampleDemoCar } from './data/sampleCars';
import { analyzeCarPhotosServer } from './services/geminiService';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [currentReport, setCurrentReport] = useState<CarAnalysisReport | null>(null);
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

  // Handle photo scanning completion
  const handlePhotosComplete = async (
    photos: Partial<Record<PhotoSlotId, { url?: string; base64?: string }>>,
    mileageKm?: number,
    askingPrice?: number
  ) => {
    setCurrentView('loading');

    try {
      const report = await analyzeCarPhotosServer(photos, { mileageKm, askingPrice });
      setCurrentReport(report);

      if (report.identity.needsConfirmation && (!mileageKm || !askingPrice)) {
        setCurrentView('missing_prompt');
      } else {
        setCurrentView('report');
      }
    } catch (err) {
      console.error('Failed to analyze photos:', err);
      setCurrentView('report');
    }
  };

  // Select preloaded sample car
  const handleSelectSampleCar = (sample: SampleDemoCar) => {
    setCurrentReport(sample.report);
    setCurrentView('report');
  };

  // Missing data prompt confirmation
  const handleConfirmMissingData = (km?: number, price?: number) => {
    if (!currentReport) return;

    const updated = { ...currentReport };
    if (km) updated.mileageKm = km;
    if (price) {
      updated.userPrice = price;
      updated.realCost.askingPrice = price;
      updated.realCost.totalMin = price + 200 + (updated.realCost.initialMaintenanceMin || 250) + (updated.realCost.visibleRepairsMin || 200);
      updated.realCost.totalMax = price + 250 + (updated.realCost.initialMaintenanceMax || 400) + (updated.realCost.visibleRepairsMax || 400);
    }
    updated.identity.needsConfirmation = false;

    setCurrentReport(updated);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Header bar */}
      <Header
        currentView={currentView}
        onNavigate={(v) => setCurrentView(v)}
        savedCount={savedReports.length}
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

        {currentView === 'loading' && <AnalysisLoading />}

        {currentView === 'missing_prompt' && currentReport && (
          <MissingDataPrompt
            report={currentReport}
            onConfirm={handleConfirmMissingData}
          />
        )}

        {currentView === 'report' && currentReport && (
          <AnalysisReport
            report={currentReport}
            onSaveToGarage={handleSaveReport}
            isSaved={isCurrentReportSaved}
            onLaunchAssistant={() => setCurrentView('assistant')}
            onLaunch3D={() => setCurrentView('3d')}
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
            onBack={() => setCurrentView(currentReport ? 'report' : 'home')}
          />
        )}

        {currentView === '3d' && <Car3DExplorer />}

        {currentView === 'assistant' && (
          <AssistantMode onFinish={() => setCurrentView('home')} />
        )}

        {currentView === 'learn' && <LearnCars />}
      </main>
    </div>
  );
}
