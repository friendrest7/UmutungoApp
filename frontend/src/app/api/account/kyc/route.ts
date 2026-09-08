import { proxyBackend } from "@/lib/backend-proxy";

export async function GET() {
  return proxyBackend("/api/account/kyc");
}

export async function POST(request: Request) {
  return proxyBackend("/api/account/kyc", "POST", await request.text());
}
