import React, { useState } from 'react';
import { BookOpen, Search, ShieldAlert, Cpu, FileText, Lightbulb, ChevronRight, Trophy, CheckCircle2, XCircle } from 'lucide-react';

const ARTICLES = [
  {
    id: 'aceite',
    title: '1. Aceite del Motor y Filtros',
    category: 'Mantenimiento',
    readTime: '2 min',
    summary: 'El lubricante vital que evita que los metales del motor rocen entre sí y se fundan.',
    content: `• QUÉ ES: Fluido sintético o mineral de viscosidad controlada.
• PARA QUÉ SIRVE: Lubrica, enfría y limpia los componentes internos en movimiento (pistones, cigüeñal, árbol de levas).
• QUÉ PASA SI FALLA: Sin aceite o con aceite muy degradado, la fricción genera calor extremo y el motor se gripa (se destruye).
• CUÁNTO PUEDE COSTAR: Cambio de aceite y filtro: 80 € – 180 €. Reparar motor gripado: 2.500 € – 6.000 €.`
  },
  {
    id: 'frenos',
    title: '2. Discos y Pastillas de Freno',
    category: 'Seguridad',
    readTime: '2 min',
    summary: 'El sistema hidráulico de fricción que detiene el vehículo de forma segura.',
    content: `• QUÉ ES: Pastillas de fricción compuestas que presionan contra discos metálicos solidarios a la rueda.
• PARA QUÉ SIRVE: Convertir la energía cinética del coche en calor mediante fricción para detenerlo rápidamente.
• QUÉ PASA SI FALLA: Si se desgastan en exceso, el coche pierde eficacia de frenado, raya los discos o alarga la distancia de parada.
• CUÁNTO PUEDE COSTAR: Pastillas delanteras: 60 € – 120 €. Discos y pastillas completos: 220 € – 450 €.`
  },
  {
    id: 'embrague',
    title: '3. Sistema de Embrague y Bimasa',
    category: 'Transmisión',
    readTime: '3 min',
    summary: 'El mecanismo de acoplamiento entre el motor y la caja de cambios manual.',
    content: `• QUÉ ES: Disco de fricción acoplado a un volante de inercia bimasa que absorbe vibraciones.
• PARA QUÉ SIRVE: Desconectar el motor de las ruedas para cambiar de marcha o detenerse sin calar el motor.
• QUÉ PASA SI FALLA: El embrague "patina" (el motor acelera pero el coche no coge velocidad) o genera vibraciones violentas al arrancar.
• CUÁNTO PUEDE COSTAR: Kit de embrague simple: 400 € – 700 €. Kit de embrague + Volante Bimasa: 800 € – 1.400 €.`
  },
  {
    id: 'distribucion',
    title: '4. Correa o Cadena de Distribución',
    category: 'Motor',
    readTime: '3 min',
    summary: 'El corazón de la sincronización del motor.',
    content: `• QUÉ ES: Correa dentada de caucho o cadena metálica articulada.
• PARA QUÉ SIRVE: Sincronizar el movimiento del cigüeñal con el árbol de levas para abrir y cerrar válvulas a tiempo.
• QUÉ PASA SI FALLA: Si la correa se rompe en marcha, los pistones destruyen las válvulas de la culata.
• CUÁNTO PUEDE COSTAR: Kit de distribución preventivo + bomba de agua: 350 € – 650 €. Rotura de motor: >3.000 €.`
  },
  {
    id: 'turbo',
    title: '5. Turbocompresor',
    category: 'Motor',
    readTime: '2 min',
    summary: 'La turbina que sobrealimenta de aire a presión los cilindros.',
    content: `• QUÉ ES: Turbina accionada por los gases de escape que impulsa aire a presión a la admisión.
• PARA QUÉ SIRVE: Aumentar la potencia del motor con menor cilindrada y consumo.
• QUÉ PASA SI FALLA: Pérdida total de potencia, silbido agudo (ruido a ambulancia) o humo azul/blanco por consumo de aceite.
• CUÁNTO PUEDE COSTAR: Reconstruir o sustituir turbo: 600 € – 1.300 €.`
  },
  {
    id: 'dpf',
    title: '6. Filtro de Partículas (DPF / FAP)',
    category: 'Anticontaminación',
    readTime: '2 min',
    summary: 'El trampa de hollín para motores diésel modernos.',
    content: `• QUÉ ES: Cerámica porosa situada en el tubo de escape.
• PARA QUÉ SIRVE: Capturar las partículas nocivas de hollín e incinerarlas en trayectos de carretera (regeneración).
• QUÉ PASA SI FALLA: En uso puramente urbano se satura de carbonilla, el coche entra en modo de emergencia y no acelera.
• CUÁNTO PUEDE COSTAR: Limpieza profesional: 150 € – 300 €. Sustitución completa: 700 € – 1.500 €.`
  },
  {
    id: 'egr',
    title: '7. Válvula EGR',
    category: 'Anticontaminación',
    readTime: '2 min',
    summary: 'Sistemas de recirculación de gases de escape.',
    content: `• QUÉ ES: Válvula electromecánica que conecta el escape con la admisión.
• PARA QUÉ SIRVE: Reintroducir gases quemados para bajar la temperatura de combustión y reducir óxidos de nitrógeno (NOx).
• QUÉ PASA SI FALLA: Tirones a bajas revoluciones, falta de empuje y testigo de avería de motor encendido.
• CUÁNTO PUEDE COSTAR: Limpieza: 80 € – 150 €. Sustitución de válvula EGR: 200 € – 450 €.`
  },
  {
    id: 'bateria',
    title: '8. Batería y Alternador',
    category: 'Electricidad',
    readTime: '2 min',
    summary: 'El corazón del suministro eléctrico del coche.',
    content: `• QUÉ ES: Acumulador de 12V e intercambiador generador de corriente continua.
• PARA QUÉ SIRVE: Arrancar el motor y alimentar los sistemas electrónicos (lucres, radio, sensores).
• QUÉ PASA SI FALLA: El coche no arranca o se apaga en marcha con aviso de fallo eléctrico en el cuadro.
• CUÁNTO PUEDE COSTAR: Batería estándar / AGM: 80 € – 180 €. Alternador nuevo: 250 € – 500 €.`
  },
  {
    id: 'neumaticos',
    title: '9. Neumáticos',
    category: 'Seguridad',
    readTime: '2 min',
    summary: 'El único punto de contacto real del vehículo con el suelo.',
    content: `• QUÉ ES: Cubiertas de goma con compuesto de sílice y carcasa de acero.
• PARA QUÉ SIRVE: Transmitir la tracción, frenada y agarre en curva en cualquier estado del firme.
• QUÉ PASA SI FALLA: Desgaste desigual, grietas por vejez o aquaplaning con lluvia.
• CUÁNTO PUEDE COSTAR: Pareja de neumáticos calidad media: 140 € – 280 €.`
  },
  {
    id: 'suspension',
    title: '10. Amortiguadores y Mueles',
    category: 'Chasis',
    readTime: '2 min',
    summary: 'El sistema que mantiene las ruedas pegadas al asfalto.',
    content: `• QUÉ ES: Cilindros hidráulicos o de gas asistidos por muelles helicoidales.
• PARA QUÉ SIRVE: Absorber las irregularidades del firme y evitar que la carrocería balancee.
• QUÉ PASA SI FALLA: Rebotar excesivo en badenes, inestabilidad con viento lateral y mayor distancia de frenado.
• CUÁNTO PUEDE COSTAR: Pareja de amortiguadores delanteros/traseros: 250 € – 550 €.`
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
