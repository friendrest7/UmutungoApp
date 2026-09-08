import { proxyBackend } from "@/lib/backend-proxy";

export async function GET() {
  return proxyBackend("/api/notification-preferences", "GET");
}

export async function PATCH(request: Request) {
  return proxyBackend("/api/notification-preferences", "PATCH", await request.text());
}
