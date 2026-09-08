import { proxyBackend } from "@/lib/backend-proxy";

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyBackend(`/api/notifications/${encodeURIComponent(id)}/read`, "PATCH");
}
