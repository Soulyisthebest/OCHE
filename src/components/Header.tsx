import React from 'react';
import { Car, BookmarkCheck, Scale, MessageSquare, Wrench, Sparkles } from 'lucide-react';
import { CountrySelector } from './CountrySelector';
import { CountryCode, CountryProfile } from '../types/country';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  savedCount: number;
  currentCountry?: CountryCode;
  onCountryChange?: (profile: CountryProfile) => void;
  onOpenPilotDashboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  savedCount,
  currentCountry = 'ES',
  onCountryChange = () => {},
  onOpenPilotDashboard
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0A0C10]/90 backdrop-blur-md border-b border-white/10 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Pilot Badge */}
        <div className="flex items-center gap-2">
          <button
            id="header-brand-logo"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-black text-black text-lg shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              O
            </div>
            <span className="font-black text-lg tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              OCHE
            </span>
          </button>
          <button
            type="button"
            id="header-pilot-badge"
            onClick={onOpenPilotDashboard}
            className="px-1.5 py-0.5 text-[9px] font-black rounded-md bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 border border-cyan-400/30 tracking-widest uppercase cursor-pointer transition-colors"
            title="Abrir Panel de Control del Piloto (Fase 12)"
          >
            AI
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-[#141721] p-1.5 rounded-full border border-white/10 shadow-inner">
          <button
            id="nav-home-btn"
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              currentView === 'home'
                ? 'bg-cyan-500 text-black shadow-sm font-black'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Inicio
          </button>

          <button
            id="nav-assistant-btn"
            onClick={() => onNavigate('assistant')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'assistant'
                ? 'bg-cyan-500 text-black shadow-sm font-black'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Guíame
          </button>

          <button
            id="nav-garage-btn"
            onClick={() => onNavigate('garage')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'garage'
                ? 'bg-cyan-500 text-black shadow-sm font-black'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            Garaje
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-cyan-400 text-black rounded-full font-black">
                {savedCount}
              </span>
            )}
          </button>

          <button
            id="nav-compare-btn"
            onClick={() => onNavigate('compare')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'compare'
                ? 'bg-cyan-500 text-black shadow-sm font-black'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Comparar
          </button>

          <button
            id="nav-chat-btn"
            onClick={() => onNavigate('chat')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'chat'
                ? 'bg-cyan-500 text-black shadow-sm font-black'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Mecánico
          </button>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2.5">
          <CountrySelector
            currentCountry={currentCountry}
            onCountryChange={onCountryChange}
          />

          <button
            id="header-scan-cta"
            onClick={() => onNavigate('scan')}
            className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer font-bold"
          >
            <Car className="w-4 h-4 fill-current" />
            <span>ESCANEAR</span>
          </button>
        </div>
      </div>
    </header>
  );
};

