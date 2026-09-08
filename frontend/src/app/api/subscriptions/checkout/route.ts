import { proxyBackend } from "@/lib/backend-proxy";

export async function POST(request: Request) {
  return proxyBackend("/api/subscriptions/checkout", "POST", await request.text());
}
