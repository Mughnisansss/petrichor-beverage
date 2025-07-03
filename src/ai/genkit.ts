'use server';

import { genkit } from 'genkit';
import { googleAI } from 'genkit/plugins/googleai';

// Initialize the Genkit AI platform with the Google AI plugin.
// The API key is read from the GOOGLE_API_KEY environment variable.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY,
    }),
  ],
});
