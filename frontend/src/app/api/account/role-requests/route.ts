import { proxyBackend } from "@/lib/backend-proxy";

export async function POST(request: Request) {
  return proxyBackend("/api/account/role-requests", "POST", await request.text());
}
