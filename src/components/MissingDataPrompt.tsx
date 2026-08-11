import React, { useState } from 'react';
import { HelpCircle, ChevronRight, Check } from 'lucide-react';
import { CarAnalysisReport } from '../types';

interface MissingDataPromptProps {
  report: CarAnalysisReport;
  onConfirm: (updatedMileage?: number, updatedPrice?: number) => void;
}

export const MissingDataPrompt: React.FC<MissingDataPromptProps> = ({ report, onConfirm }) => {
  const [km, setKm] = useState<string>(report.mileageKm ? report.mileageKm.toString() : '140000');
  const [price, setPrice] = useState<string>(report.userPrice ? report.userPrice.toString() : '8500');

  const handleFinish = () => {
    onConfirm(
      km ? parseInt(km, 10) : report.mileageKm,
      price ? parseInt(price, 10) : report.userPrice
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/20">
          <HelpCircle className="w-6 h-6" />
        </div>

        <span className="text-xs font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-800 uppercase tracking-wider">
          Necesitamos confirmar este dato
        </span>

        <h2 className="text-xl font-extrabold text-white mt-3 mb-2">
          Casi listo para ver tu análisis
        </h2>

        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          Hemos identificado con éxito el vehículo ({report.identity.make} {report.identity.model}). Para afinar el cálculo de coste real y valor de mercado, confirma estos 2 detalles:
        </p>

        <div className="space-y-4 mb-6">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <label className="text-xs font-bold text-slate-200 block mb-1">
              1. ¿Cuántos kilómetros tiene el coche?
            </label>
            <div className="relative">
              <input
                type="number"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                placeholder="Ej: 145000"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-cyan-500"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">
                km
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <label className="text-xs font-bold text-slate-200 block mb-1">
              2. ¿Cuál es el precio que pide el vendedor?
            </label>
            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ej: 7900"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-cyan-500"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">
                €
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleFinish}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Check className="w-5 h-5" />
          <span>VER INFORME DE EVALUACIÓN</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
