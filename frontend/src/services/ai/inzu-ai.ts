export type AiMessage = { role: "user" | "model"; text: string };

export type PropertyContext = {
  title: string;
  location: string;
  priceRwf: string;
  bedrooms: number;
  verified: boolean;
};

const knownProperties: PropertyContext[] = [
  { title: "Light-filled apartment in Kacyiru",  location: "Kacyiru, Kigali",    priceRwf: "420,000", bedrooms: 2, verified: true },
  { title: "Quiet family home near town",         location: "Kimihurura, Kigali", priceRwf: "650,000", bedrooms: 3, verified: true },
  { title: "Modern home with a private garden",   location: "Kicukiro, Kigali",   priceRwf: "550,000", bedrooms: 3, verified: true },
];

export async function askUmutungoAi(messages: AiMessage[]) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      ok: false as const,
      error: "AI is not configured yet. Add GROQ_API_KEY on the server to enable the concierge.",
    };
  }

  // Use GROQ_MODEL env var; fall back to the model confirmed working on this account
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

  const system = `You are Umutungo AI, a helpful Rwanda property concierge.
Use only the property context below and the user's conversation.
Never invent prices, availability, reviews, verification, identities, or legal facts.
If information is missing, say so clearly.
You may explain how to search, translate Kinyarwanda/French/Swahili rental requests, and suggest filters.
Keep responses concise and helpful.

Property context (demo listings only — live database coming soon):
${JSON.stringify(knownProperties, null, 2)}

If asked for live results, explain the database integration is pending.`;

  const contents = messages.map((m) => ({
    role:    m.role === "model" ? "assistant" : "user",
    content: m.text,
  }));

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        // Reasoning models use tokens for internal thinking — budget accordingly
        max_tokens: 1024,
        messages:   [{ role: "system", content: system }, ...contents],
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      console.error("[Umutungo AI] Groq error:", response.status, errBody);
      return { ok: false as const, error: "Umutungo AI could not respond right now. Please try again." };
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text
      ? { ok: true as const, text }
      : { ok: false as const, error: "Umutungo AI returned an empty response. Please try again." };

  } catch (err) {
    console.error("[Umutungo AI] Fetch error:", err);
    return { ok: false as const, error: "Umutungo AI is temporarily unavailable. Please try again." };
  }
}
