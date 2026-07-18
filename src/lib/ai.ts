import dotenv from 'dotenv';
dotenv.config();

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AICompletionOptions {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  systemPrompt?: string;
  jsonMode?: boolean;
}

/**
 * Centered AI Client Service for Malik Consultancy.
 * Uses Google Gemini 3.5 Flash as the primary provider, with a fallback to Nvidia.
 */
export async function getAICompletion(
  prompt: string,
  options: AICompletionOptions = {}
): Promise<string> {
  // 1. Try Gemini 3.5 Flash first
  const geminiApiKey = process.env.GEMINI_API_KEY || "AIzaSyB79bjmzf5Ux7-pecrYogz9e7WLz1lMGxM";
  if (geminiApiKey) {
    try {
      console.log("[AI Service] Attempting completion via Google Gemini 3.5 Flash...");
      const fullTextPrompt = options.systemPrompt 
        ? `${options.systemPrompt}\n\nUser request:\n${prompt}` 
        : prompt;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: fullTextPrompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: options.temperature ?? 1,
              responseMimeType: options.jsonMode ? "application/json" : "text/plain"
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) {
          console.log("[AI Service] Gemini 3.5 Flash content generation successful.");
          return content;
        }
      } else {
        const errText = await response.text();
        console.warn(`[AI Service] Gemini API failed with status ${response.status}:`, errText);
      }
    } catch (geminiError) {
      console.error("[AI Service] Gemini invocation failed, trying Nvidia fallback:", geminiError);
    }
  }

  // 2. Fallback to Nvidia
  console.log("[AI Service] Attempting fallback completion via NVIDIA API...");
  const apiKey = process.env.NVIDIA_API_KEY || "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";
  const baseUrl = "https://integrate.api.nvidia.com/v1";
  const model = "meta/llama-3.3-70b-instruct";

  const messages: ChatMessage[] = [];
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: options.temperature ?? 1,
        top_p: options.top_p ?? 0.95,
        max_tokens: options.max_tokens ?? 4000,
        response_format: options.jsonMode ? { type: "json_object" } : undefined
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NVIDIA API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from NVIDIA model choice selection.");
    }
    
    console.log("[AI Service] NVIDIA fallback generation successful.");
    return content;
  } catch (error) {
    console.error("[AI Service] Error in NVIDIA Service Client:", error);
    throw error;
  }
}
