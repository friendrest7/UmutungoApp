"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { SiteHeader } from "@/components/layout";
import { MyViewingRequests } from "@/components/my-viewing-requests";
import { AccountOverview } from "@/components/account-overview";

export default function TenantDashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading" || !session) return <main className="property-page"><p>Loading your dashboard...</p></main>;
  if (session.user.role !== "TENANT") return null;

  return (
    <>
      <SiteHeader variant="minimal" />
      <main className="property-page">
        <Link href="/">← Back to Umutungo</Link>
        <p>MY UMUTUNGO</p>
        <h1>Your viewing requests</h1>
        <p>Track the properties you have asked to visit and their current status.</p>
        <section className="viewing-section" aria-labelledby="requests-heading">
          <h2 id="requests-heading">Viewing requests</h2>
          <MyViewingRequests />
        </section>
        <AccountOverview />
      </main>
    </>
  );
}
