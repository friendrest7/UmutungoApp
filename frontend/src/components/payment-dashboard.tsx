"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

type Property = { id: string; title: string; district: string; neighborhood: string; rental_price: number; currency: string; cover_image_url?: string };
type Payment = { id: string; purpose: string; provider: string; amount: number; currency: string; status: string; receipt_number?: string; created_at: string; confirmed_at?: string };

export function PaymentDashboard() {
  const params = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const propertyId = params.get("propertyId") ?? "";
  const [property, setProperty] = useState<Property | null>(null);
  const [history, setHistory] = useState<Payment[]>([]);
  const [provider, setProvider] = useState("MTN_MOMO");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [latest, setLatest] = useState<Payment | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace(`/sign-in?callbackUrl=${encodeURIComponent(`/payment?propertyId=${propertyId}`)}`);
  }, [propertyId, router, status]);

  useEffect(() => {
    if (!propertyId || status !== "authenticated") return;
    fetch(`/api/properties/${encodeURIComponent(propertyId)}`, { cache: "no-store" }).then(async (response) => {
      const data = await response.json() as { property?: Property; error?: string };
      if (!response.ok || !data.property) throw new Error(data.error ?? "Property is unavailable.");
      setProperty(data.property);
    }).catch((reason: Error) => setError(reason.message));
    fetch("/api/payments", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((data: { payments?: Payment[] } | null) => setHistory(data?.payments ?? [])).catch(() => undefined);
  }, [propertyId, status]);

  const depositLabel = useMemo(() => property ? `${property.rental_price.toLocaleString()} ${property.currency}` : "—", [property]);

  async function startPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!property) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/payments/booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ property_id: property.id, provider, phone }) });
      const data = await response.json() as Payment & { error?: string; payment_id?: string; provider_reference?: string; status?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not start payment.");
      const payment = { ...data, id: data.payment_id ?? data.id, purpose: "BOOKING_DEPOSIT", provider, amount: data.amount ?? property.rental_price, currency: data.currency ?? property.currency, created_at: new Date().toISOString() } as Payment;
      setLatest(payment); setHistory((items) => [payment, ...items]); setMessage("Payment request created. Complete the approval on your phone; your receipt will appear here after confirmation.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not start payment."); }
    finally { setBusy(false); }
  }

  if (status !== "authenticated") return <main className="payment-dashboard"><p>Checking your sign-in...</p></main>;
  if (!propertyId) return <main className="payment-dashboard"><p className="payment-notice--error">Choose a property before continuing to payment.</p></main>;

  return <main className="payment-dashboard">
    <div className="payment-dashboard-head"><div><p className="eyebrow">SECURE CHECKOUT</p><h1>Payment dashboard</h1><p>Review your selected property and request the booking deposit.</p></div><button className="button small" type="button" onClick={() => window.print()}>Print receipt</button></div>
    {property && <section className="payment-checkout-card"><div className="payment-property-summary">{property.cover_image_url && <img src={property.cover_image_url} alt="" />}<div><p className="eyebrow">SELECTED PROPERTY</p><h2>{property.title}</h2><p>{property.neighborhood}, {property.district}</p></div><strong>{depositLabel}<small>booking deposit</small></strong></div><form onSubmit={startPayment}><div className="payment-provider-grid"><button type="button" className={provider === "MTN_MOMO" ? "selected" : ""} onClick={() => setProvider("MTN_MOMO")}>MTN MoMo</button><button type="button" className={provider === "AIRTEL_MONEY" ? "selected" : ""} onClick={() => setProvider("AIRTEL_MONEY")}>Airtel Money</button></div><label className="payment-phone">Mobile Money phone number<input type="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+250 78 000 0000" /></label><button className="button payment-continue" type="submit" disabled={busy}>{busy ? "Starting payment..." : `Continue with ${provider === "MTN_MOMO" ? "MTN MoMo" : "Airtel Money"}`}</button></form></section>}
    {message && <p className="payment-notice" role="status">{message}</p>}
    {error && <p className="payment-notice payment-notice--error" role="alert">{error}</p>}
    {latest && <Receipt payment={latest} property={property} />}
    <section className="payment-history"><h2>Your payment history</h2>{history.length === 0 ? <p>No payments yet.</p> : history.map((payment) => <div className="payment-history-row" key={payment.id}><span>{payment.purpose.replaceAll("_", " ")}</span><strong>{payment.amount.toLocaleString()} {payment.currency}</strong><b>{payment.status}</b>{payment.receipt_number && <span>Receipt {payment.receipt_number}</span>}</div>)}</section>
  </main>;
}

function Receipt({ payment, property }: { payment: Payment; property: Property | null }) {
  return <article className="payment-invoice" aria-label="Payment receipt"><p className="eyebrow">UMUTUNGO RECEIPT</p><h2>Payment receipt</h2><p>{property?.title}</p><dl><div><dt>Status</dt><dd>{payment.status}</dd></div><div><dt>Amount</dt><dd>{payment.amount.toLocaleString()} {payment.currency}</dd></div><div><dt>Reference</dt><dd>{payment.receipt_number ?? payment.id}</dd></div><div><dt>Date</dt><dd>{new Date(payment.created_at).toLocaleString()}</dd></div></dl><small>Email notification will be sent to your account address after provider confirmation.</small></article>;
}

