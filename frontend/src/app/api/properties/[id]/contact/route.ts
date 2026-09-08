import { proxyBackend } from "@/lib/backend-proxy";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyBackend(`/api/properties/${encodeURIComponent(id)}/contact`, "POST");
}
