import type { AISuggestTraceabilityContextOutput } from '@/ai/flows/ai-suggest-traceability-context-flow';

export type Scan = {
  id: string;
  qrData: string;
  timestamp: number;
  Slm: string;
  tremie: string;
  aiContext?: AISuggestTraceabilityContextOutput;
};
