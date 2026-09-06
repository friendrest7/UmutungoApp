import { NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8080";

export async function GET(request: Request) {
  const url = new URL(`${backendUrl}/api/properties`);
  const incoming = new URL(request.url).searchParams;

  for (const key of ["location", "property_type", "min_bedrooms", "max_price"]) {
    const value = incoming.get(key);
    if (value) url.searchParams.set(key, value);
  }

  try {
    const response = await fetch(url, { cache: "no-store" });
    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Property service is unavailable." },
      { status: 503 },
    );
  }
}
