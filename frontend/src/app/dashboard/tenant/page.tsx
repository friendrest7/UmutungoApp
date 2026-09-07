"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SiteHeader } from "@/components/layout";
import { MyViewingRequests } from "@/components/my-viewing-requests";

export default function TenantDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "TENANT") router.replace("/sign-in");
  }, [session, status, router]);

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
      </main>
    </>
  );
}
