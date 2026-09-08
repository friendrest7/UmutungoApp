"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export function PropertyContactButton({ propertyId }: { propertyId: string }) {
  const { data: session, status } = useSession();
  const [phone, setPhone] = useState<string>();
  const [error, setError] = useState("");

  async function reveal() {
    const response = await fetch(`/api/properties/${encodeURIComponent(propertyId)}/contact`, { method: "POST" });
    const payload = await response.json();
    if (!response.ok) { setError(payload.error ?? "Contact details are unavailable."); return; }
    setPhone(payload.phone);
  }

  if (status === "loading") return null;
  if (!session) return <p><Link href="/sign-in">Sign in</Link> to reveal the listing creator&apos;s phone number.</p>;
  if (phone) return <p><a className="button" href={`tel:${phone}`}>Call {phone}</a></p>;
  return <div><button className="button" type="button" onClick={reveal}>Reveal phone number</button>{error && <p role="alert">{error}</p>}</div>;
}
