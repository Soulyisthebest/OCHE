import React, { useState, useEffect } from 'react';
import {
  Car,
  CheckCircle2,
  X,
  HelpCircle,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Gauge,
  Cpu,
  Layers,
  FileText,
  MapPin,
  ShieldCheck,
  Edit3
} from 'lucide-react';

export interface ManualVehicleData {
  // Paso 1: Vehículo
  brand: string;
  model: string;
  generation?: string;
  year?: number;
  isGenerationUnknown?: boolean;

  // Paso 2: Motor
  fuel?: 'Gasolina' | 'Diésel' | 'Híbrido' | 'Híbrido enchufable' | 'Eléctrico' | 'GLP' | 'GNC' | 'Otro' | 'No lo sé';
  engine?: string;
  engineCode?: string;
  power?: number;
  transmission?: 'Manual' | 'Automático' | 'Doble embrague' | 'CVT' | 'Otra' | 'No lo sé';
  isEngineUnknown?: boolean;
  isPowerUnknown?: boolean;
  isTransmissionUnknown?: boolean;

  // Paso 3: Versión y Carrocería
  trim?: string;
  bodyType?: '5 puertas' | '3 puertas' | 'Sedán' | 'SUV' | 'Familiar' | 'Coupé' | 'Cabrio' | 'Otra' | 'No lo sé';
  isTrimUnknown?: boolean;

  // Paso 4: Datos del coche
  mileageKm?: number;
  askingPrice?: number;
  country?: string;
  region?: string;
  firstRegistrationDate?: string;

  // Paso 5: Identificación adicional (opcional)
  vin?: string;
  licensePlate?: string;
  customEngineCode?: string;
  versionCode?: string;
}

interface ManualIdentificationModalProps {
  initialData?: Partial<ManualVehicleData>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ManualVehicleData) => void;
  title?: string;
  subtitle?: string;
}

const COMMON_BRANDS = [
  'Volkswagen', 'Toyota', 'Peugeot', 'BMW', 'Ford',
  'Renault', 'Seat', 'Audi', 'Mercedes-Benz', 'Opel',
  'Hyundai', 'Kia', 'Nissan', 'Citroën', 'Fiat', 'Skoda'
];

interface EngineSuggestion {
  name: string;
  fuel: 'Gasolina' | 'Diésel' | 'Híbrido' | 'Eléctrico';
  power: number;
  code?: string;
}

const KNOWN_ENGINE_SUGGESTIONS: Record<string, Record<string, EngineSuggestion[]>> = {
  volkswagen: {
    golf: [
      { name: '2.0 TDI', fuel: 'Diésel', power: 150, code: 'CRBC' },
      { name: '1.6 TDI', fuel: 'Diésel', power: 115, code: 'CRKB' },
      { name: '1.4 TSI', fuel: 'Gasolina', power: 125, code: 'CZCA' },
      { name: '1.5 TSI Evo', fuel: 'Gasolina', power: 150, code: 'DADA' },
      { name: '2.0 TSI GTI', fuel: 'Gasolina', power: 220, code: 'CHHA' }
    ]
  },
  peugeot: {
    '208': [
      { name: '1.2 PureTech', fuel: 'Gasolina', power: 100, code: 'EB2ADT' },
      { name: '1.2 PureTech', fuel: 'Gasolina', power: 75, code: 'EB2FA' },
      { name: '1.2 PureTech', fuel: 'Gasolina', power: 130, code: 'EB2DTS' },
      { name: '1.5 BlueHDi', fuel: 'Diésel', power: 100, code: 'DV5RD' },
      { name: 'e-208 Eléctrico', fuel: 'Eléctrico', power: 136 }
    ]
  },
  toyota: {
    yaris: [
      { name: '1.0 VVT-i', fuel: 'Gasolina', power: 72, code: '1KR-FE' },
      { name: '1.5 VVT-i', fuel: 'Gasolina', power: 111, code: '2NR-FKE' },
      { name: '1.5 Hybrid', fuel: 'Híbrido', power: 100, code: '1NZ-FXE' },
      { name: '1.4 D-4D', fuel: 'Diésel', power: 90, code: '1ND-TV' }
    ]
  },
  bmw: {
    '320d': [
      { name: '320d (N47)', fuel: 'Diésel', power: 184, code: 'N47D20' },
      { name: '320d (B47)', fuel: 'Diésel', power: 190, code: 'B47D20' },
      { name: '320d EfficientDynamics', fuel: 'Diésel', power: 163, code: 'N47D20' }
    ],
    'serie 3': [
      { name: '320d', fuel: 'Diésel', power: 184, code: 'N47D20' },
      { name: '318d', fuel: 'Diésel', power: 143, code: 'N47D20' },
      { name: '320i', fuel: 'Gasolina', power: 184, code: 'N20B20' },
      { name: '330d', fuel: 'Diésel', power: 258, code: 'N57D30' }
    ]
  }
};

