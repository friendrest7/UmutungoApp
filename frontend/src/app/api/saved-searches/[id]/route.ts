import { proxyBackend } from "@/lib/backend-proxy";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyBackend(`/api/saved-searches/${encodeURIComponent(id)}`, "DELETE");
}
