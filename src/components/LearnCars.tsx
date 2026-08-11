import React, { useState } from 'react';
import { BookOpen, Search, ShieldAlert, Cpu, FileText, Lightbulb, ChevronRight, Trophy, CheckCircle2, XCircle } from 'lucide-react';

const ARTICLES = [
  {
    id: 'scams',
    title: 'Los 5 trucos habituales para ocultar fallos en un coche usado',
    category: 'Consejos de Compra',
    readTime: '3 min',
    summary: 'Aprende a detectar si el motor fue calentado antes de tu llegada o si borraron los fallos del cuadro.',
    content: `1. Calentar el coche antes de la visita: Muchos vendedores arrancan el motor 15 minutos antes para evitar el traqueteo característico de la cadena de distribución en frío o el humo inicial.
2. Borrar códigos de avería OBD-II justo antes: Un testigo de fallo de motor apagado puede volver a encenderse tras recorrer 20 o 30 kilómetros.
3. Usar aditivos espesantes de aceite: Minimizan temporalmente el humo azul de consumo de aceite y suavizan ruidos de taqués.
4. Lavar / petrolear el motor: Un vano motor brillante impide ver fugas activas de aceite o anticongelante.
5. Disimular el desgaste con abrillantador de plásticos: Cubre el desgaste del volante y pomo para dar apariencia de menos kilometraje.`
  },
  {
    id: 'dictionary',
    title: 'Diccionario mecánico para principiantes',
    category: 'Glosario',
    readTime: '4 min',
    summary: 'Explicación en lenguaje sencillo de las siglas más temidas al comprar un coche.',
    content: `• EGR (Válvula de Recirculación de Gases): Reintroduce parte de los gases de escape al motor para contaminar menos. En ciudad se llena de carbonilla y causa tirones.
• DPF / FAP (Filtro de Partículas): Retiene el hollín en los motores diésel. Si no sale a carretera a limpiarse (regenerar), se satura y cuesta entre 600€ y 1.200€.
• Volante Bimasa: Pieza entre el motor y el embrague que absorbe vibraciones. Si suena un "clac-clac" metálico en ralentí, está gastado.
• Correa de Distribución: Correa de goma que sincroniza el motor. Si rompe en marcha, destruye el motor. Debe cambiarse por tiempo o kilómetros.
• Silentblocks: Tacos de goma que sujetan la suspensión y el motor para amortiguar vibraciones.`
  },
  {
    id: 'itv',
    title: 'Trámites legales e informe DGT antes de pagar',
    category: 'Documentación',
    readTime: '2 min',
    summary: 'Pasos para comprobar que el coche no tiene embargos, reservas de dominio ni manipulaciones de km.',
    content: `Antes de entregar cualquier señal o reserva:
1. Pide el Informe Completo de la DGT (~8,50 €): Comprueba si tiene cargas de reserva de dominio, embargos o precintos.
2. Revisa la Ficha Técnica e historial de ITV: Comprueba la evolución real de kilómetros anotados en cada inspección.
3. Contrato de compraventa entre particulares: Especifica siempre fecha, hora exacta de entrega y kilometraje en el contrato.`
  }
];

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: '¿Qué función principal realiza la correa de distribución?',
    options: [
      { text: 'A) Generar la electricidad para la batería', isCorrect: false },
      { text: 'B) Sincronizar el movimiento de los pistones y las válvulas', isCorrect: true },
      { text: 'C) Enfriar el líquido anticongelante', isCorrect: false }
    ],
    explanation: '¡Correcto! Sincroniza la parte superior e inferior del motor. Si se rompe, las válvulas chocan contra los pistones destruyendo el motor.'
  },
  {
    id: 2,
    question: '¿Por qué un vendedor podría calentar el motor antes de que pruebes el coche?',
    options: [
      { text: 'A) Para disimular ruidos de cadena de distribución en frío', isCorrect: true },
      { text: 'B) Para que el aire acondicionado enfríe más rápido', isCorrect: false },
      { text: 'C) Para ahorrar combustible durante la prueba', isCorrect: false }
    ],
    explanation: '¡Exacto! Holguras en cadenas o taqués suenan intensamente solo con el motor totalmente frío.'
  },
  {
    id: 3,
    question: '¿Qué indica un humo blanco denso y continuo por el escape en caliente?',
    options: [
      { text: 'A) Que el coche consume gasolina de alta calidad', isCorrect: false },
      { text: 'B) Posible fuga de anticongelante por la junta de culata', isCorrect: true },
      { text: 'C) Presión excesiva en los neumáticos', isCorrect: false }
    ],
    explanation: '¡Muy bien! El humo blanco continuo en caliente suele ser vapor por consumo de refrigerante.'
  }
];

