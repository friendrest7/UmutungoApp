import { proxyBackend } from "@/lib/backend-proxy";

export async function POST(request: Request) {
  return proxyBackend("/api/payments/booking", "POST", await request.text());
}

