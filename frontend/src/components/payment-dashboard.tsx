"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Property = { id: string; title: string; district: string; neighborhood: string; rental_price: number; currency: string; cover_image_url?: string };
type Payment = { id: string; purpose: string; provider: string; amount: number; currency: string; status: string; receipt_number?: string; created_at: string; confirmed_at?: string };

export function PaymentDashboard() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const propertyId = params.get("propertyId") ?? "";
  const [property, setProperty] = useState<Property | null>(null);
  const [history, setHistory] = useState<Payment[]>([]);
  const [provider, setProvider] = useState("MTN_MOMO");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [latest, setLatest] = useState<Payment | null>(null);

  useEffect(() => {
    if (!propertyId) return;
    fetch(`/api/properties/${encodeURIComponent(propertyId)}`, { cache: "no-store" }).then(async (response) => {
      const data = await response.json() as { property?: Property; error?: string };
      if (!response.ok || !data.property) throw new Error(data.error ?? "Property is unavailable.");
      setProperty(data.property);
    }).catch((reason: Error) => setError(reason.message));
    if (status === "authenticated") {
      fetch("/api/payments", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((data: { payments?: Payment[] } | null) => setHistory(data?.payments ?? [])).catch(() => undefined);
    }
  }, [propertyId, status]);

  useEffect(() => {
    if (!session?.user) return;
    setFullName((value) => value || session.user.name || "");
    setEmail((value) => value || session.user.email || "");
  }, [session]);

  const depositLabel = useMemo(() => property ? `${property.rental_price.toLocaleString()} ${property.currency}` : "—", [property]);

  async function startPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!property) return;
    if (status !== "authenticated") {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(`/payment?propertyId=${propertyId}`)}`);
      return;
    }
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/payments/booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ property_id: property.id, provider, phone, customer_name: fullName, customer_email: email, address, note }) });
      const data = await response.json() as Payment & { error?: string; payment_id?: string; provider_reference?: string; status?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not start payment.");
      const payment = { ...data, id: data.payment_id ?? data.id, purpose: "BOOKING_DEPOSIT", provider, amount: data.amount ?? property.rental_price, currency: data.currency ?? property.currency, created_at: new Date().toISOString() } as Payment;
      setLatest(payment); setHistory((items) => [payment, ...items]); setMessage("Payment request created. Complete the approval on your phone; your receipt will appear here after confirmation.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not start payment."); }
    finally { setBusy(false); }
  }

  if (status === "loading") return <main className="payment-dashboard"><p>Loading secure checkout...</p></main>;
  if (!propertyId) return <main className="payment-dashboard"><p className="payment-notice--error">Choose a property before continuing to payment.</p></main>;

  return <main className="payment-dashboard">
    <div className="payment-dashboard-head"><div><p className="eyebrow">SECURE CHECKOUT</p><h1>Payment dashboard</h1><p>Review your selected property and request the booking deposit.</p></div><button className="button small" type="button" onClick={() => window.print()}>Print receipt</button></div>
    {error && !property && <section className="payment-checkout-card payment-unavailable"><p className="eyebrow">PAYMENT SETUP</p><h2>Continue with your booking</h2><p>Your payment request is ready to continue. Return to the homes list, choose the home again, and select the payment option to proceed securely.</p><Link className="button" href="/homes">Continue to homes</Link></section>}
    {property && <section className="payment-checkout-card">
      <div className="payment-property-summary">
        {property.cover_image_url && <img src={property.cover_image_url} alt="" />}
        <div><p className="eyebrow">SELECTED PROPERTY</p><h2>{property.title}</h2><p>{property.neighborhood}, {property.district}</p></div>
        <strong>{depositLabel}<small>booking deposit</small></strong>
      </div>
      <form className="payment-details-form" onSubmit={startPayment}>
        <div className="payment-provider-heading">
          <div><p className="eyebrow">PAYMENT METHOD</p><h2>Choose how you want to pay</h2></div>
          <span>{provider === "MTN_MOMO" ? "MTN Mobile Money" : "Airtel Money"}</span>
        </div>
        <div className="payment-provider-grid">
          <button type="button" className={provider === "MTN_MOMO" ? "selected" : ""} onClick={() => setProvider("MTN_MOMO")}>MTN MoMo<small>Approve on your MTN phone</small></button>
          <button type="button" className={provider === "AIRTEL_MONEY" ? "selected" : ""} onClick={() => setProvider("AIRTEL_MONEY")}>Airtel Money<small>Approve on your Airtel phone</small></button>
        </div>
        <div className="payment-form-grid">
          <label>Full name<input type="text" required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your full name" autoComplete="name" /></label>
          <label>Email address<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
          <label>Mobile phone<input type="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+250 78 000 0000" autoComplete="tel" /></label>
          <label>City / address<input type="text" required value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Kigali, Rwanda" autoComplete="street-address" /></label>
        </div>
        <label className="payment-details-note">Booking details or note<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Share any timing or booking details for the landlord..." rows={3} /></label>
        <p className="payment-form-help">Your details help Umutungo and the landlord coordinate your booking. The selected provider will request approval using the phone number above.</p>
        <button className="button payment-continue" type="submit" disabled={busy}>{busy ? "Starting payment..." : `Continue with ${provider === "MTN_MOMO" ? "MTN MoMo" : "Airtel Money"}`}</button>
      </form>
    </section>}
    {message && <p className="payment-notice" role="status">{message}</p>}
    {error && property && <p className="payment-notice payment-notice--error" role="alert">We could not start the payment request yet. Please check the phone number and try again.</p>}
    {latest && <Receipt payment={latest} property={property} />}
    <section className="payment-history"><h2>Your payment history</h2>{status !== "authenticated" ? <p>Sign in when you are ready to submit the payment request. Your history will appear here.</p> : history.length === 0 ? <p>No payments yet.</p> : history.map((payment) => <div className="payment-history-row" key={payment.id}><span>{payment.purpose.replaceAll("_", " ")}</span><strong>{payment.amount.toLocaleString()} {payment.currency}</strong><b>{payment.status}</b>{payment.receipt_number && <span>Receipt {payment.receipt_number}</span>}</div>)}</section>
  </main>;
}

function Receipt({ payment, property }: { payment: Payment; property: Property | null }) {
  return <article className="payment-invoice" aria-label="Payment receipt"><p className="eyebrow">UMUTUNGO RECEIPT</p><h2>Payment receipt</h2><p>{property?.title}</p><dl><div><dt>Status</dt><dd>{payment.status}</dd></div><div><dt>Amount</dt><dd>{payment.amount.toLocaleString()} {payment.currency}</dd></div><div><dt>Reference</dt><dd>{payment.receipt_number ?? payment.id}</dd></div><div><dt>Date</dt><dd>{new Date(payment.created_at).toLocaleString()}</dd></div></dl><small>Email notification will be sent to your account address after provider confirmation.</small></article>;
}
