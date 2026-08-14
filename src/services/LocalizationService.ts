import { LanguageCode, TextDirection } from '../types/country';

export type TranslationKey =
  | 'app_title'
  | 'app_subtitle'
  | 'start_analysis'
  | 'garage'
  | 'compare'
  | 'assistant'
  | 'learn'
  | 'country'
  | 'currency'
  | 'score'
  | 'quality_score'
  | 'deal_score'
  | 'verdict'
  | 'asking_price'
  | 'mileage'
  | 'transfer_fees'
  | 'total_real_cost'
  | 'target_price'
  | 'what_to_ask_seller'
  | 'mechanic_checklist'
  | 'cannot_determine'
  | 'good_points'
  | 'bad_points'
  | 'risks'
  | 'possible_repairs'
  | 'why'
  | 'how_much'
  | 'how_to_check'
  | 'copy'
  | 'copied'
  | 'save_to_garage'
  | 'saved'
  | 'good_deal'
  | 'caution'
  | 'avoid'
  | 'step_scanning'
  | 'step_identifying'
  | 'step_analyzing'
  | 'step_calculating'
  | 'step_ready';

export const TRANSLATIONS: Record<LanguageCode, Record<TranslationKey, string>> = {
  es: {
    app_title: 'OCHE / CARCHECK AI',
    app_subtitle: 'Asistente Inteligente Global para Comprar Coches Usados',
    start_analysis: 'Analizar Coche',
    garage: 'Mi Garaje',
    compare: 'Comparar',
    assistant: 'Modo Asistente',
    learn: 'Aprender',
    country: 'País',
    currency: 'Moneda',
    score: 'Puntuación OCHE',
    quality_score: 'Calidad Mecánica',
    deal_score: 'Valor de la Oferta',
    verdict: 'Veredicto',
    asking_price: 'Precio Anunciado',
    mileage: 'Kilometraje',
    transfer_fees: 'Tasas de Cambio de Nombre',
    total_real_cost: 'Coste Real de Entrada',
    target_price: 'Precio Objetivo de Negociación',
    what_to_ask_seller: 'Qué Preguntar al Vendedor',
    mechanic_checklist: 'Qué Revisar con un Mecánico',
    cannot_determine: 'Cosas que no podemos comprobar en fotos',
    good_points: 'Lo Bueno de este Modelo',
    bad_points: 'Lo Malo o Puntos Débiles',
    risks: 'Matriz de Riesgos Identificados',
    possible_repairs: 'Reparaciones y Puesta a Punto',
    why: '¿Por qué?',
    how_much: '¿Cuánto?',
    how_to_check: '¿Cómo lo compruebo?',
    copy: 'Copiar',
    copied: 'Copiado',
    save_to_garage: 'Guardar en Garaje',
    saved: 'Guardado',
    good_deal: 'COMPRA RECOMENDADA',
    caution: 'PRECAUCIÓN / NEGOCIAR',
    avoid: 'ALTO RIESGO / EVITAR',
    step_scanning: 'Procesamiento visual de fotos y ángulos',
    step_identifying: 'Identificación de marca, generación y motor',
    step_analyzing: 'Detección de evidencias y fallos conocidos',
    step_calculating: 'Cálculo de riesgo, costes locales y precio objetivo',
    step_ready: 'Generación de informe técnico final'
  },

  en: {
    app_title: 'OCHE / CARCHECK AI',
    app_subtitle: 'Global Intelligent Used Car Buying Assistant',
    start_analysis: 'Inspect Car',
    garage: 'My Garage',
    compare: 'Compare',
    assistant: 'Assistant Mode',
    learn: 'Learn',
    country: 'Country',
    currency: 'Currency',
    score: 'OCHE Score',
    quality_score: 'Mechanical Quality',
    deal_score: 'Deal Value Score',
    verdict: 'Verdict',
    asking_price: 'Asking Price',
    mileage: 'Mileage',
    transfer_fees: 'Registration & Title Transfer Fees',
    total_real_cost: 'Total Real Starting Cost',
    target_price: 'Target Negotiation Price',
    what_to_ask_seller: 'Questions for the Seller',
    mechanic_checklist: 'Pre-Purchase Mechanic Checklist',
    cannot_determine: 'Items we cannot inspect via photos',
    good_points: 'Known Strengths of this Model',
    bad_points: 'Common Flaws & Weak Points',
    risks: 'Identified Risk Matrix',
    possible_repairs: 'Anticipated Repairs & Servicing',
    why: 'Why?',
    how_much: 'How much?',
    how_to_check: 'How to check?',
    copy: 'Copy',
    copied: 'Copied',
    save_to_garage: 'Save to Garage',
    saved: 'Saved',
    good_deal: 'RECOMMENDED BUY',
    caution: 'CAUTION / NEGOTIATE',
    avoid: 'HIGH RISK / AVOID',
    step_scanning: 'Visual photo processing and angle recognition',
    step_identifying: 'Brand, generation and engine identification',
    step_analyzing: 'Evidence detection and known flaw matching',
    step_calculating: 'Calculating risks, local market costs and target price',
    step_ready: 'Final technical report generation'
  },

  fr: {
    app_title: 'OCHE / CARCHECK AI',
    app_subtitle: 'Assistant Intelligent Mondial pour Achat de Véhicule d’Occasion',
    start_analysis: 'Analyser la Voiture',
    garage: 'Mon Garage',
    compare: 'Comparer',
    assistant: 'Mode Assistant',
    learn: 'Apprendre',
    country: 'Pays',
    currency: 'Devise',
    score: 'Score OCHE',
    quality_score: 'Qualité Mécanique',
    deal_score: 'Valeur de l’Offre',
    verdict: 'Verdict',
    asking_price: 'Prix Affiché',
    mileage: 'Kilométrage',
    transfer_fees: 'Frais de Carte Grise & Mutation',
    total_real_cost: 'Coût Réel d’Entrée',
    target_price: 'Prix Cible de Négociation',
    what_to_ask_seller: 'Questions pour le Vendeur',
    mechanic_checklist: 'Liste de Contrôle Mécanicien',
    cannot_determine: 'Points impossibles à vérifier sur photo',
    good_points: 'Points Forts du Modèle',
    bad_points: 'Points Faibles et Pannes Récurrentes',
    risks: 'Matrice des Risques Identifiés',
    possible_repairs: 'Réparations et Entretien à Prévoir',
    why: 'Pourquoi ?',
    how_much: 'Combien ?',
    how_to_check: 'Comment vérifier ?',
    copy: 'Copier',
    copied: 'Copié',
    save_to_garage: 'Enregistrer dans le Garage',
    saved: 'Enregistré',
    good_deal: 'ACHAT RECOMMANDÉ',
    caution: 'PRUDENCE / NÉGOCIER',
    avoid: 'HAUT RISQUE / ÉVITER',
    step_scanning: 'Traitement visuel des photos et des angles',
    step_identifying: 'Identification marque, génération et moteur',
    step_analyzing: 'Détection des preuves et pannes récurrentes',
    step_calculating: 'Calcul des risques, coûts locaux et prix cible',
    step_ready: 'Génération du rapport technique final'
  },

  de: {
    app_title: 'OCHE / CARCHECK AI',
    app_subtitle: 'Globaler KI-Gebrauchtwagen-Kaufberater',
    start_analysis: 'Fahrzeug Prüfen',
    garage: 'Meine Garage',
    compare: 'Vergleichen',
    assistant: 'Assistenten-Modus',
    learn: 'Wissen',
    country: 'Land',
    currency: 'Währung',
    score: 'OCHE Bewertung',
    quality_score: 'Mechanische Qualität',
    deal_score: 'Angebots-Wertung',
    verdict: 'Urteil',
    asking_price: 'Angebotspreis',
    mileage: 'Kilometerstand',
    transfer_fees: 'Ummelde- & Zulassungsgebühren',
    total_real_cost: 'Tatsächliche Gesamtkosten',
    target_price: 'Ziel-Verhandlungspreis',
    what_to_ask_seller: 'Fragen an den Verkäufer',
    mechanic_checklist: 'Checkliste für die Werkstatt',
    cannot_determine: 'Punkte, die Fotos nicht prüfen können',
    good_points: 'Stärken dieses Modells',
    bad_points: 'Schwachstellen & Bekannte Mängel',
    risks: 'Identifizierte Risikomatrix',
    possible_repairs: 'Voraussichtliche Reparaturen',
    why: 'Warum?',
    how_much: 'Wie viel?',
    how_to_check: 'Wie prüfen?',
    copy: 'Kopieren',
    copied: 'Kopiert',
    save_to_garage: 'In Garage Speichern',
    saved: 'Gespeichert',
    good_deal: 'KAUFEMPFEHLUNG',
    caution: 'VORSICHT / VERHANDELN',
    avoid: 'HOHES RISIKO / MEIDEN',
    step_scanning: 'Visuelle Fotoverarbeitung und Winkelerkennung',
    step_identifying: 'Identifikation von Marke, Generation und Motor',
    step_analyzing: 'Erkennung von Mängeln und Baureihenproblemen',
    step_calculating: 'Berechnung von Risiken, lokalen Kosten und Zielpreis',
    step_ready: 'Erstellung des finalen Prüfberichts'
  },

  ar: {
    app_title: 'أوشي / CARCHECK AI',
    app_subtitle: 'المساعد الذكي العالمي لفحص وشراء السيارات المستعملة',
    start_analysis: 'فحص سيارة',
    garage: 'مرآبي',
    compare: 'مقارنة',
    assistant: 'وضع المساعد',
    learn: 'تعلم',
    country: 'البلد',
    currency: 'العملة',
    score: 'تقييم أوشي',
    quality_score: 'جودة الحالة الميكانيكية',
    deal_score: 'تقييم قيمة الصفقة',
    verdict: 'القرار النهائي',
    asking_price: 'السعر المطلوب',
    mileage: 'المسافة المقطوعة',
    transfer_fees: 'رسوم نقل الملكية والتسجيل',
    total_real_cost: 'التكلفة الإجمالية الحقيقية',
    target_price: 'السعر المستهدف للتفاوض',
    what_to_ask_seller: 'أسئلة موجهة للبائع',
    mechanic_checklist: 'قائمة الفحص لدى الميكانيكي',
    cannot_determine: 'أمور لا يمكن التأكد منها بالصور فقط',
    good_points: 'نقاط القوة في هذا الموديل',
    bad_points: 'العيوب ونقاط الضعف الشائعة',
    risks: 'مصفوفة المخاطر المكتشفة',
    possible_repairs: 'الصيانة والإصلاحات المتوقعة',
    why: 'لماذا؟',
    how_much: 'كم التكلفة؟',
    how_to_check: 'كيف أفحص ذلك؟',
    copy: 'نسخ',
    copied: 'تم النسخ',
    save_to_garage: 'حفظ في المرآب',
    saved: 'تم الحفظ',
    good_deal: 'شراء موصى به',
    caution: 'حذر / تفاوض على السعر',
    avoid: 'مخاطرة عالية / تجنب الشراء',
    step_scanning: 'معالجة الصور والتعرف على الزوايا',
    step_identifying: 'تحديد الشركة والموديل وسنة الصنع والمحرك',
    step_analyzing: 'استخراج الأدلة ومطابقة الأعطال المعروفة',
    step_calculating: 'حساب المخاطر والتكاليف المحلية والسعر المستهدف',
    step_ready: 'إعداد التقرير الفني النهائي'
  },

  it: {
    app_title: 'OCHE / CARCHECK AI',
    app_subtitle: 'Assistente Intelligente Globale per Acquisto Auto Usate',
    start_analysis: 'Analizza Auto',
    garage: 'Il Mio Garage',
    compare: 'Confronta',
    assistant: 'Modalità Assistente',
    learn: 'Impara',
    country: 'Paese',
    currency: 'Valuta',
    score: 'Punteggio OCHE',
    quality_score: 'Qualità Meccanica',
    deal_score: 'Valutazione Offerta',
    verdict: 'Verdetto',
    asking_price: 'Prezzo Richiesto',
    mileage: 'Chilometraggio',
    transfer_fees: 'Passaggio di Proprietà',
    total_real_cost: 'Costo Reale d’Ingresso',
    target_price: 'Prezzo Target di Trattativa',
    what_to_ask_seller: 'Domande per il Venditore',
    mechanic_checklist: 'Checklist per il Meccanico',
    cannot_determine: 'Controlli non verificabili in foto',
    good_points: 'Punti di Forza del Modello',
    bad_points: 'Punti Deboli e Difetti Noti',
    risks: 'Matrice dei Rischi',
    possible_repairs: 'Riparazioni e Tagliandi Previsti',
    why: 'Perché?',
    how_much: 'Quanto costa?',
    how_to_check: 'Come verificare?',
    copy: 'Copia',
    copied: 'Copiato',
    save_to_garage: 'Salva nel Garage',
    saved: 'Salvato',
    good_deal: 'ACQUISTO CONSIGLIATO',
    caution: 'ATTENZIONE / TRATTARE',
    avoid: 'ALTO RISCHIO / EVITARE',
    step_scanning: 'Elaborazione visiva foto e angolazioni',
    step_identifying: 'Identificazione marca, generazione e motore',
    step_analyzing: 'Rilevamento prove e difetti comuni',
    step_calculating: 'Calcolo rischi, costi locali e prezzo target',
    step_ready: 'Generazione rapporto tecnico finale'
  },

  pt: {
    app_title: 'OCHE / CARCHECK AI',
    app_subtitle: 'Assistente Inteligente Global para Compra de Carros Usados',
    start_analysis: 'Analisar Carro',
    garage: 'Minha Garagem',
    compare: 'Comparar',
    assistant: 'Modo Assistente',
    learn: 'Aprender',
    country: 'País',
    currency: 'Moeda',
    score: 'Pontuação OCHE',
    quality_score: 'Qualidade Mecânica',
    deal_score: 'Valor do Negócio',
    verdict: 'Veredito',
    asking_price: 'Preço Anunciado',
    mileage: 'Quilometragem',
    transfer_fees: 'Taxas de Transferência',
    total_real_cost: 'Custo Real de Entrada',
    target_price: 'Preço Alvo de Negociação',
    what_to_ask_seller: 'Perguntas para o Vendedor',
    mechanic_checklist: 'Checklist para o Mecânico',
    cannot_determine: 'Itens não verificáveis por fotos',
    good_points: 'Pontos Fortes deste Modelo',
    bad_points: 'Pontos Fracos e Problemas Conhecidos',
    risks: 'Matriz de Riscos Identificados',
    possible_repairs: 'Reparações e Manutenção Previstas',
    why: 'Por quê?',
    how_much: 'Quanto custa?',
    how_to_check: 'Como verificar?',
    copy: 'Copiar',
    copied: 'Copiado',
    save_to_garage: 'Guardar na Garagem',
    saved: 'Guardado',
    good_deal: 'COMPRA RECOMENDADA',
    caution: 'CUIDADO / NEGOCIAR',
    avoid: 'ALTO RISCO / EVITAR',
    step_scanning: 'Processamento visual de fotos e ângulos',
    step_identifying: 'Identificação de marca, geração e motor',
    step_analyzing: 'Deteção de evidências e falhas comuns',
    step_calculating: 'Cálculo de riscos, custos locais e preço alvo',
    step_ready: 'Geração do relatório técnico final'
  },

  ja: {
    app_title: 'OCHE / CARCHECK AI',
    app_subtitle: '中古車購入のためのグローバルAIインテリジェントアシスタント',
    start_analysis: '車両診断を開始',
    garage: 'ガレージ',
    compare: '比較',
    assistant: 'アシスタントモード',
    learn: '車を学ぶ',
    country: '国',
    currency: '通貨',
    score: 'OCHEスコア',
    quality_score: '車両品質スコア',
    deal_score: 'お買い得度スコア',
    verdict: '診断結果',
    asking_price: '車両本体価格',
    mileage: '走行距離',
    transfer_fees: '名義変更・諸費用',
    total_real_cost: '乗り出し実質総額',
    target_price: '交渉目標価格',
    what_to_ask_seller: '販売店・売主への確認事項',
    mechanic_checklist: '整備士向け事前点検リスト',
    cannot_determine: '写真では確認できない項目',
    good_points: 'この車種の優れた長所',
    bad_points: '注意すべき弱点・既知の不具合',
    risks: '特定されたリスク一覧',
    possible_repairs: '想定される整備・交換部品',
    why: '理由は？',
    how_much: '費用は？',
    how_to_check: '確認方法は？',
    copy: 'コピー',
    copied: 'コピー完了',
    save_to_garage: 'ガレージに保存',
    saved: '保存済み',
    good_deal: 'おすすめ（購入推奨）',
    caution: '注意（価格交渉を推奨）',
    avoid: '高リスク（購入見送り推奨）',
    step_scanning: '写真の画像解析とアングル識別',
    step_identifying: 'メーカー・世代・エンジンの照合',
    step_analyzing: '状態エビデンスおよび定番故障の分析',
    step_calculating: 'リスク・地域整備費用・目標価格の計算',
    step_ready: '総合診断レポートの作成'
  }
};

export class LocalizationService {
  private static activeLanguage: LanguageCode = 'es';

  static getActiveLanguage(): LanguageCode {
    return this.activeLanguage;
  }

  static setActiveLanguage(lang: LanguageCode): void {
    if (TRANSLATIONS[lang]) {
      this.activeLanguage = lang;
    }
  }

  static getTextDirection(lang?: LanguageCode): TextDirection {
    const target = lang || this.activeLanguage;
    return target === 'ar' ? 'rtl' : 'ltr';
  }

  static t(key: TranslationKey, lang?: LanguageCode): string {
    const targetLang = lang || this.activeLanguage;
    const table = TRANSLATIONS[targetLang] || TRANSLATIONS.es;
    return table[key] || TRANSLATIONS.es[key] || key;
  }
}
