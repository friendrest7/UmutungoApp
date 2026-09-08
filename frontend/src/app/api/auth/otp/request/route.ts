import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

export async function POST(request: Request) {
  try {
    const response = await fetch(`${getBackendUrl()}/api/auth/otp/request`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: await request.text(), cache: "no-store",
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    // Demo mode: when the backend is not running, pretend the OTP was sent so
    // the presenter can enter the magic code (------) to complete sign-in.
    return NextResponse.json({ ok: true, message: "Code sent." }, { status: 200 });
  }
}
