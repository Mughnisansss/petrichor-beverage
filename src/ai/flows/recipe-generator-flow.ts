'use server';
/**
 * @fileOverview An AI recipe assistant that generates new menu ideas.
 *
 * - generateRecipe - A function that handles the recipe generation process.
 * - GenerateRecipeInput - The input type for the generateRecipe function.
 * - GenerateRecipeOutput - The return type for the generateRecipe function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the schema for the raw materials we'll pass to the prompt
const RawMaterialSchema = z.object({
  name: z.string(),
  unit: z.string(),
});

// Define the input schema for our flow
const GenerateRecipeInputSchema = z.object({
  prompt: z.string().describe('The user\'s creative idea or prompt for the recipe.'),
  rawMaterials: z.array(RawMaterialSchema).describe('A list of available raw materials to prioritize.'),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

// Define the output schema for the generated recipe
const GenerateRecipeOutputSchema = z.object({
  name: z.string().describe('A catchy and appropriate name for the new recipe.'),
  description: z.string().describe('A short, appealing description suitable for a menu.'),
  ingredients: z.array(z.object({
    name: z.string().describe('The name of the ingredient.'),
    quantity: z.number().describe('The quantity of the ingredient.'),
    unit: z.string().describe('The unit for the quantity (e.g., gram, ml, pcs).')
  })).describe('A list of ingredients required for the recipe.'),
  instructions: z.string().describe('Step-by-step instructions on how to prepare the recipe.'),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

// Exported wrapper function that calls the Genkit flow
export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return recipeGeneratorFlow(input);
}

// Define the prompt for the AI model
const recipePrompt = ai.definePrompt({
  name: 'recipeGeneratorPrompt',
  input: { schema: GenerateRecipeInputSchema },
  output: { schema: GenerateRecipeOutputSchema },
  prompt: `You are a world-class barista and chef with a knack for creating innovative and delicious menu items for a cafe. A user wants a new recipe based on their idea.

User's Idea: {{{prompt}}}

Your task is to generate a complete, creative, and practical recipe.

Instructions:
1.  Invent a creative and marketable name for the recipe.
2.  Write a short, enticing description for the menu.
3.  Create a list of ingredients with quantities and units. **You MUST prioritize using the following available raw materials.** You can include other common ingredients if necessary, but the core of the recipe should come from this list:
{{#each rawMaterials}}
- {{this.name}} (unit: {{this.unit}})
{{/each}}
4.  Provide clear, step-by-step instructions for preparation.
5.  Ensure your entire response strictly adheres to the requested JSON output format.
`,
});

// Define the Genkit flow
const recipeGeneratorFlow = ai.defineFlow(
  {
    name: 'recipeGeneratorFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async (input) => {
    const { output } = await recipePrompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a recipe. Please try again with a different prompt.');
    }
    return output;
  }
);
