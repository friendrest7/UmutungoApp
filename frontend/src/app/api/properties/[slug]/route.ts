import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const backendUrl = getBackendUrl();

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
