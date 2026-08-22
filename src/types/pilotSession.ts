export interface PilotUserFeedback {
  easeOfUseRating: number; // 1-5
  understandChecksRating: number; // 1-5
  confidenceRating: number; // 1-5
  wouldUseAgain: 'YES' | 'MAYBE' | 'NO';
  whatConfusedUser?: string;
  whatWasMostUseful?: string;
  mostUsefulFeature?: 'found_problem' | 'explained_problem' | 'helped_negotiate' | 'gave_confidence' | 'saved_time' | 'helped_decide' | 'nothing';
  trustScore?: number; // 1-5
  trustReason?: string;
  submittedAt: string;
}

export interface PilotTesterObservation {
  userHesitated?: boolean;
  hesitationPoints?: string[];
  userMisunderstoodInstruction?: boolean;
  misunderstoodDetails?: string[];
  userNeededHelp?: boolean;
  userQuestionedResult?: boolean;
  userDisagreedWithAI?: boolean;
  disagreementReason?: string;
  notes?: string;
  recordedAt: string;
}

export interface PilotInspectionStepRecord {
  missionId: string;
  missionTitle: string;
  photoAccepted: boolean;
  retryCount: number;
  durationMs: number;
  status: 'COMPLETED' | 'SKIPPED' | 'FAILED';
}

export interface PilotOutcomeFollowup {
  didBuyCar: 'YES' | 'NO' | 'DECIDING';
  wasRecommendationUseful?: boolean;
  reasonNotBought?: string;
  actualNegotiatedPrice?: number;
  actualGarageCostReported?: number;
  majorUnforeseenRepairDiscovered?: string;
  updatedAt: string;
}

export interface RealPilotSession {
  sessionId: string;
  timestamp: string;
  isRealWorldSession: boolean; // Flag distinguishing real world vs simulated
  vehicle: {
    brand: string;
    model: string;
    generation?: string;
    year?: number;
    engine?: string;
    fuel?: string;
    transmission?: string;
    mileage?: number;
    askingPrice?: number;
    isConfirmedByHuman: boolean;
  };
  inspectionMetrics: {
    durationSeconds: number;
    timeToFirstUsefulFindingSeconds?: number;
    timeToFinalDecisionSeconds?: number;
    totalPhotosTaken: number;
    photoRetries: number;
    completedSteps: number;
    skippedSteps: number;
    abandonmentStage?: 'none' | 'identification' | 'camera' | 'seller_data' | 'loading' | 'result';
  };
  immutableResultSnapshot?: {
    score: number;
    confidence: number;
    verdict: 'COMPRAR' | 'NEGOCIAR' | 'EVITAR';
    realCostCalculated: number;
    negotiationTargetPrice: number;
    topRisksIdentified: string[];
    hasProfessionalEscalation: boolean;
  };
  stepRecords: PilotInspectionStepRecord[];
  userFeedback?: PilotUserFeedback;
  testerObservation?: PilotTesterObservation;
  outcomeFollowup?: PilotOutcomeFollowup;
  completionStatus: 'COMPLETED' | 'ABANDONED' | 'IN_PROGRESS';
}
