"use server";

import { suggestOptimalPricing, SuggestOptimalPricingInput, SuggestOptimalPricingOutput } from "@/ai/flows/suggest-optimal-pricing";

interface ActionResult {
  success: boolean;
  data?: SuggestOptimalPricingOutput;
  error?: string;
}

export async function getPricingSuggestion(
  input: SuggestOptimalPricingInput
): Promise<ActionResult> {
  try {
    const result = await suggestOptimalPricing(input);
    return { success: true, data: result };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message || "An unexpected error occurred." };
  }
}
