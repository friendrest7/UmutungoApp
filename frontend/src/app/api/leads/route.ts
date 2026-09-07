import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";
import { getBackendAuthHeaders } from "@/lib/backend-auth";

export async function POST(request: Request) {
  try {
    const authHeaders = await getBackendAuthHeaders();
    if (!authHeaders) {
      return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    }

    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: await request.text(),
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

export async function GET() {
  try {
    const authHeaders = await getBackendAuthHeaders();
    if (!authHeaders) {
      return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    }

    const response = await fetch(`${getBackendUrl()}/api/leads/me`, {
      headers: authHeaders,
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