export const LearnCars: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'guides' | 'quiz'>('guides');
  const [selectedArticle, setSelectedArticle] = useState<typeof ARTICLES[0] | null>(ARTICLES[0]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Gamification state
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [userXp, setUserXp] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const filtered = ARTICLES.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectQuizOption = (optIdx: number) => {
    if (selectedAnswerIdx !== null) return;
    setSelectedAnswerIdx(optIdx);

    const isCorrect = QUIZ_QUESTIONS[currentQuizIdx].options[optIdx].isCorrect;
    if (isCorrect) {
      setUserXp((prev) => prev + 10);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuizIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizIdx((prev) => prev + 1);
      setSelectedAnswerIdx(null);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuizIdx(0);
    setSelectedAnswerIdx(null);
    setQuizCompleted(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0C] text-white p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Top Title Bar & Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-xs font-black text-blue-400 uppercase tracking-widest mb-2">
            <BookOpen className="w-4 h-4" />
            <span>GUÍA Y GAMIFICACIÓN</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic">
            Aprende Sobre Coches
          </h1>
          <p className="text-xs text-white/50 font-bold uppercase tracking-wider">
            Aprende mecánica básica sin tecnicismos y pon a prueba tus conocimientos para ganar XP.
          </p>
        </div>

        {/* Tab switcher & XP badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 px-3.5 py-2 rounded-2xl text-xs font-black uppercase">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{userXp} XP</span>
          </div>

          <div className="flex bg-[#16161D] border border-white/10 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('guides')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'guides' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              Guías
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'quiz' ? 'bg-blue-600 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              Quiz +10 XP
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'guides' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* List of articles (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Buscar tema o sigla (EGR, DPF...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#16161D] border border-white/10 rounded-2xl pl-9 pr-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
              />
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-3" />
            </div>

            {filtered.map((art) => {
              const isSelected = selectedArticle?.id === art.id;
              return (
                <button
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#16161D] border-blue-500 shadow-lg'
                      : 'bg-[#16161D]/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-blue-400 mb-1">
                    <span>{art.category}</span>
                    <span className="text-white/40">{art.readTime}</span>
                  </div>
                  <h3 className="font-black text-sm text-white uppercase italic tracking-tighter mb-1">
                    {art.title}
                  </h3>
                  <p className="text-xs text-white/60 font-medium line-clamp-2">
                    {art.summary}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Selected article viewer (7 cols) */}
          <div className="md:col-span-7">
            {selectedArticle ? (
              <div className="bg-[#16161D] border border-white/10 rounded-[28px] p-6 shadow-2xl space-y-4">
                <span className="text-xs font-black uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 w-max block">
                  {selectedArticle.category}
                </span>

                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                  {selectedArticle.title}
                </h2>

                <div className="bg-black p-5 rounded-2xl border border-white/10 text-xs text-white/80 leading-relaxed whitespace-pre-line font-bold">
                  {selectedArticle.content}
                </div>
              </div>
            ) : (
              <div className="bg-[#16161D] border border-white/10 rounded-[28px] p-8 text-center text-white/40 text-xs font-black uppercase">
                Selecciona una guía para leer
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Gamified Quiz Section */
        <div className="max-w-2xl mx-auto bg-[#16161D] border border-white/10 rounded-[32px] p-6 shadow-2xl">
          {!quizCompleted ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] bg-blue-500/10 px-3 py-1 rounded-full">
                  PREGUNTA {currentQuizIdx + 1} DE {QUIZ_QUESTIONS.length}
                </span>
                <span className="text-xs font-black text-amber-400">
                  RECOMPENSA: +10 XP
                </span>
              </div>

              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6">
                {QUIZ_QUESTIONS[currentQuizIdx].question}
              </h2>

              <div className="space-y-3 mb-6">
                {QUIZ_QUESTIONS[currentQuizIdx].options.map((opt, idx) => {
                  const isSelected = selectedAnswerIdx === idx;
                  const isCorrect = opt.isCorrect;

                  let style = 'bg-black border-white/10 text-white/80 hover:border-white/30';
                  if (selectedAnswerIdx !== null) {
                    if (isCorrect) {
                      style = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-black';
                    } else if (isSelected) {
                      style = 'bg-red-500/20 border-red-500 text-red-300 font-black';
                    } else {
                      style = 'bg-black border-white/5 text-white/30';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizOption(idx)}
                      className={`w-full p-4 rounded-2xl border text-xs font-bold uppercase tracking-wider text-left transition-all flex items-center justify-between cursor-pointer ${style}`}
                    >
                      <span>{opt.text}</span>
                      {selectedAnswerIdx !== null && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      )}
                      {selectedAnswerIdx !== null && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedAnswerIdx !== null && (
                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-2xl mb-6 text-xs font-bold text-blue-300 leading-relaxed">
                  <p>{QUIZ_QUESTIONS[currentQuizIdx].explanation}</p>
                </div>
              )}

              {selectedAnswerIdx !== null && (
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3.5 bg-white hover:bg-blue-50 text-black rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg transition-all"
                >
                  {currentQuizIdx < QUIZ_QUESTIONS.length - 1 ? 'Siguiente Pregunta →' : 'Ver Puntuación Final 🎉'}
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                ¡DESAFÍO COMPLETADO!
              </h2>
              <p className="text-sm font-bold text-white/70">
                Has conseguido un total de <span className="text-amber-400 font-black">{userXp} XP</span> respondiendo las preguntas mecánicas.
              </p>

              <button
                onClick={handleResetQuiz}
                className="mt-4 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-xl"
              >
                Volver a Jugar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