const KNOWN_TRIMS: Record<string, string[]> = {
  volkswagen: ['Advance', 'Sport', 'R-Line', 'Edition', 'GTD', 'GTI', 'Life', 'Style'],
  peugeot: ['Active', 'Allure', 'GT Line', 'GT', 'Like', 'Access', 'Style'],
  toyota: ['Active', 'Feel!', 'Style', 'GR Sport', 'Business', 'Edition'],
  bmw: ['Advantage', 'Sport', 'Luxury', 'M Sport', 'Modern', 'Base'],
  seat: ['Reference', 'Style', 'Xcellence', 'FR', 'Cupra'],
  ford: ['Trend', 'Titanium', 'ST-Line', 'Vignale', 'Active'],
  renault: ['Life', 'Zen', 'Intens', 'RS Line', 'Techno', 'Evolution'],
  audi: ['Attraction', 'Ambition', 'S line', 'Black line', 'Advanced'],
  mercedes: ['Style', 'Progressive', 'AMG Line', 'Business']
};

export const ManualIdentificationModal: React.FC<ManualIdentificationModalProps> = ({
  initialData,
  isOpen,
  onClose,
  onSave,
  title = 'Identificación Manual del Vehículo',
  subtitle = 'Introduce los datos del coche en sencillos pasos. Si desconoces algún dato, márcalo como "No lo sé" y la IA no inventará especificaciones.'
}) => {
  // Step navigation (1: Vehículo, 2: Motor, 3: Versión, 4: Datos, 5: Adicional, 6: Confirmación)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Paso 1: Vehículo
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [model, setModel] = useState(initialData?.model || '');
  const [generation, setGeneration] = useState(initialData?.generation || '');
  const [isGenerationUnknown, setIsGenerationUnknown] = useState<boolean>(initialData?.isGenerationUnknown || false);
  const [year, setYear] = useState<string>(initialData?.year ? String(initialData.year) : '');

  // Paso 2: Motor
  const [fuel, setFuel] = useState<string>(initialData?.fuel || 'Gasolina');
  const [engine, setEngine] = useState(initialData?.engine === 'Motor no especificado' ? '' : (initialData?.engine || ''));
  const [engineCode, setEngineCode] = useState(initialData?.engineCode || '');
  const [power, setPower] = useState<string>(initialData?.power ? String(initialData.power) : '');
  const [transmission, setTransmission] = useState<string>(initialData?.transmission || 'Manual');
  const [isEngineUnknown, setIsEngineUnknown] = useState<boolean>(
    initialData?.isEngineUnknown ?? (initialData?.engine === 'Motor no especificado' || false)
  );
  const [isPowerUnknown, setIsPowerUnknown] = useState<boolean>(initialData?.isPowerUnknown || false);
  const [isTransmissionUnknown, setIsTransmissionUnknown] = useState<boolean>(initialData?.isTransmissionUnknown || false);

  // Paso 3: Versión y Carrocería
  const [trim, setTrim] = useState(initialData?.trim || '');
  const [isTrimUnknown, setIsTrimUnknown] = useState<boolean>(initialData?.isTrimUnknown || false);
  const [bodyType, setBodyType] = useState<string>(initialData?.bodyType || '5 puertas');

  // Paso 4: Datos del coche
  const [mileageKm, setMileageKm] = useState<string>(initialData?.mileageKm ? String(initialData.mileageKm) : '');
  const [askingPrice, setAskingPrice] = useState<string>(initialData?.askingPrice ? String(initialData.askingPrice) : '');
  const [country, setCountry] = useState<string>(initialData?.country || 'España');
  const [region, setRegion] = useState<string>(initialData?.region || '');
  const [firstRegistrationDate, setFirstRegistrationDate] = useState<string>(initialData?.firstRegistrationDate || '');

  // Paso 5: Identificación adicional
  const [vin, setVin] = useState(initialData?.vin || '');
  const [licensePlate, setLicensePlate] = useState(initialData?.licensePlate || '');
  const [customEngineCode, setCustomEngineCode] = useState(initialData?.customEngineCode || '');
  const [versionCode, setVersionCode] = useState(initialData?.versionCode || '');

  // Reset or initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData?.brand) setBrand(initialData.brand);
      if (initialData?.model) setModel(initialData.model);
      if (initialData?.year) setYear(String(initialData.year));
      if (initialData?.engine) setEngine(initialData.engine === 'Motor no especificado' ? '' : initialData.engine);
      if (initialData?.fuel) setFuel(initialData.fuel);
      if (initialData?.power) setPower(String(initialData.power));
      if (initialData?.transmission) setTransmission(initialData.transmission);
      if (initialData?.isEngineUnknown !== undefined) setIsEngineUnknown(initialData.isEngineUnknown);
      if (initialData?.askingPrice) setAskingPrice(String(initialData.askingPrice));
      if (initialData?.mileageKm) setMileageKm(String(initialData.mileageKm));
      setCurrentStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Suggestions for engines based on Brand and Model
  const normalizedBrand = brand.trim().toLowerCase();
  const normalizedModel = model.trim().toLowerCase();
  const availableEngineSuggestions: EngineSuggestion[] =
    KNOWN_ENGINE_SUGGESTIONS[normalizedBrand]?.[normalizedModel] ||
    (normalizedBrand === 'bmw' && normalizedModel.includes('320') ? KNOWN_ENGINE_SUGGESTIONS.bmw['320d'] : []) ||
    [];

  // Suggestions for Trims
  const availableTrimSuggestions: string[] = KNOWN_TRIMS[normalizedBrand] || [];

  const handleSelectEngineSuggestion = (sug: EngineSuggestion) => {
    setEngine(sug.name);
    setFuel(sug.fuel);
    setPower(String(sug.power));
    if (sug.code) setEngineCode(sug.code);
    setIsEngineUnknown(false);
    setIsPowerUnknown(false);
  };

  const handleFinalSubmit = () => {
    const finalData: ManualVehicleData = {
      brand: brand.trim(),
      model: model.trim(),
      generation: isGenerationUnknown ? undefined : (generation.trim() || undefined),
      isGenerationUnknown,
      year: year ? parseInt(year, 10) : undefined,

      fuel: (fuel as any) || 'Gasolina',
      engine: isEngineUnknown ? 'Motor no especificado' : (engine.trim() || 'Motor no especificado'),
      engineCode: engineCode.trim() || undefined,
      power: (!isEngineUnknown && !isPowerUnknown && power) ? parseInt(power, 10) : undefined,
      transmission: isTransmissionUnknown ? undefined : ((transmission as any) || 'Manual'),
      isEngineUnknown,
      isPowerUnknown,
      isTransmissionUnknown,

      trim: isTrimUnknown ? undefined : (trim.trim() || undefined),
      isTrimUnknown,
      bodyType: (bodyType as any) || undefined,

      mileageKm: mileageKm ? parseInt(mileageKm, 10) : undefined,
      askingPrice: askingPrice ? parseInt(askingPrice, 10) : undefined,
      country: country.trim() || 'España',
      region: region.trim() || undefined,
      firstRegistrationDate: firstRegistrationDate.trim() || undefined,

      vin: vin.trim() || undefined,
      licensePlate: licensePlate.trim() || undefined,
      customEngineCode: customEngineCode.trim() || undefined,
      versionCode: versionCode.trim() || undefined
    };

    onSave(finalData);
  };

  const isStep1Valid = brand.trim().length > 0 && model.trim().length > 0;

  // Unknown items list for step 6 confirmation
  const unknownFields: string[] = [];
  if (isEngineUnknown || !engine.trim() || engine === 'Motor no especificado') {
    unknownFields.push('Motor: No especificado');
  }
  if (isPowerUnknown || !power || parseInt(power, 10) <= 0) {
    unknownFields.push('Potencia: No especificada');
  }
  if (isGenerationUnknown || !generation.trim()) {
    unknownFields.push('Generación: No especificada (se aplicará análisis de modelo general)');
  }
  if (isTransmissionUnknown || !transmission || transmission === 'No lo sé') {
    unknownFields.push('Transmisión: No especificada');
  }
  if (isTrimUnknown || !trim.trim()) {
    unknownFields.push('Acabado / Versión: No especificado');
  }
  if (!mileageKm) {
    unknownFields.push('Kilometraje: No indicado (se estimará por año o valor de referencia)');
  }
  if (!askingPrice) {
    unknownFields.push('Precio anunciado: No indicado');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#16161D] border border-white/10 rounded-[32px] max-w-2xl w-full p-5 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header with Step Pill & Close */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-wider">
              <Car className="w-3.5 h-3.5" />
              <span>PASO {currentStep} DE 6 • {
                currentStep === 1 ? 'VEHÍCULO' :
                currentStep === 2 ? 'MOTOR' :
                currentStep === 3 ? 'VERSIÓN Y CARROCERÍA' :
                currentStep === 4 ? 'DATOS DEL COCHE' :
                currentStep === 5 ? 'IDENTIFICACIÓN ADICIONAL' :
                'CONFIRMACIÓN FINAL'
              }</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-white/60">
              {subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Progress Tracker */}
        <div className="grid grid-cols-6 gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                if (s === 1 || isStep1Valid) setCurrentStep(s);
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                currentStep === s
                  ? 'bg-cyan-400'
                  : currentStep > s
                  ? 'bg-emerald-400'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              title={`Paso ${s}`}
            />
          ))}
        </div>

        {/* ========================================================================= */}
        {/* PASO 1 — VEHÍCULO */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-cyan-400" />
                Paso 1: Marca, Modelo, Generación y Año
              </h3>
              <p className="text-xs text-white/50">
                Indica los datos principales del vehículo. La marca y el modelo son obligatorios.
              </p>
            </div>

            {/* Marca & Modelo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60 block mb-1">
                  Marca *
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ej: Volkswagen, Toyota, BMW..."
                  required
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none font-bold"
                />
                {/* Quick Brand Badges */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {COMMON_BRANDS.slice(0, 6).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBrand(b)}
                      className={`text-[9px] px-2 py-1 rounded-lg border transition-all cursor-pointer font-bold ${
                        brand.toLowerCase() === b.toLowerCase()
                          ? 'bg-cyan-400 text-black border-cyan-400 shadow-sm'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/15'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60 block mb-1">
                  Modelo *
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Ej: Golf, Yaris, 208, 320d, Focus..."
                  required
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none font-bold"
                />
              </div>
            </div>

            {/* Generación & Año */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/60 block">
                    Generación / Carrocería
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsGenerationUnknown(!isGenerationUnknown);
                      if (!isGenerationUnknown) setGeneration('');
                    }}
                    className="text-[9px] font-bold text-cyan-400 hover:underline cursor-pointer"
                  >
                    {isGenerationUnknown ? 'Especificar generación' : 'No lo sé'}
                  </button>
                </div>
                {!isGenerationUnknown ? (
                  <input
                    type="text"
                    value={generation}
                    onChange={(e) => setGeneration(e.target.value)}
                    placeholder="Ej: VII, F30, Mk3, 2012-2019..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none font-bold"
                  />
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-amber-300/90 font-bold flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Generación: No especificada</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60 block mb-1">
                  Año de matriculación *
                </label>
                <input
                  type="number"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Ej: 2018"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 2 — MOTOR */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Paso 2: Motorización, Combustible, Potencia y Transmisión
              </h3>
              <p className="text-xs text-white/50">
                Selecciona los datos mecánicos. Si desconoces el bloque motor o potencia exacta, márcalo como "No lo sé".
              </p>
            </div>

            {/* Combustible */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-white/60 block mb-1.5">
                Tipo de combustible
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {['Gasolina', 'Diésel', 'Híbrido', 'Híbrido enchufable', 'Eléctrico', 'GLP'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFuel(f)}
                    className={`py-2 px-2 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                      fuel === f
                        ? 'bg-cyan-400 text-black border-cyan-400 shadow-lg'
                        : 'bg-black/40 border-white/10 text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Ambiguous Engine Options (Requirement 11) */}
            {availableEngineSuggestions.length > 0 && !isEngineUnknown && (
              <div className="bg-blue-950/30 border border-blue-500/30 rounded-2xl p-3.5 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Versiones y motores comunes para {brand} {model}:
                </span>
                <div className="flex flex-wrap gap-2">
                  {availableEngineSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectEngineSuggestion(sug)}
                      className={`text-xs px-3 py-2 rounded-xl border transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                        engine === sug.name && fuel === sug.fuel
                          ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                          : 'bg-black/60 border-white/15 text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <span>{sug.name}</span>
                      <span className="text-[10px] opacity-70">({sug.power} CV • {sug.fuel})</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setIsEngineUnknown(true);
                      setEngine('');
                      setPower('');
                    }}
                    className="text-xs px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer font-bold"
                  >
                    No sé cuál es
                  </button>
                </div>
              </div>
            )}

            {/* Engine & Power Input Fields */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60 block">
                  Motor / Cilindrada / Código de motor
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const next = !isEngineUnknown;
                    setIsEngineUnknown(next);
                    if (next) {
                      setEngine('');
                      setPower('');
                    }
                  }}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                    isEngineUnknown
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>{isEngineUnknown ? '✓ Motor: No lo sé' : 'No sé el motor'}</span>
                </button>
              </div>

              {!isEngineUnknown ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <input
                      type="text"
                      value={engine}
                      onChange={(e) => setEngine(e.target.value)}
                      placeholder="Ej: 2.0 TDI, 1.2 PureTech, 1.0 VVT-i"
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={engineCode}
                      onChange={(e) => setEngineCode(e.target.value)}
                      placeholder="Código motor (ej: CRBC, B47, N47)"
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={power}
                      onChange={(e) => setPower(e.target.value)}
                      placeholder="Potencia (CV / HP)"
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none font-bold"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl font-medium">
                  💡 Continuaremos con la información del modelo sin inventar datos específicos del motor ni asignar un bloque erróneo.
                </p>
              )}
            </div>

            {/* Transmisión */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60 block">
                  Transmisión
                </label>
                <button
                  type="button"
                  onClick={() => setIsTransmissionUnknown(!isTransmissionUnknown)}
                  className="text-[9px] font-bold text-cyan-400 hover:underline cursor-pointer"
                >
                  {isTransmissionUnknown ? 'Especificar transmisión' : 'No lo sé'}
                </button>
              </div>

              {!isTransmissionUnknown ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Manual', 'Automático', 'Doble embrague', 'CVT'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTransmission(t)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        transmission === t
                          ? 'bg-cyan-400 text-black border-cyan-400 shadow-md'
                          : 'bg-black/40 border-white/10 text-white/70 hover:bg-white/5'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-bold flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Transmisión: No especificada</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 3 — VERSIÓN Y CARROCERÍA */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Paso 3: Acabado, Equipamiento y Carrocería
              </h3>
              <p className="text-xs text-white/50">
                Ayuda a perfilar la versión exacta del vehículo o márcalo como "No lo sé".
              </p>
            </div>

            {/* Acabado / Versión */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60 block">
                  Acabado / Nivel de equipamiento
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsTrimUnknown(!isTrimUnknown);
                    if (!isTrimUnknown) setTrim('');
                  }}
                  className="text-[9px] font-bold text-cyan-400 hover:underline cursor-pointer"
                >
                  {isTrimUnknown ? 'Especificar acabado' : 'No lo sé'}
                </button>
              </div>

              {!isTrimUnknown ? (
                <>
                  <input
                    type="text"
                    value={trim}
                    onChange={(e) => setTrim(e.target.value)}
                    placeholder="Ej: Style, Sport, FR, M Sport, GT Line, Allure, Active..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none font-bold"
                  />
                  {availableTrimSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {availableTrimSuggestions.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTrim(t)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-bold ${
                            trim === t
                              ? 'bg-cyan-400 text-black border-cyan-400'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/15'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-amber-300 font-bold flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Acabado: No especificado</span>
                </div>
              )}
            </div>

            {/* Tipo de carrocería */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-white/60 block mb-1.5">
                Tipo de carrocería
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['5 puertas', '3 puertas', 'Sedán', 'SUV', 'Familiar', 'Coupé', 'Cabrio', 'Otra'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBodyType(b)}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                      bodyType === b
                        ? 'bg-cyan-400 text-black border-cyan-400 shadow-md'
                        : 'bg-black/40 border-white/10 text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 4 — DATOS DEL COCHE */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                Paso 4: Kilometraje, Precio y Ubicación
              </h3>
              <p className="text-xs text-white/50">
                Estos datos permiten calcular el desgaste estimado, riesgos de mantenimiento y precio objetivo de compra.
              </p>
            </div>

            {/* Kilómetros & Precio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60 block mb-1">
                  Kilómetros aproximados (km)
                </label>
                <input
                  type="number"
                  value={mileageKm}
                  onChange={(e) => setMileageKm(e.target.value)}
                  placeholder="Ej: 145000"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60 block mb-1">
                  Precio anunciado (€)
                </label>
                <input
                  type="number"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  placeholder="Ej: 9500"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none font-bold"
                />
              </div>
            </div>

            {/* País & Región */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60 block mb-1">
                  País de matriculación / mercado
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="España"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60 block mb-1">
                  Provincia / Región (opcional)
                </label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="Ej: Madrid, Barcelona, Valencia..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-white/60 block mb-1">
                Fecha de 1ª matriculación (mes/año - opcional)
              </label>
              <input
                type="text"
                value={firstRegistrationDate}
                onChange={(e) => setFirstRegistrationDate(e.target.value)}
                placeholder="Ej: 05/2018"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none font-bold"
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 5 — IDENTIFICACIÓN ADICIONAL (OPCIONAL) */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Paso 5: Identificación Adicional (Opcional)
              </h3>
              <p className="text-xs text-white/50">
                Campos no obligatorios para enriquecer la ficha técnica. No se realizan llamadas a APIs externas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60 block mb-1">
                  Número de bastidor (VIN)
                </label>
                <input
                  type="text"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  placeholder="Ej: WVWZZZAUZJP123456"
                  maxLength={17}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60 block mb-1">
                  Matrícula del coche
                </label>
                <input
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  placeholder="Ej: 1234 ABC"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none font-mono font-bold uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60 block mb-1">
                  Código de motor (ficha técnica)
                </label>
                <input
                  type="text"
                  value={customEngineCode}
                  onChange={(e) => setCustomEngineCode(e.target.value.toUpperCase())}
                  placeholder="Ej: CRBC, DADA, B47D20..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60 block mb-1">
                  Código de acabado / Versión
                </label>
                <input
                  type="text"
                  value={versionCode}
                  onChange={(e) => setVersionCode(e.target.value)}
                  placeholder="Ej: 5G137X"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none font-mono font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 6 — CONFIRMACIÓN FINAL (REQUIREMENT 4 & 5) */}
        {/* ========================================================================= */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Paso 6: Confirmación Final de los Datos del Vehículo
              </h3>
              <p className="text-xs text-white/60">
                Revisa el resumen antes de proceder al análisis técnico.
              </p>
            </div>

            {/* Vehicle Summary Card */}
            <div className="bg-black/60 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 block">
                    🚗 TU VEHÍCULO
                  </span>
                  <h4 className="text-2xl font-black uppercase italic tracking-tight text-white mt-0.5">
                    {brand} {model}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar
                </button>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-white/40 font-black uppercase block">Marca</span>
                  <span className="font-black text-white">{brand || 'No especificada'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 font-black uppercase block">Modelo</span>
                  <span className="font-black text-white">{model || 'No especificado'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 font-black uppercase block">Generación</span>
                  <span className="font-black text-white">{isGenerationUnknown || !generation ? 'No especificada' : generation}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 font-black uppercase block">Año</span>
                  <span className="font-black text-white">{year || 'No especificado'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 font-black uppercase block">Motor</span>
                  <span className="font-black text-white">{isEngineUnknown || !engine ? 'No especificado' : engine}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 font-black uppercase block">Combustible</span>
                  <span className="font-black text-white">{fuel}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 font-black uppercase block">Potencia</span>
                  <span className="font-black text-white">{isPowerUnknown || !power ? 'No especificada' : `${power} CV`}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 font-black uppercase block">Transmisión</span>
                  <span className="font-black text-white">{isTransmissionUnknown ? 'No especificada' : transmission}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 font-black uppercase block">Versión / Acabado</span>
                  <span className="font-black text-white">{isTrimUnknown || !trim ? 'No especificado' : trim}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 font-black uppercase block">Carrocería</span>
                  <span className="font-black text-white">{bodyType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 font-black uppercase block">Kilometraje</span>
                  <span className="font-black text-white">{mileageKm ? `${parseInt(mileageKm, 10).toLocaleString()} km` : 'No indicado'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 font-black uppercase block">Precio anunciado</span>
                  <span className="font-black text-white">{askingPrice ? `${parseInt(askingPrice, 10).toLocaleString()} €` : 'No indicado'}</span>
                </div>
              </div>

              {/* Extra Identifiers if present */}
              {(vin || licensePlate || customEngineCode) && (
                <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {vin && (
                    <div>
                      <span className="text-[10px] text-white/40 font-black uppercase block">VIN</span>
                      <span className="font-mono font-bold text-cyan-300">{vin}</span>
                    </div>
                  )}
                  {licensePlate && (
                    <div>
                      <span className="text-[10px] text-white/40 font-black uppercase block">Matrícula</span>
                      <span className="font-mono font-bold text-cyan-300">{licensePlate}</span>
                    </div>
                  )}
                  {customEngineCode && (
                    <div>
                      <span className="text-[10px] text-white/40 font-black uppercase block">Código Motor</span>
                      <span className="font-mono font-bold text-cyan-300">{customEngineCode}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Unknown Fields Warning (Requirement 5) */}
            {unknownFields.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Información que no conocemos ({unknownFields.length} campos):</span>
                </div>
                <ul className="text-xs text-amber-200/80 space-y-1 list-disc list-inside">
                  {unknownFields.map((uf, i) => (
                    <li key={i}>{uf}</li>
                  ))}
                </ul>
                <p className="text-[11px] text-white/60 pt-1">
                  💡 El análisis adaptará la matriz de riesgos y la inspección mecánica sin inventar datos no verificados.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/70 hover:text-white uppercase transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/60 hover:text-white uppercase transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              disabled={!isStep1Valid}
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-cyan-400/20 transition-all cursor-pointer"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                EDITAR DATOS
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ESTE ES MI COCHE</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
