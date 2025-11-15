import { GoogleGenAI, Type } from "@google/genai";
import type { Scenario, Message, AIResponseData, EllenGWhiteQuote } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        response: {
            type: Type.STRING,
            description: "A compassionate, conversational response to the user's query, acting as an SDA Chaplaincy assistant. This should directly address their situation and offer pastoral support."
        },
        scripture: {
            type: Type.ARRAY,
            description: "A list of 2-3 relevant Bible verses that apply to the user's situation.",
            items: {
                type: Type.OBJECT,
                properties: {
                    reference: { type: Type.STRING, description: "The Bible book, chapter, and verse (e.g., John 3:16)." },
                    text: { type: Type.STRING, description: "The full text of the Bible verse." },
                },
                required: ["reference", "text"],
            }
        },
        ellenGWhiteQuote: {
            type: Type.ARRAY,
            description: "A list of 1-2 relevant quotes from Ellen G. White's writings.",
            items: {
                type: Type.OBJECT,
                properties: {
                    source: { type: Type.STRING, description: "The source of the quote (e.g., Steps to Christ, p. 48)." },
                    text: { type: Type.STRING, description: "The full text of the quote." },
                },
                required: ["source", "text"],
            }
        },
        practicalSteps: {
            type: Type.ARRAY,
            description: "A short, bulleted list of 2-4 practical, actionable steps the user can take.",
            items: {
                type: Type.STRING,
            }
        },
        additionalResources: {
            type: Type.ARRAY,
            description: "A list of 1-2 additional resources, such as relevant articles, books, or ministries within the SDA church.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the resource." },
                    description: { type: Type.STRING, description: "A brief description of what the resource offers." },
                },
                required: ["title", "description"],
            }
        }
    },
    required: ["response", "scripture", "ellenGWhiteQuote", "practicalSteps", "additionalResources"],
};

export async function getChaplaincyResponse(scenario: Scenario, messages: Message[]): Promise<AIResponseData> {
  const systemInstruction = `You are a highly knowledgeable and compassionate AI assistant for Seventh-Day Adventist (SDA) chaplains. Your purpose is to provide resources and preliminary guidance based on a robust SDA theological and pastoral framework.

  **Core Principles:**
  1.  **SDA Theology:** Your guidance must be firmly rooted in SDA beliefs, including the Sabbath, the Sanctuary Doctrine, the State of the Dead, and the Health Message.
  2.  **Biblical Foundation:** All counsel must be Scripture-based. Always prioritize the Bible.
  3.  **Spirit of Prophecy:** Integrate principles and quotes from Ellen G. White's writings, treating them as an inspired commentary on the Bible.
  4.  **Holistic Ministry (SDA Framework):** Address the whole person:
      - **Spiritual:** Prayer, Bible study, connection with God.
      - **Physical:** Principles of healthful living (plant-based diet, exercise, rest).
      - **Mental:** Support for anxiety/depression with a focus on faith and trust in God.
      - **Social:** Community, healthy relationships, reconciliation.
  5.  **Compassionate Tone:** Maintain a warm, empathetic, and non-judgmental tone.
  6.  **Ethical Boundaries:** Always clarify that you are an AI assistant and not a substitute for a human chaplain, pastor, or licensed therapist. Encourage users to seek human connection and professional help. Never perform sacramental duties.

  **Current Scenario:** The user has selected the "${scenario.title}" scenario, which focuses on: "${scenario.description}". Tailor your response specifically to this context.

  Analyze the user's query and provide a structured response in JSON format.
  `;

  // We only need the last few messages for context to keep the prompt concise
  const conversationHistory = messages.slice(-6).map(msg => `${msg.role}: ${msg.content}`).join('\n');
  const userPrompt = `
  Conversation History:
  ${conversationHistory}
  ---
  Based on the latest user message, provide a structured response for the "${scenario.title}" scenario.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AIResponseData;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("The AI model failed to generate a valid response.");
  }
}

const egwSearchResponseSchema = {
    type: Type.ARRAY,
    description: "A list of up to 5 relevant quotes from Ellen G. White's writings based on the search query.",
    items: {
        type: Type.OBJECT,
        properties: {
            source: { type: Type.STRING, description: "The source of the quote (e.g., Steps to Christ, p. 48)." },
            text: { type: Type.STRING, description: "The full text of the quote." },
        },
        required: ["source", "text"],
    }
};

export async function searchEllenGWhiteWritings(query: string): Promise<EllenGWhiteQuote[]> {
  const systemInstruction = `You are an expert search assistant specializing in the complete published writings of Ellen G. White. Your sole purpose is to locate and return highly relevant quotes based on a user's search query.

  **Instructions:**
  1.  **Analyze the Query:** Deeply understand the user's query to identify key themes, concepts, and keywords.
  2.  **Search Writings:** Search the entire corpus of Ellen G. White's writings for passages that directly address the query.
  3.  **Prioritize Relevance:** Select the most relevant and insightful quotes. Aim for 3-5 high-quality results.
  4.  **Format Output:** Return the results STRICTLY in the specified JSON format. Do not include any conversational text, introductions, or apologies. The output must be a valid JSON array.`;

  const userPrompt = `Search query: "${query}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: egwSearchResponseSchema,
        temperature: 0.3, // Lower temperature for more focused, factual results
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as EllenGWhiteQuote[];

  } catch (error) {
    console.error("Error calling Gemini API for EGW search:", error);
    throw new Error("The AI model failed to generate a valid response for the search.");
  }
}