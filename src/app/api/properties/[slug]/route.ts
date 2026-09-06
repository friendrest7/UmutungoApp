import { NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8080";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;

  try {
    const response = await fetch(`${backendUrl}/api/properties/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Property service is unavailable." },
      { status: 503 },
    );
  }
}
