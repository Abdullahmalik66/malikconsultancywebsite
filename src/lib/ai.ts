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
 * Fetch wrapper with built-in retry and exponential backoff.
 * Especially helpful for absorbing 429 rate limit spikes.
 */
async function fetchWithRetry(url: string, init: RequestInit, maxRetries = 3): Promise<Response> {
  let delay = 2000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url, init);
      if (res.status === 429) {
        console.warn(`[AI Service] Hit 429 Rate Limit. Retrying in ${delay}ms (attempt ${i + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      return res;
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      console.warn(`[AI Service] Network error: ${e}. Retrying in ${delay}ms (attempt ${i + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  return fetch(url, init);
}

/**
 * Centered AI Client Service for Malik Consultancy.
 * Sequence:
 * 1. nemotron-3-nano-30b-a3b (via new NVIDIA API key)
 * 2. llama-3.3-70b-instruct (fallback via standard NVIDIA API key)
 * 3. gemini-3.1-flash-lite (final fallback via Google Gemini API key)
 */
export async function getAICompletion(
  prompt: string,
  options: AICompletionOptions = {}
): Promise<string> {
  
  // ─── 1. NEMOTRON (NVIDIA API) ──────────────────────────────────────────────
  const nemotronKey = process.env.NVIDIA_NEMOTRON_API_KEY || "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";
  if (nemotronKey) {
    try {
      console.log("[AI Service] Step 1: Attempting content generation via NVIDIA Nemotron (nemotron-3-nano-30b-a3b)...");
      const messages: ChatMessage[] = [];
      if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await fetchWithRetry("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${nemotronKey}`
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3-nano-30b-a3b",
          messages: messages,
          temperature: options.temperature ?? 1,
          top_p: options.top_p ?? 1,
          max_tokens: options.max_tokens ?? 16384,
          response_format: options.jsonMode ? { type: "json_object" } : undefined,
          reasoning_budget: 16384
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          console.log("[AI Service] Nemotron generation successful.");
          return content;
        }
      } else {
        const errText = await response.text();
        console.warn(`[AI Service] Nemotron failed with status ${response.status}:`, errText);
      }
    } catch (nemotronError) {
      console.error("[AI Service] Nemotron failed, passing to Llama fallback:", nemotronError);
    }
  }

  // ─── 2. LLAMA fallback (NVIDIA API) ─────────────────────────────────────────
  const llamaKey = process.env.NVIDIA_API_KEY || "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";
  if (llamaKey) {
    try {
      console.log("[AI Service] Step 2: Attempting fallback content generation via NVIDIA Llama (llama-3.3-70b-instruct)...");
      const messages: ChatMessage[] = [];
      if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await fetchWithRetry("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${llamaKey}`
        },
        body: JSON.stringify({
          model: "meta/llama-3.3-70b-instruct",
          messages: messages,
          temperature: options.temperature ?? 1,
          top_p: options.top_p ?? 0.95,
          max_tokens: options.max_tokens ?? 4000,
          response_format: options.jsonMode ? { type: "json_object" } : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          console.log("[AI Service] Llama fallback generation successful.");
          return content;
        }
      } else {
        const errText = await response.text();
        console.warn(`[AI Service] Llama failed with status ${response.status}:`, errText);
      }
    } catch (llamaError) {
      console.error("[AI Service] Llama failed, passing to Gemini fallback:", llamaError);
    }
  }

  // ─── 3. GEMINI fallback (Google Gemini API) ───────────────────────────────
  const geminiApiKey = process.env.GEMINI_API_KEY || "AIzaSyB79bjmzf5Ux7-pecrYogz9e7WLz1lMGxM";
  if (geminiApiKey) {
    try {
      console.log("[AI Service] Step 3: Attempting fallback content generation via Google Gemini (gemini-3.1-flash-lite)...");
      const fullTextPrompt = options.systemPrompt 
        ? `${options.systemPrompt}\n\nUser request:\n${prompt}` 
        : prompt;

      const response = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${geminiApiKey}`,
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
          console.log("[AI Service] Gemini fallback generation successful.");
          return content;
        }
      } else {
        const errText = await response.text();
        console.warn(`[AI Service] Gemini failed with status ${response.status}:`, errText);
      }
    } catch (geminiError) {
      console.error("[AI Service] Gemini fallback invocation failed:", geminiError);
    }
  }

  throw new Error("AI Completion Service: All provider models in the generation sequence failed.");
}
