"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export function PropertyMessageForm({ propertyId }: { propertyId: string }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}#message-creator`;
  const [body, setBody] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim()) return;
    setState("loading");
    try {
      const start = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: propertyId }),
      });
      const conversation = await start.json() as { conversation_id?: string };
      if (!start.ok || !conversation.conversation_id) throw new Error("Conversation unavailable");
      const send = await fetch(`/api/conversations/${encodeURIComponent(conversation.conversation_id)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      if (!send.ok) throw new Error("Message unavailable");
      setBody("");
      setState("success");
    } catch {
      setState("error");
    }
  }

  if (status === "loading") return <p>Checking your sign-in...</p>;
  if (!session) {
    return <p><Link href={`/sign-in?callbackUrl=${encodeURIComponent(returnUrl)}`}>Sign in</Link> to contact the landlord.</p>;
  }

  return (
    <form className="viewing-form property-message-form" onSubmit={submit}>
      <label>
        Message the landlord
        <textarea required value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} placeholder="Ask about availability, location, or next steps..." />
      </label>
      <button className="button" type="submit" disabled={state === "loading"}>
        {state === "loading" ? "Sending..." : "Send message"}
      </button>
      {state === "success" && <p role="status">Message sent. You can continue the conversation from Messages.</p>}
      {state === "error" && <p role="alert">We could not send your message. Please try again.</p>}
    </form>
  );
}
