import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const backendUrl = getBackendUrl();

  try {
    const response = await fetch(`${backendUrl}/api/properties/${encodeURIComponent(id)}`, {
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
