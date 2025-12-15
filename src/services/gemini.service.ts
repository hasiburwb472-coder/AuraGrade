
import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // IMPORTANT: The API key is sourced from environment variables.
    // Do not hardcode or expose it in the frontend.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY environment variable not set.");
      throw new Error("API_KEY environment variable not set.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateCssFilters(prompt: string): Promise<string> {
    if (!prompt) {
      throw new Error('Prompt cannot be empty');
    }

    const model = 'gemini-2.5-flash';

    const systemInstruction = `You are an expert in CSS filters for video color grading. 
    Based on the user's description, generate a single string of CSS filter functions that can be applied to a video element.
    
    RULES:
    - ONLY respond with the CSS filter functions.
    - Do not include 'filter:', ';', or any other CSS properties or explanations.
    - The output must be a single line of text.
    - Valid functions are: brightness(), contrast(), saturate(), sepia(), hue-rotate(), invert(), blur().
    - Example valid response: 'saturate(1.8) contrast(1.2) hue-rotate(15deg)'
    - Example invalid response: 'Sure, here is your filter: filter: saturate(1.8);'`;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });
      
      const text = response.text.trim();
      
      // Basic validation to ensure it looks like a CSS filter string
      if (text && (text.includes('(') && text.includes(')'))) {
        return text;
      } else {
        throw new Error('Invalid filter format received from AI.');
      }

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to generate CSS filters from AI.');
    }
  }
}
