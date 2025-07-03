// This is an AI-powered tool suggesting optimal pricing based on current sales, ingredient costs, and competitor prices to maximize profits.
'use server';
/**
 * @fileOverview AI-powered tool suggesting optimal pricing.
 *
 * - suggestOptimalPricing - A function that suggests optimal pricing for drinks.
 * - SuggestOptimalPricingInput - The input type for the suggestOptimalPricing function.
 * - SuggestOptimalPricingOutput - The return type for the suggestOptimalPricing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalPricingInputSchema = z.object({
  drinkName: z.string().describe('The name of the drink.'),
  salesData: z.string().describe('Sales data for the drink, including quantity sold and revenue.'),
  ingredientCosts: z.string().describe('Ingredient costs for the drink.'),
  competitorPrices: z.string().describe('Competitor prices for the same drink.'),
});
export type SuggestOptimalPricingInput = z.infer<typeof SuggestOptimalPricingInputSchema>;

const SuggestOptimalPricingOutputSchema = z.object({
  suggestedPrice: z.number().describe('The suggested optimal price for the drink.'),
  reasoning: z.string().describe('The reasoning behind the suggested price.'),
});
export type SuggestOptimalPricingOutput = z.infer<typeof SuggestOptimalPricingOutputSchema>;

export async function suggestOptimalPricing(input: SuggestOptimalPricingInput): Promise<SuggestOptimalPricingOutput> {
  return suggestOptimalPricingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalPricingPrompt',
  input: {schema: SuggestOptimalPricingInputSchema},
  output: {schema: SuggestOptimalPricingOutputSchema},
  prompt: `You are an expert pricing strategist for beverages. Analyze the following data to suggest an optimal price for the drink {{drinkName}}.

Sales Data: {{salesData}}
Ingredient Costs: {{ingredientCosts}}
Competitor Prices: {{competitorPrices}}

Based on this data, what is the optimal price to maximize profits? Provide a brief reasoning for your suggestion.`,
});

const suggestOptimalPricingFlow = ai.defineFlow(
  {
    name: 'suggestOptimalPricingFlow',
    inputSchema: SuggestOptimalPricingInputSchema,
    outputSchema: SuggestOptimalPricingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
