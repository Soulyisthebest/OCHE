import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, ChevronLeft, Bot, User, Car, ShieldAlert, ArrowRight, HelpCircle } from 'lucide-react';
import { CarAnalysisReport } from '../types';

interface CarChatAssistantProps {
  report?: CarAnalysisReport | null;
  initialPrompt?: string;
  onBack: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const PRESET_QUESTIONS = [
  "¿Es realmente fiable este modelo?",
  "¿Qué debería revisar prioritariamente en la prueba de conducción?",
  "¿Intentarías negociar el precio con el vendedor?",
  "¿Qué mantenimiento preventivo debo hacer nada más comprarlo?",
  "¿Tiene correa de distribución o cadena?"
];

export const CarChatAssistant: React.FC<CarChatAssistantProps> = ({ report, initialPrompt, onBack }) => {
  const carName = report ? `${report.identity.make} ${report.identity.model} (${report.identity.engine})` : 'el coche consultado';

  const initialGreeting = report
    ? `¡Hola! Soy tu asistente mecánico para el **${report.identity.make} ${report.identity.model}**. ¿Qué duda tienes sobre su fiabilidad, mantenimiento o negociación?`
    : '¡Hola! Soy tu asistente virtual de CARCHECK AI. ¿Sobre qué coche o duda mecánica quieres consultarme?';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: initialGreeting,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState(initialPrompt || '');
  const [isTyping, setIsTyping] = useState(false);

  React.useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();

      if (lower.includes('fiable') || lower.includes('fiabilidad')) {
        if (report) {
          reply = `En cuanto a fiabilidad, el **${report.identity.make} ${report.identity.model}** tiene una puntuación de fiabilidad del **${report.scoreCategories.find(c => c.name.includes('Fiabilidad'))?.score || report.score}/100**. ${
            report.modelProsCons.find(p => p.type === 'con')?.description || 'Recuerda comprobar siempre el historial de revisiones antes de la compra.'
          }`;
        } else {
          reply = 'En general, los motores atmosféricos de gasolina con distribución por cadena suelen ser los más fiables a largo plazo. Si buscas la máxima durabilidad, revisa modelos japoneses o alemanes con buen historial de mantenimiento.';
        }
      } else if (lower.includes('negociar') || lower.includes('precio') || lower.includes('vendedor')) {
        if (report) {
          reply = `El vendedor pide **${report.userPrice?.toLocaleString('es-ES')} €**. Basándome en las imperfecciones encontradas y el mantenimiento inicial estimado (${report.realCost.initialMaintenanceMin}–${report.realCost.initialMaintenanceMax} €), te sugiero negociar una rebaja de entre **300 € y 600 €** argumentando la necesidad de hacer una puesta a punto inicial.`;
        } else {
          reply = 'Para negociar un coche usado, utiliza siempre como argumento el coste de la primera puesta a punto (aceite, filtros, ruedas) y los desperfectos de pintura. Un descuento razonable suele estar entre el 5% y el 10% del precio anunciado.';
        }
      } else if (lower.includes('correa') || lower.includes('cadena') || lower.includes('distribucion') || lower.includes('distribución')) {
        if (report) {
          reply = `Para el **${report.identity.make} ${report.identity.model} ${report.identity.engine}**: revisa en la documentación del fabricante. Si equipa correa en aceite (como el PureTech o Ecoboost), la sustitución preventiva es crítica. Si tiene cadena, bastará con verificar que no hace ruidos metálicos al arrancar en frío.`;
        } else {
          reply = 'La correa de distribución debe cambiar cada 5–10 años según el modelo. Si tiene cadena, no suele requerir sustitución periódica a no ser que suene holgura al arrancar.';
        }
      } else if (lower.includes('revisar') || lower.includes('prueba') || lower.includes('conducir')) {
        reply = report
          ? `Durante la prueba in situ con el **${report.identity.make} ${report.identity.model}**:\n1. Arranca con el motor frío y escucha ruidos extraños.\n2. Comprueba que el aire acondicionado enfríe rápido.\n3. En 3ª marcha desde bajas vueltas, acelera a fondo para comprobar que el embrague no patine.\n4. Revisa que el volante no vibre a 100 km/h.`
          : 'Puntos clave al probar un coche: embrague (que no patine en 3ª), dirección sin holguras, frenos sin temblores y humo por el escape al acelerar en caliente.';
      } else {
        reply = `En relación con tu consulta sobre **${carName}**: Es fundamental revisar el libro de mantenimiento oficial y comprobar en la DGT que no tenga cargas ni embargos. ¿Deseas saber más sobre su coste de mantenimiento o puntos débiles?`;
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0C] text-white p-4 sm:p-6 max-w-4xl mx-auto flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="text-xs font-black uppercase tracking-wider text-white/70 hover:text-white flex items-center gap-1 bg-[#16161D] px-4 py-2 rounded-full border border-white/10 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-xs font-black text-blue-400 uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>ASISTENTE IA EN TIEMPO REAL</span>
          </div>
        </div>

        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter">
            💬 Pregunta Sobre Tu Coche
          </h1>
          <p className="text-xs text-white/50 font-bold uppercase tracking-wider">
            {report ? `Analizando: ${report.identity.make} ${report.identity.model} (${report.identity.engine})` : 'Consultas mecánicas y consejos de compra sin tecnicismos.'}
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-4">
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#16161D] hover:bg-white hover:text-black text-white/80 border border-white/10 transition-all cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-[#16161D] border border-white/10 rounded-[28px] p-4 sm:p-6 my-2 shadow-2xl flex flex-col justify-between overflow-hidden min-h-[380px]">
        <div className="space-y-4 overflow-y-auto max-h-[420px] pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black ${
                  m.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-black'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs font-bold leading-relaxed shadow-lg ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-black border border-white/10 text-white/90 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
                <div className="text-[9px] opacity-40 text-right mt-1 font-mono">{m.timestamp}</div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 bg-black/60 px-4 py-2 rounded-full border border-white/5 w-max animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>La IA está analizando los datos del coche...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            placeholder="Escribe tu duda sobre el coche..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-black border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => handleSendMessage()}
            className="p-3 bg-white hover:bg-blue-50 text-black rounded-2xl font-black transition-all cursor-pointer shadow-lg"
          >
            <Send className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
