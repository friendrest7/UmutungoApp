import { Suspense } from "react";
import { SiteHeader } from "@/components/layout";
import { PaymentDashboard } from "@/components/payment-dashboard";

export default function PaymentPage() {
  return <><SiteHeader variant="minimal" /><Suspense fallback={<main className="payment-dashboard"><p>Loading payment dashboard...</p></main>}><PaymentDashboard /></Suspense></>;
}

