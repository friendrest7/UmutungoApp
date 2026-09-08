import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

export async function POST(request: Request) {
  try {
    const response = await fetch(`${getBackendUrl()}/api/auth/password/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await request.text(),
      cache: "no-store",
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ ok: false, error: "Authentication service is unavailable." }, { status: 503 });
  }
}

