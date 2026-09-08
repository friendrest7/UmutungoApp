import { proxyBackend } from "@/lib/backend-proxy";

export async function GET() {
  return proxyBackend("/api/admin/role-requests", "GET");
}
