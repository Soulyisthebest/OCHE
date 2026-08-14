import React, { useState } from 'react';
import { ShieldCheck, Eye, BookOpen, Sparkles, HelpCircle, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { EvidenceEngine } from '../services/EvidenceEngine';
import { getEvidenceBadge, StructuredFinding } from '../types/evidence';
import { CarAnalysisReport } from '../types';

interface EvidenceSectionProps {
  report: CarAnalysisReport;
}

export function EvidenceSection({ report }: EvidenceSectionProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'observed' | 'known' | 'inferred' | 'unknown'>('all');

  const findings = EvidenceEngine.categorizeFindings(
    report.visualObservations || [],
    report.modelProsCons || [],
    report.repairs || [],
    report.mileageKm
  );

  const totalCount =
    findings.observed.length + findings.known.length + findings.inferred.length + findings.unknown.length;

  const getListToDisplay = (): StructuredFinding[] => {
    switch (activeTab) {
      case 'observed':
        return findings.observed;
      case 'known':
        return findings.known;
      case 'inferred':
        return findings.inferred;
      case 'unknown':
        return findings.unknown;
      case 'all':
      default:
        return [
          ...findings.observed,
          ...findings.known,
          ...findings.inferred,
          ...findings.unknown
        ];
    }
  };

  const list = getListToDisplay();

  return (
    <div className="bg-[#12121A] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded-full inline-block mb-1">
            MOTOR DE EVIDENCIAS & CONFIANZA
          </span>
          <h3 className="text-lg font-black text-white uppercase italic tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            Separación estricta de hechos vs suposiciones
          </h3>
          <p className="text-xs text-white/60 mt-0.5">
            OCHE distingue con rigor qué se ve en las fotos, qué es un fallo documentado del motor, qué se deduce por kilometraje y qué requiere prueba en elevador.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/60 rounded-2xl border border-white/5 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            Todos ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('observed')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'observed' ? 'bg-emerald-600 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            Visto en foto ({findings.observed.length})
          </button>
          <button
            onClick={() => setActiveTab('known')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'known' ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            Fallo de motor ({findings.known.length})
          </button>
          <button
            onClick={() => setActiveTab('inferred')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inferred' ? 'bg-amber-600 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            Deducido por km ({findings.inferred.length})
          </button>
          <button
            onClick={() => setActiveTab('unknown')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'unknown' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            Revisar en persona ({findings.unknown.length})
          </button>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        {list.map((finding) => {
          const badge = getEvidenceBadge(finding.evidenceType);
          return (
            <div
              key={finding.id}
              className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    <span>{badge.icon}</span>
                    {badge.label}
                  </span>

                  <span className="text-[10px] font-medium text-white/40 bg-white/5 px-2 py-0.5 rounded-md">
                    Fuente: {finding.source}
                  </span>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    finding.confidence >= 0.8 ? 'text-emerald-400 bg-emerald-950/40' : finding.confidence >= 0.5 ? 'text-amber-400 bg-amber-950/40' : 'text-purple-400 bg-purple-950/40'
                  }`}>
                    {finding.confidenceTier} ({Math.round(finding.confidence * 100)}%)
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug">
                  {finding.title}
                </h4>

                <p className="text-xs text-white/70 leading-relaxed">
                  {finding.description}
                </p>

                {finding.recommendedAction && (
                  <div className="text-xs text-amber-300 font-medium flex items-center gap-1.5 pt-1">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                    <span>Acción recomendada: {finding.recommendedAction}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
