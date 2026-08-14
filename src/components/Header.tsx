import React from 'react';
import { Car, ShieldCheck, BookmarkCheck, BookOpen, Compass, MessageSquare, Scale } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, savedCount }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0F0F12]/95 backdrop-blur-md border-b border-white/10 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
        >
          <div className="text-blue-500 font-black text-2xl tracking-tighter group-hover:scale-105 transition-transform">
            C/A
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base uppercase tracking-wider text-white">
                CARCHECK
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-black rounded-md bg-blue-500 text-black tracking-widest uppercase">
                AI PRO
              </span>
            </div>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none">
              v1.0 Prototype
            </p>
          </div>
        </button>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#16161D] p-1.5 rounded-full border border-white/10">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'home' || currentView === 'scan'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            Escanear
          </button>

          <button
            onClick={() => onNavigate('garage')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'garage'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            Garaje
            {savedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] bg-blue-500 text-black rounded-full font-black">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('compare')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'compare'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Comparar
          </button>

          <button
            onClick={() => onNavigate('chat')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'chat'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat IA
          </button>

          <button
            onClick={() => onNavigate('3d')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === '3d'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Explorar 3D
          </button>

          <button
            onClick={() => onNavigate('assistant')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'assistant'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Asistente
          </button>

          <button
            onClick={() => onNavigate('learn')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'learn'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Aprende
          </button>
        </nav>

        {/* Action / Mobile Menu CTA */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex bg-white/5 px-3 py-1.5 rounded-full border border-white/10 items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/70">1,240 CRÉDITOS</span>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          </div>

          <button
            onClick={() => onNavigate('scan')}
            className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-white hover:bg-blue-50 text-black shadow-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Car className="w-4 h-4 text-blue-600 fill-current" />
            <span className="hidden sm:inline">ESCANEAR</span>
          </button>
        </div>
      </div>
    </header>
  );
};

