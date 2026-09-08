"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { BrandLogo } from "@/components/brand-logo";

type Summary = { users: number; owners: number; agents: number; tenants: number; properties: number; published_properties: number; pending_viewings: number };

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") return;
    fetch("/api/admin/summary", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json() as { summary?: Summary; error?: string };
        if (!response.ok) throw new Error(data.error || "Could not load summary.");
        setSummary(data.summary ?? null);
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Could not load summary."));
  }, [session, status, router]);

  if (status === "loading" || !session) return <main className="property-page"><p>Loading admin dashboard...</p></main>;
  if (session.user.role !== "ADMIN") return null;

  return (
    <div className="cd-root">
      <aside className="cd-sidebar"><div className="cd-brand"><BrandLogo /></div><nav className="cd-nav" aria-label="Admin navigation"><a className="cd-nav-item active" href="#overview">⌂ Overview</a><a className="cd-nav-item" href="#users">Users</a><Link className="cd-nav-item" href="/">Public site</Link></nav><button className="cd-signout" type="button" onClick={() => signOut({ callbackUrl: "/" })}>↩ Sign out</button></aside>
      <main className="cd-main" id="overview"><header className="cd-topbar"><div><p className="cd-eyebrow">ADMIN CONSOLE</p><h1 className="cd-heading">Platform overview</h1></div></header>{error && <p className="cd-notice cd-notice--error" role="alert">{error}</p>}<section className="cd-stats" aria-label="Platform statistics"><div className="cd-stat-card"><div><p className="cd-stat-label">Users</p><p className="cd-stat-value">{summary?.users ?? "—"}</p></div></div><div className="cd-stat-card"><div><p className="cd-stat-label">Owners</p><p className="cd-stat-value">{summary?.owners ?? "—"}</p></div></div><div className="cd-stat-card"><div><p className="cd-stat-label">Published properties</p><p className="cd-stat-value">{summary?.published_properties ?? "—"}</p></div></div><div className="cd-stat-card"><div><p className="cd-stat-label">Pending viewings</p><p className="cd-stat-value">{summary?.pending_viewings ?? "—"}</p></div></div></section><section className="cd-section" id="users"><div className="cd-section-head"><h2>Role breakdown</h2></div><p className="cd-muted">Tenants: {summary?.tenants ?? "—"} · Agents: {summary?.agents ?? "—"} · Total properties: {summary?.properties ?? "—"}</p></section></main>
    </div>
  );
}
