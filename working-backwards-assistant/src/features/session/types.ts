import { Session } from '../../types';

export interface SessionState {
  currentSession: Session;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface UpdateWorkingBackwardsResponsePayload {
  field: keyof Session['workingBackwardsResponses'];
  value: string;
}

export interface UpdatePRFAQPressReleasePayload {
  field: keyof Session['prfaq']['pressRelease'];
  value: string;
}

export interface UpdateFAQPayload {
  index: number;
  question?: string;
  answer?: string;
}

export interface UpdateAssumptionPayload {
  id: string;
  updates: Partial<Session['assumptions'][0]>;
}

export interface UpdateExperimentPayload {
  id: string;
  updates: Partial<Session['experiments'][0]>;
} 