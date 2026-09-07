import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";
import { getBackendAuthHeaders } from "@/lib/backend-auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return proxy("PUT", params, await request.text());
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return proxy("DELETE", params);
}

async function proxy(method: string, params: Promise<{ id: string }>, body?: string) {
  try {
    const { id } = await params;
    const authHeaders = await getBackendAuthHeaders();
    if (!authHeaders) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const response = await fetch(`${getBackendUrl()}/api/owner/properties/${encodeURIComponent(id)}`, {
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
