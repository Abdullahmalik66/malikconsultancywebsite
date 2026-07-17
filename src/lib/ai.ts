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
 * Uses NVIDIA's DeepSeek-V4-Pro API with a clean, unified interface.
 */
export async function getAICompletion(
  prompt: string,
  options: AICompletionOptions = {}
): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY || "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";
  const baseUrl = "https://integrate.api.nvidia.com/v1";
  const model = "deepseek-ai/deepseek-v4-pro";

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
        response_format: options.jsonMode ? { type: "json_object" } : undefined,
        chat_template_kwargs: {
          thinking: false
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NVIDIA API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from model choice selection.");
    }
    
    return content;
  } catch (error) {
    console.error("Error in AI Service Client:", error);
    throw error;
  }
}
