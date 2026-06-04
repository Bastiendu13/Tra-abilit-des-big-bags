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
      "Les données brutes extraites d'un code QR scanné. Ces données seront analysées par l'IA pour fournir un contexte."
    ),
});
export type AISuggestTraceabilityContextInput = z.infer<
  typeof AISuggestTraceabilityContextInputSchema
>;

const AISuggestTraceabilityContextOutputSchema = z.object({
  productCategories: z
    .array(z.string())
    .describe('Catégories de produits suggérées en fonction des données du code QR.'),
  originInformation: z
    .array(z.string())
    .describe("Informations relatives à l'origine du produit ou des données."),
  nextSteps: z
    .array(z.string())
    .describe(
      'Étapes suivantes possibles dans le processus de traçabilité ou actions à entreprendre.'
    ),
  summary: z
    .string()
    .describe(
      "Un résumé concis du contexte de traçabilité fourni par l'IA."
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
  prompt: `Vous êtes un expert en traçabilité de la chaîne d'approvisionnement et en analyse de données.
Votre tâche est d'analyser les données du code QR fournies et d'en extraire le contexte de traçabilité pertinent.

Les données sont au format "clé=valeur" séparées par des points-virgules. Les clés possibles incluent FAB (fabricant), SLM (type de produit), DATE, et LOT.

En fonction des données du code QR, suggérez :
1.  Des catégories de produits pertinentes (par exemple, "Produit industriel", "Matériau réfractaire").
2.  Des informations sur l'origine (utilisez la valeur de FAB comme fabricant).
3.  Les prochaines étapes possibles dans le processus de traçabilité (par exemple, "Stocker le produit", "Vérifier la fiche de sécurité").
4.  Un résumé concis du contexte global de traçabilité, en incluant le type de produit (SLM) et le fabricant (FAB).

Si certaines informations ne peuvent pas être déduites, retournez un tableau vide ou une chaîne de caractères vide pour le champ correspondant, mais assurez-vous que la sortie est toujours un JSON valide respectant le schéma.

Assurez-vous que votre sortie est structurée précisément selon le schéma JSON fourni.

Données du code QR : {{{qrCodeData}}}`,
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
