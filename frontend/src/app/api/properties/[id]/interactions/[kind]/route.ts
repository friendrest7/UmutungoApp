import { proxyBackend } from "@/lib/backend-proxy";

export async function POST(_: Request, { params }: { params: Promise<{ id: string; kind: string }> }) {
  const { id, kind } = await params;
  return proxyBackend(`/api/properties/${encodeURIComponent(id)}/interactions/${encodeURIComponent(kind)}`, "POST");
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string; kind: string }> }) {
  const { id, kind } = await params;
  return proxyBackend(`/api/properties/${encodeURIComponent(id)}/interactions/${encodeURIComponent(kind)}`, "DELETE");
}
