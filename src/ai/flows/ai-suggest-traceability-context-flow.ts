'use server';
/**
 * @fileOverview An AI agent that analyzes QR code data to suggest traceability context.
 *
 * - aiSuggestTraceabilityContext - A function that handles the AI analysis of QR code data.
 * - AISuggestTraceabilityContextInput - The input type for the aiSuggestTraceabilityContext function.
 * - AISuggestTraceabilityContextOutput - The return type for the aiSuggestTraceabilityContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISuggestTraceabilityContextInputSchema = z.object({
  qrCodeData: z
    .string()
    .describe(
      'The raw data extracted from a scanned QR code. This data will be analyzed by the AI to provide context.'
    ),
});
export type AISuggestTraceabilityContextInput = z.infer<
  typeof AISuggestTraceabilityContextInputSchema
>;

const AISuggestTraceabilityContextOutputSchema = z.object({
  productCategories: z
    .array(z.string())
    .describe('Suggested product categories based on the QR code data.'),
  originInformation: z
    .array(z.string())
    .describe('Information related to the origin of the product or data.'),
  nextSteps: z
    .array(z.string())
    .describe(
      'Possible next steps in the traceability process or actions to take.'
    ),
  summary: z
    .string()
    .describe(
      'A concise summary of the traceability context provided by the AI.'
    ),
});
export type AISuggestTraceabilityContextOutput = z.infer<
  typeof AISuggestTraceabilityContextOutputSchema
>;

export async function aiSuggestTraceabilityContext(
  input: AISuggestTraceabilityContextInput
): Promise<AISuggestTraceabilityContextOutput> {
  return aiSuggestTraceabilityContextFlow(input);
}

const traceabilityPrompt = ai.definePrompt({
  name: 'traceabilityPrompt',
  input: {schema: AISuggestTraceabilityContextInputSchema},
  output: {schema: AISuggestTraceabilityContextOutputSchema},
  prompt: `You are an expert in supply chain traceability and data analysis.
Your task is to analyze the provided QR code data and extract relevant traceability context.

Based on the QR code data, suggest:
1.  Pertinent product categories.
2.  Information about the origin (e.g., country, region, manufacturer, supplier).
3.  Possible next steps in the traceability process or actions the user might take with this item.
4.  A concise summary of the overall traceability context.

Ensure your output is structured precisely according to the JSON schema provided.

QR Code Data: {{{qrCodeData}}}`,
});

const aiSuggestTraceabilityContextFlow = ai.defineFlow(
  {
    name: 'aiSuggestTraceabilityContextFlow',
    inputSchema: AISuggestTraceabilityContextInputSchema,
    outputSchema: AISuggestTraceabilityContextOutputSchema,
  },
  async input => {
    const {output} = await traceabilityPrompt(input);
    if (!output) {
      throw new Error('Failed to get traceability context from AI.');
    }
    return output;
  }
);
