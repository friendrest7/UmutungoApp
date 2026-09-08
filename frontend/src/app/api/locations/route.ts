import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.toString();
    const response = await fetch(`${getBackendUrl()}/api/locations${query ? `?${query}` : ""}`, { cache: "no-store" });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch { return NextResponse.json({ ok: false, error: "Location service is unavailable." }, { status: 503 }); }
}
