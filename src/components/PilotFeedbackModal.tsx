import React, { useState } from 'react';
import { Star, CheckCircle2, MessageSquare, ThumbsUp, HelpCircle, X, ArrowRight } from 'lucide-react';
import { PilotSessionService } from '../services/PilotSessionService';
import { PilotUserFeedback } from '../types/pilotSession';

interface PilotFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportScore?: number;
}

export const PilotFeedbackModal: React.FC<PilotFeedbackModalProps> = ({
  isOpen,
  onClose,
  reportScore
}) => {
  const [easeRating, setEaseRating] = useState<number>(5);
  const [understandRating, setUnderstandRating] = useState<number>(5);
  const [confidenceRating, setConfidenceRating] = useState<number>(5);
  const [wouldUseAgain, setWouldUseAgain] = useState<'YES' | 'MAYBE' | 'NO'>('YES');
  const [mostUsefulFeature, setMostUsefulFeature] = useState<PilotUserFeedback['mostUsefulFeature']>('helped_negotiate');
  const [whatConfused, setWhatConfused] = useState<string>('');
  const [whatWasUseful, setWhatWasUseful] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const feedback: PilotUserFeedback = {
      easeOfUseRating: easeRating,
      understandChecksRating: understandRating,
      confidenceRating: confidenceRating,
      wouldUseAgain,
      mostUsefulFeature,
      whatConfusedUser: whatConfused.trim() || undefined,
      whatWasMostUseful: whatWasUseful.trim() || undefined,
      trustScore: confidenceRating,
      submittedAt: new Date().toISOString()
    };

    PilotSessionService.recordUserFeedback(feedback);
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0D111C] border border-cyan-500/30 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-black text-[10px] uppercase tracking-wider">
              PILOTO OCHE
            </span>
            <h2 className="text-base font-black tracking-tight">Tu opinión en 30 segundos</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-white">¡Muchas gracias por ayudarnos!</h3>
            <p className="text-xs text-white/60">Tu valoración ayuda a mejorar la experiencia de inspección.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Q1: ¿Fue fácil de usar? */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/90 block">
                1. ¿Te resultó fácil y rápido usar OCHE?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEaseRating(star)}
                    className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      easeRating >= star
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-black'
                        : 'bg-black/40 border-white/10 text-white/40'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${easeRating >= star ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Q2: ¿Entendiste qué comprobar? */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/90 block">
                2. ¿Entendiste bien qué revisar en el coche?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUnderstandRating(star)}
                    className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      understandRating >= star
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-black'
                        : 'bg-black/40 border-white/10 text-white/40'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${understandRating >= star ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Q3: ¿Te dio más confianza? */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/90 block">
                3. ¿Te ayudó a tener más seguridad para decidir?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setConfidenceRating(star)}
                    className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      confidenceRating >= star
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-black'
                        : 'bg-black/40 border-white/10 text-white/40'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${confidenceRating >= star ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Q4: ¿Volverías a usarlo? */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/90 block">
                4. ¿Volverías a usarlo antes de comprar otro coche usado?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['YES', 'MAYBE', 'NO'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setWouldUseAgain(opt)}
                    className={`py-2 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      wouldUseAgain === opt
                        ? opt === 'YES'
                          ? 'bg-emerald-500 text-black border-emerald-400'
                          : opt === 'MAYBE'
                          ? 'bg-amber-500 text-black border-amber-400'
                          : 'bg-red-500 text-white border-red-400'
                        : 'bg-black/40 border-white/10 text-white/60'
                    }`}
                  >
                    {opt === 'YES' ? 'SÍ' : opt === 'MAYBE' ? 'TAL VEZ' : 'NO'}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Short Questions */}
            <div className="space-y-2 pt-1 border-t border-white/10">
              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">
                  ¿Qué te resultó más útil? (Opcional)
                </label>
                <input
                  type="text"
                  value={whatWasUseful}
                  onChange={(e) => setWhatWasUseful(e.target.value)}
                  placeholder="Ej. El precio objetivo de negociación o el test de embrague"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">
                  ¿Hubo algo que te confundiera? (Opcional)
                </label>
                <input
                  type="text"
                  value={whatConfused}
                  onChange={(e) => setWhatConfused(e.target.value)}
                  placeholder="Ej. La cámara en garaje oscuro o alguna palabra técnica"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              id="submit-pilot-feedback-btn"
              type="submit"
              className="w-full py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.99] transition-all cursor-pointer mt-2"
            >
              <ThumbsUp className="w-4 h-4 stroke-[2.5]" />
              <span>Enviar valoración</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
