import { NextResponse } from "next/server";
import { getBackendAuthHeaders } from "@/lib/backend-auth";
import { getBackendUrl } from "@/lib/backend-url";

export async function proxyBackend(
  path: string,
  method = "GET",
  body?: string,
  fallbackMessage = "Backend service is unavailable.",
) {
  try {
    const authHeaders = await getBackendAuthHeaders();
    if (!authHeaders) {
      return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    }
    const response = await fetch(`${getBackendUrl()}${path}`, {
      method,
      headers: { ...authHeaders, ...(body ? { "Content-Type": "application/json" } : {}) },
      body,
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({ ok: false, error: "Invalid backend response." }));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ ok: false, error: fallbackMessage }, { status: 503 });
  }
}
