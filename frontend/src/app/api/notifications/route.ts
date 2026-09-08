import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";
import { getBackendAuthHeaders } from "@/lib/backend-auth";

export async function GET() {
  try {
    const authHeaders = await getBackendAuthHeaders();

    // Not signed in — return empty safely, no error
    if (!authHeaders) {
      return NextResponse.json({ ok: true, notifications: [], unread_count: 0 });
    }

    const response = await fetch(`${getBackendUrl()}/api/notifications`, {
      method: "GET",
      headers: authHeaders,
      cache: "no-store",
    });

    // Backend doesn't have this endpoint yet — return empty safely
    if (response.status === 404 || response.status === 501) {
      return NextResponse.json({ ok: true, notifications: [], unread_count: 0 });
    }

    if (!response.ok) {
      return NextResponse.json({ ok: true, notifications: [], unread_count: 0 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    // Backend offline — return empty safely
    return NextResponse.json({ ok: true, notifications: [], unread_count: 0 });
  }
}
