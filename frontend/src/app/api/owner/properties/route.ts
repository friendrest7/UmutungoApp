import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";
import { getBackendAuthHeaders } from "@/lib/backend-auth";

export async function GET() {
  return proxy("GET", "/api/owner/properties");
}

export async function POST(request: Request) {
  return proxy("POST", "/api/owner/properties", await request.text());
}

async function proxy(method: string, path: string, body?: string) {
  try {
    const authHeaders = await getBackendAuthHeaders();
    if (!authHeaders) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const response = await fetch(`${getBackendUrl()}${path}`, {
      method,
      headers: { ...authHeaders, ...(body ? { "Content-Type": "application/json" } : {}) },
      body,
      cache: "no-store",
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ ok: false, error: "Property service is unavailable." }, { status: 503 });
  }
}
