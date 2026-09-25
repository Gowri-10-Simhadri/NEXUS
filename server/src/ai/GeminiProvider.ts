import { GoogleGenerativeAI } from '@google/generative-ai';

// Ranked list of active high-performance Gemini models with automated fallback
const GEMINI_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-latest',
];

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class GeminiProvider {
  private static getClient(): GoogleGenerativeAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in backend environment.');
    }
    return new GoogleGenerativeAI(apiKey);
  }

  /**
   * Generates a conversational AI response using Gemini with multi-turn history and optional context
   */
  static async generateChatResponse(
    messages: ChatMessage[],
    systemContext?: string
  ): Promise<string> {
    const client = this.getClient();
    let lastError: Error | null = null;

    // Filter and format conversation history for Gemini API
    const formattedHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Separate the latest user message from historical context
    const conversationMessages = messages.filter((m) => m.role !== 'system');
    const latestMessage = conversationMessages[conversationMessages.length - 1];
    const priorMessages = conversationMessages.slice(0, -1);

    // Append prior messages (keep last 10 turns for token efficiency)
    for (const msg of priorMessages.slice(-10)) {
      formattedHistory.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    const systemPrompt = `You are NEXUS, an advanced, highly intelligent, and helpful AI assistant.
You provide accurate, well-structured, comprehensive, and insightful responses across software engineering, computer science, mathematics, science, writing, problem-solving, and general inquiries.
Always format your answers with clean GitHub-flavored Markdown, including clear headings, bullet lists, and syntax-highlighted code blocks where appropriate.
${systemContext ? `\n\n[USER WORKSPACE CONTEXT]\n${systemContext}` : ''}`;

    for (const modelName of GEMINI_MODELS) {
      try {
        const model = client.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
        });

        // Use startChat with formatted history
        const chat = model.startChat({
          history: formattedHistory,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2500,
          },
        });

        const result = await chat.sendMessage(latestMessage.content);
        const response = await result.response;
        const text = response.text();

        if (text && text.trim().length > 0) {
          return text.trim();
        }
      } catch (err: any) {
        lastError = err;
        const isTransient =
          err.status === 503 ||
          err.status === 429 ||
          err.status === 404 ||
          err.message?.includes('503') ||
          err.message?.includes('high demand') ||
          err.message?.includes('Resource has been exhausted') ||
          err.message?.includes('not found');

        if (isTransient) {
          console.warn(`[GeminiProvider] Model ${modelName} returned transient error: ${err.message}. Retrying with next model.`);
          continue;
        }

        // Non-transient errors (like invalid key) throw immediately
        throw new Error(`Gemini API error: ${err.message || 'Unknown upstream failure'}`);
      }
    }

    throw new Error(
      `Gemini service temporarily unavailable across models. Root error: ${lastError?.message || 'High demand spike'}`
    );
  }
}
