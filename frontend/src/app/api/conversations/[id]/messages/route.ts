import { proxyBackend } from "@/lib/backend-proxy";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyBackend(`/api/conversations/${encodeURIComponent(id)}/messages`, "GET");
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyBackend(`/api/conversations/${encodeURIComponent(id)}/messages`, "POST", await request.text());
}
