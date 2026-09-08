import { proxyBackend } from "@/lib/backend-proxy";

export async function GET() {
  return proxyBackend("/api/saved-searches", "GET");
}

export async function POST(request: Request) {
  return proxyBackend("/api/saved-searches", "POST", await request.text());
}
