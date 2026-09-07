import { NextResponse } from "next/server";
import { askUmutungoAi, AiMessage } from "@/services/ai/inzu-ai";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { messages?: AiMessage[] };
    const messages = body.messages?.filter((message) => (message.role === "user" || message.role === "model") && typeof message.text === "string").slice(-12);
    if (!messages?.length) return NextResponse.json({ error: "A message is required." }, { status: 400 });
    const result = await askUmutungoAi(messages);
    return NextResponse.json(result, { status: result.ok ? 200 : 503 });
  } catch { return NextResponse.json({ error: "We could not read that message." }, { status: 400 }); }
}
