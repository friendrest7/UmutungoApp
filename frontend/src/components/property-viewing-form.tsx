"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export function PropertyViewingForm({ propertyId }: { propertyId: string }) {
  const { data: session, status: sessionStatus } = useSession();
  const pathname = usePathname();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: propertyId,
          tenant_name: name,
          tenant_phone: phone,
          tenant_message: message,
          scheduled_for: date ? `${date}T09:00:00Z` : "",
        }),
      });
      if (!response.ok) throw new Error("Viewing request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (sessionStatus === "loading") return <p>Checking your sign-in...</p>;
  if (!session) {
    return (
      <p>
        <Link href={`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`}>Sign in</Link> to request a viewing. Your request will be linked to your account.
      </p>
    );
  }

  return (
    <form className="viewing-form" onSubmit={submit}>
      <label>
        Your name
        <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Amina Uwera" />
      </label>
      <label>
        Phone number
        <input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="e.g. +250 78 000 0000" />
      </label>
      <label>
        Preferred viewing date
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>
      <label>
        Message (optional)
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Any questions or specific requirements…" />
      </label>
      <button className="button" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Submit viewing request →"}
      </button>
      {status === "success" && <p role="status">Viewing request received. We will contact you within 24 hours.</p>}
      {status === "error" && <p role="alert">We could not submit the request. Please try again.</p>}
    </form>
  );
}
