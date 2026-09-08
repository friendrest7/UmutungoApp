import { proxyBackend } from "@/lib/backend-proxy";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyBackend(`/api/admin/kyc/${encodeURIComponent(id)}`, "PATCH", await request.text());
}
