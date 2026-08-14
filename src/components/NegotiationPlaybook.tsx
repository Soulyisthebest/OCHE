import React, { useState } from 'react';
import { DollarSign, Copy, Check, MessageSquare, Wrench, ChevronRight } from 'lucide-react';
import { CarAnalysisReport } from '../types';
import { CountryEngine } from '../services/CountryEngine';
import { CountryProfile } from '../types/country';

interface NegotiationPlaybookProps {
  report: CarAnalysisReport;
  countryProfile?: CountryProfile;
}

export function NegotiationPlaybook({ report, countryProfile }: NegotiationPlaybookProps) {
  const profile = countryProfile || CountryEngine.getCountryProfile();
  const [copied, setCopied] = useState(false);
  const askingPrice = report.userPrice || report.realCost?.askingPrice || 8500;
  const negotiation = report.negotiation;
  const targetMin = negotiation?.targetPriceMin || Math.round(askingPrice * 0.88);
  const targetMax = negotiation?.targetPriceMax || Math.round(askingPrice * 0.94);

  // Generate specific technical discount arguments
  const argumentsList: string[] = [];

  const visibleDamages = report.visualObservations?.filter((o) => o.status === 'warning' || o.status === 'danger') || [];
  if (visibleDamages.length > 0) {
    argumentsList.push(
      `Desgastes observados: ${visibleDamages.map((d) => d.part).join(', ')}.`
    );
  }

  const knownFlaws = report.modelProsCons?.filter((p) => p.type === 'known_issue') || [];
  if (knownFlaws.length > 0) {
    argumentsList.push(
      `Mantenimientos específicos de este motor a verificar: ${knownFlaws.map((f) => f.title).join(', ')}.`
    );
  }

  const repMin = report.realCost?.visibleRepairsMin || 200;
  const repMax = report.realCost?.visibleRepairsMax || 450;
  argumentsList.push(
    `Presupuesto inmediato estimado de taller para puesta a punto: entre ${CountryEngine.formatMoney(repMin, profile)} y ${CountryEngine.formatMoney(repMax, profile)}.`
  );

  const scriptText = `Hola, he estado valorando tu ${report.identity.make} ${report.identity.model} (${report.identity.generation || ''}). Tras estudiar el modelo y los mantenimientos preventivos que le corresponden por kilometraje y edad (revisión de líquidos, frenos y puesta a punto estimada en ~${CountryEngine.formatMoney(repMax, profile)}), mi oferta en firme para cerrar el trato de forma rápida y sin complicaciones es de ${CountryEngine.formatMoney(targetMin, profile)} a ${CountryEngine.formatMoney(targetMax, profile)}. ¿Podríamos cuadrarlo? Un saludo.`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const inspectionName = profile.inspectionSystem.code;

  return (
    <div className="bg-[#12121A] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full inline-block mb-1">
            ESTRATEGIA & GUÍA DE NEGOCIACIÓN
          </span>
          <h3 className="text-lg font-black text-white uppercase italic tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Cómo regatear con argumentos técnicos reales
          </h3>
          <p className="text-xs text-white/60 mt-0.5">
            No regatees diciendo "es caro". Utiliza datos mecánicos objetivos, costes de taller y mantenimiento pendiente para justificar tu oferta en {profile.countryName}.
          </p>
        </div>

        <div className="bg-black/60 px-4 py-2.5 rounded-2xl border border-emerald-500/30 text-right self-start sm:self-center">
          <span className="text-[10px] text-white/40 uppercase block font-bold">Rango de Oferta Sugerido</span>
          <span className="text-base font-black font-mono text-emerald-400">
            {CountryEngine.formatMoney(targetMin, profile)} – {CountryEngine.formatMoney(targetMax, profile)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Arguments */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-emerald-400" />
            3 Argumentos técnicos clave para fundamentar tu oferta:
          </h4>

          <div className="space-y-2">
            {argumentsList.map((arg, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0 border border-emerald-800">
                  {idx + 1}
                </span>
                <p className="text-xs text-white/80 leading-relaxed font-medium">
                  {arg}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-400 block">
              💡 Consejo táctico de compra
            </span>
            <p className="text-xs text-white/70 leading-relaxed">
              Pregunta primero si dispone de facturas selladas de la distribución y embrague. Si no las tiene, exige descontar el importe íntegro de la operación.
            </p>
          </div>
        </div>

        {/* Ready to copy script */}
        <div className="space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                Mensaje listo para enviar por WhatsApp / Chat:
              </h4>

              <button
                onClick={copyToClipboard}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar mensaje</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-xs text-white/80 leading-relaxed font-mono relative">
              "{scriptText}"
            </div>
          </div>

          {/* Questions to ask the seller */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <span className="text-[10px] font-black uppercase text-white/50 block">
              ❓ 3 Preguntas obligatorias antes de ir a verlo:
            </span>
            <ul className="space-y-1.5 text-xs text-white/70">
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                <span>"¿El coche estará completamente frío cuando llegue para arrancarlo?"</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                <span>"¿Tienes la ficha de la última inspección {inspectionName} con el kilometraje anotado?"</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                <span>"¿Aceptas que lo llevemos 20 minutos a un taller de confianza a subirlo al elevador?"</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
