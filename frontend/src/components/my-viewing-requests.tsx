"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

type Viewing = {
  id: string;
  property_id: string;
  property_title: string;
  district: string;
  tenant_phone: string;
  requested_at: string;
  scheduled_for?: string;
  status: string;
  message: string;
};

export function MyViewingRequests() {
  const { data: session, status: sessionStatus } = useSession();
  const pathname = usePathname();
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;

    let cancelled = false;
    setStatus("loading");
    fetch("/api/leads", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load viewing requests");
        return response.json() as Promise<{ viewings?: Viewing[] }>;
      })
      .then((data) => {
        if (!cancelled) {
          setViewings(data.viewings ?? []);
          setStatus("success");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [sessionStatus]);

  if (sessionStatus === "loading") return <p>Loading your requests...</p>;
  if (!session) {
    return (
      <p>
        <Link href={`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`}>Sign in</Link> to view your viewing requests.
      </p>
    );
  }
  if (status === "loading") return <p>Loading your requests...</p>;
  if (status === "error") return <p role="alert">We could not load your viewing requests.</p>;
  if (viewings.length === 0) return <p>You have not requested a viewing yet.</p>;

  return (
    <ul>
      {viewings.map((viewing) => (
        <li key={viewing.id}>
          <strong>{viewing.property_title}</strong>
          <span>{viewing.district} · {viewing.status.toLowerCase()}</span>
          <small>Requested {new Date(viewing.requested_at).toLocaleDateString()}</small>
        </li>
      ))}
    </ul>
  );
}
