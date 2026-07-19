async function test() {
  const nemotronKey = "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";
  const messages = [
    { role: 'system', content: 'Generate complete SEO and GEO content for this page. Return ONLY valid JSON with no markdown code fences.' },
    { role: 'user', content: 'Page title: The Death of Broadcasting' }
  ];

  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${nemotronKey}`
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3-nano-30b-a3b",
      messages: messages,
      temperature: 1,
      top_p: 1,
      max_tokens: 4000,
      reasoning_budget: 1000,
      response_format: { type: "json_object" }
    })
  });

  const data = await response.json();
  console.log("Raw Response with response_format:", JSON.stringify(data, null, 2));
}

test();
