import React, { useState } from 'react';
import { Globe, Check, ChevronDown, Sparkles, MapPin } from 'lucide-react';
import { CountryProfile, CountryCode } from '../types/country';
import { CountryEngine } from '../services/CountryEngine';
import { LocalizationService } from '../services/LocalizationService';

interface CountrySelectorProps {
  currentCountry: CountryCode;
  onCountryChange: (country: CountryProfile) => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  currentCountry,
  onCountryChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const profiles = CountryEngine.getAllCountryProfiles();
  const activeProfile = CountryEngine.getCountryProfile(currentCountry);

  const handleSelect = (profile: CountryProfile) => {
    CountryEngine.setActiveCountryCode(profile.countryCode);
    LocalizationService.setActiveLanguage(profile.language);
    onCountryChange(profile);
    setIsOpen(false);
  };

  const handleAutoDetect = () => {
    const detected = CountryEngine.autoDetectCountry();
    handleSelect(detected);
  };

  return (
    <div className="relative inline-block text-left z-40">
      <div className="flex items-center gap-1.5 bg-[#16161D] border border-white/10 hover:border-cyan-500/40 rounded-full px-3 py-1.5 shadow-md transition-all">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-bold text-white hover:text-cyan-400 transition-colors cursor-pointer"
          title="Seleccionar país y mercado"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="uppercase font-mono tracking-wider">{activeProfile.countryCode}</span>
          <span className="text-white/40 text-[10px]">({activeProfile.currencySymbol} • {activeProfile.distanceUnit})</span>
          <ChevronDown className="w-3 h-3 text-white/50" />
        </button>

        <button
          onClick={handleAutoDetect}
          className="text-[10px] text-cyan-400 hover:text-cyan-300 p-0.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          title="Auto-detectar país"
        >
          <Sparkles className="w-3 h-3" />
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto bg-[#16161D] border border-white/15 rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-scale-in">
            <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" />
                Mercado & País Global
              </span>
              <button
                onClick={handleAutoDetect}
                className="text-[10px] text-cyan-400 font-bold hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5" />
                Auto-detectar
              </button>
            </div>

            <div className="space-y-0.5 pt-1">
              {profiles.map((p) => {
                const isSelected = p.countryCode === currentCountry;
                return (
                  <button
                    key={p.countryCode}
                    onClick={() => handleSelect(p)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>{p.countryName}</span>
                        <span className="text-[10px] font-mono text-white/40 uppercase">({p.countryCode})</span>
                      </div>
                      <div className="text-[10px] text-white/40">
                        {p.currency} ({p.currencySymbol}) • {p.distanceUnit} • {p.inspectionSystem.code}
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
