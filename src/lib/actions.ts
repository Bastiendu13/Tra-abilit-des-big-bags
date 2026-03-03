'use server';

import { aiSuggestTraceabilityContext, AISuggestTraceabilityContextInput, AISuggestTraceabilityContextOutput } from '@/ai/flows/ai-suggest-traceability-context-flow';

export async function getTraceabilityContext(
  qrCodeData: string
): Promise<AISuggestTraceabilityContextOutput> {
  try {
    const input: AISuggestTraceabilityContextInput = { qrCodeData };
    const result = await aiSuggestTraceabilityContext(input);
    return result;
  } catch (error) {
    console.error("Error getting traceability context:", error);
    throw new Error("L'analyse des données du code QR par l'IA a échoué.");
  }
}
