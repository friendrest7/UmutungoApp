import { proxyBackend } from "@/lib/backend-proxy";

export async function GET() {
  return proxyBackend("/api/conversations", "GET");
}

export async function POST(request: Request) {
  return proxyBackend("/api/conversations", "POST", await request.text());
}
