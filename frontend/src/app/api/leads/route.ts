import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

export async function POST(request: Request) {
  try {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
