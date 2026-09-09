"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export function PropertyContactButton({ propertyId }: { propertyId: string }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState<string>();
  const [error, setError] = useState("");
  const returnUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}#contact-creator`;

  async function reveal() {
    const response = await fetch(`/api/properties/${encodeURIComponent(propertyId)}/contact`, { method: "POST" });
    const payload = await response.json();
    if (!response.ok) { setError(payload.error ?? "Contact details are unavailable."); return; }
    setPhone(payload.phone);
  }

  if (status === "loading") return null;
  if (!session) return <p><Link href={`/sign-in?callbackUrl=${encodeURIComponent(returnUrl)}`}>Sign in</Link> to contact the landlord and reveal the verified phone number.</p>;
  if (phone) return <p><a className="button" href={`tel:${phone}`}>Call landlord: {phone}</a></p>;
  return <div><button className="button" type="button" onClick={reveal}>Reveal landlord phone number</button>{error && <p role="alert">{error}</p>}</div>;
}
