import { proxyBackend } from "@/lib/backend-proxy";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyBackend(`/api/properties/${encodeURIComponent(id)}/comments`, "GET");
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyBackend(`/api/properties/${encodeURIComponent(id)}/comments`, "POST", await request.text());
}
