import { NextResponse } from "next/server";

export interface ParsedFilters {
  location: string;
  type: string;
  bedrooms: string;
  budget: string;
  summary: string; // human-readable summary of what was understood
}

const VALID_LOCATIONS = [
  "Kigali", "Gasabo", "Kicukiro", "Nyarugenge",
  "Nyagatare", "Musanze", "Huye", "Rubavu",
];
const VALID_TYPES = ["Apartment", "House", "Villa"];
const VALID_BEDROOMS = ["1 bedroom", "2 bedrooms", "3+ bedrooms"];
const VALID_BUDGETS = [
  "Under 300,000 RWF",
  "300,000–600,000 RWF",
  "600,000+ RWF",
];

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI search is not configured. Add GROQ_API_KEY to enable it." },
      { status: 503 },
    );
  }

  let query = "";
  try {
    const body = await request.json() as { query?: string };
    query = (body.query ?? "").trim().slice(0, 400);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!query) {
    return NextResponse.json({ error: "Query is required." }, { status: 400 });
  }

  // Use the fast model for filter extraction; fall back to confirmed-working model
  const model = process.env.GROQ_MODEL_FAST || process.env.GROQ_MODEL || "openai/gpt-oss-20b";

  const systemPrompt = `You are a search filter extractor for Umutungo, a Rwanda property marketplace.

Given a natural-language rental query in English, Kinyarwanda, French, or Swahili, extract structured search criteria and return ONLY a valid JSON object with these exact fields:

{
  "location": "<one of: ${VALID_LOCATIONS.join(", ")} — or empty string if not specified>",
  "type": "<one of: ${VALID_TYPES.join(", ")} — or empty string if not specified>",
  "bedrooms": "<one of: ${VALID_BEDROOMS.join(", ")} — or empty string if not specified>",
  "budget": "<one of: ${VALID_BUDGETS.join(", ")} — or empty string if not specified>",
  "summary": "<one sentence in English describing what the user is looking for>"
}

Rules:
- Return ONLY the JSON object, no markdown, no explanation, no code fences.
- Map budget hints like "cheap", "affordable", "student" to "Under 300,000 RWF".
- Map "3 bedrooms", "three bedroom", "4 bedrooms", "family home" to "3+ bedrooms".
- Map "flat" or "studio" to "Apartment".
- If the user mentions "Kigali" without a specific district, set location to "Kigali".
- If a field cannot be determined, use an empty string "".
- Never invent values outside the provided lists.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_tokens: 600,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "AI could not process this query. Try adjusting your filters manually." },
        { status: 503 },
      );
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content?.trim() ?? "";

    // Parse and validate the JSON
    let parsed: ParsedFilters;
    try {
      parsed = JSON.parse(raw) as ParsedFilters;
    } catch {
      // Groq sometimes wraps in markdown — strip fences and retry
      const stripped = raw.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
      try {
        parsed = JSON.parse(stripped) as ParsedFilters;
      } catch {
        return NextResponse.json(
          { error: "Could not understand that query. Please try rephrasing or use the filters directly." },
          { status: 422 },
        );
      }
    }

    // Sanitise — only allow values from the known lists
    const safe: ParsedFilters = {
      location: VALID_LOCATIONS.includes(parsed.location) ? parsed.location : "",
      type:     VALID_TYPES.includes(parsed.type) ? parsed.type : "",
      bedrooms: VALID_BEDROOMS.includes(parsed.bedrooms) ? parsed.bedrooms : "",
      budget:   VALID_BUDGETS.includes(parsed.budget) ? parsed.budget : "",
      summary:  typeof parsed.summary === "string"
        ? parsed.summary.slice(0, 200)
        : "Showing results based on your search.",
    };

    return NextResponse.json({ ok: true, filters: safe });
  } catch {
    return NextResponse.json(
      { error: "AI search is temporarily unavailable. Use the filters to search." },
      { status: 503 },
    );
  }
}
