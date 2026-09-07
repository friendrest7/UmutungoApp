import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";
import { getBackendAuthHeaders } from "@/lib/backend-auth";

export async function GET() {
  try {
    const headers = await getBackendAuthHeaders();
    if (!headers) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const response = await fetch(`${getBackendUrl()}/api/admin/summary`, { headers, cache: "no-store" });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ ok: false, error: "Admin service is unavailable." }, { status: 503 });
  }
}
