import { proxyBackend } from "@/lib/backend-proxy";

export async function GET() {
  return proxyBackend("/api/account");
}

export async function PATCH(request: Request) {
  return proxyBackend("/api/account", "PATCH", await request.text());
}
