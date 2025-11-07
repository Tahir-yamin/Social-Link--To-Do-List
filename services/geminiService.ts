

import { GoogleGenAI } from "@google/genai";
import { Link } from "../types";

type LinkMetadata = Omit<Link, 'id' | 'status' | 'createdAt' | 'url'>;


// Regular expression to find a JSON object within a string, potentially wrapped in markdown backticks
const jsonRegex = /```json\n([\s\S]*?)\n```|({[\s\S]*})/;


export const fetchLinkMetadata = async (url: string): Promise<LinkMetadata> => {
  if (!process.env.API_KEY) {
    return {
      title: "Feature Unavailable in Live Demo",
      summary: "This feature, which uses AI to automatically summarize and categorize links, is disabled in the live demo because it requires a secret API key.",
      category: "Demo",
      sources: [],
    };
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const prompt = `Based on the content of the URL provided, generate a concise title, a one-sentence summary, and a single, relevant category (e.g., Technology, News, Productivity, Lifestyle, Programming).
URL: ${url}
Respond with ONLY a valid JSON object in the following format: {"title": "...", "summary": "...", "category": "..."}. Do not include any other text, just the JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const jsonMatch = response.text.match(jsonRegex);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from Gemini response.");
    }
    const jsonText = jsonMatch[1] || jsonMatch[2];
    const metadata: Omit<LinkMetadata, 'sources'> = JSON.parse(jsonText);
    
    if (!metadata.title || !metadata.summary || !metadata.category) {
        throw new Error("Invalid metadata format received from API.");
    }
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources = groundingChunks
      .map(chunk => chunk.web && chunk.web.uri && chunk.web.title ? { uri: chunk.web.uri, title: chunk.web.title } : null)
      .filter((source): source is { uri: string; title: string; } => source !== null);

    return { ...metadata, sources };
  } catch (error) {
    console.error("Error fetching link metadata from Gemini API:", error);
    // Fallback in case of API error
    return {
      title: "Unable to Access Document Content",
      summary: `Could not fetch a summary for ${url}. The content might be inaccessible or require a login.`,
      category: "Error",
      sources: [],
    };
  }
};


export const fetchDeepAnalysis = async (url: string): Promise<string> => {
    if (!process.env.API_KEY) {
        return `
### Feature Unavailable in Live Demo

**Deep analysis is an AI-powered feature that is disabled on this live demo site.**

This feature requires a secret API key to connect to the generative AI service. For security reasons, this key cannot be exposed in a public application. To use this feature, please run the application in a local development environment with your own API key.
`;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const prompt = `Provide a detailed, in-depth analysis of the content at this URL: ${url}. Break down the key arguments, identify the main takeaways, and explain any complex concepts simply. Format your response using markdown for readability.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });

        return response.text;
    } catch(error) {
        console.error("Error fetching deep analysis:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `An error occurred during deep analysis: ${errorMessage}`;
    }
};