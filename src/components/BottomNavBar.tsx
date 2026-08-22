import React from 'react';
import { Home, Camera, Wrench, BookmarkCheck, MessageSquare, Scale } from 'lucide-react';

interface BottomNavBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  savedCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentView,
  onNavigate,
  savedCount
}) => {
  const navItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'assistant', label: 'Guíame', icon: Wrench },
    { id: 'scan', label: 'Escanear', icon: Camera, isPrimary: true },
    { id: 'garage', label: 'Garaje', icon: BookmarkCheck, badge: savedCount },
    { id: 'chat', label: 'Mecánico', icon: MessageSquare }
  ];

  // Hide bottom nav on specific views like loading or in-depth scanner fullscreen if needed,
  // but keep it available across main consumer flows
  if (currentView === 'loading') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0D13]/95 backdrop-blur-xl border-t border-white/10 px-3 py-2 sm:hidden safe-area-pb">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === 'home' && currentView === 'report');

          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                id="bottom-nav-scan"
                onClick={() => onNavigate('scan')}
                className="relative -top-3 flex flex-col items-center group cursor-pointer focus:outline-none"
              >
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/30 group-active:scale-95 transition-transform flex items-center justify-center">
                  <div className="w-full h-full rounded-[14px] bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-black">
                    <Icon className="w-6 h-6 stroke-[2.5]" />
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              id={`bottom-nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
                isActive ? 'text-cyan-400 font-bold' : 'text-white/50 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-cyan-400 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold tracking-tight mt-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
