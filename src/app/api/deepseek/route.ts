// =============================================================================
// DeepSeek API Proxy — keeps API key server-side
// POST /api/deepseek  { systemPrompt, userPrompt }
// =============================================================================

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "DEEPSEEK_API_KEY not configured on server" },
      { status: 500 }
    );
  }

  try {
    const { systemPrompt, userPrompt } = await request.json();

    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      return Response.json(
        { error: `DeepSeek API error: ${res.status}` },
        { status: res.status }
      );
    }

    const json = await res.json();
    const text = json.choices?.[0]?.message?.content?.trim() || "";

    return Response.json({ result: text });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
