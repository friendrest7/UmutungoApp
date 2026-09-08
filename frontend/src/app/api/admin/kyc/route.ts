import { proxyBackend } from "@/lib/backend-proxy";

export async function GET(request: Request) {
  const query = new URL(request.url).search;
  return proxyBackend(`/api/admin/kyc${query}`);
}
