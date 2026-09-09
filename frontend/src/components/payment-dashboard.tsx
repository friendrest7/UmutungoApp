"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Property = { id: string; title: string; district: string; neighborhood: string; rental_price: number; currency: string; cover_image_url?: string };
type Payment = { id: string; purpose: string; provider: string; amount: number; currency: string; status: string; receipt_number?: string; created_at: string; confirmed_at?: string };

function statusBadge(status: string) {
  const map: Record<string, string> = {
    SUCCESSFUL: "payment-status--success",
    PENDING: "payment-status--pending",
    FAILED: "payment-status--failed",
  };
  return map[status] ?? "payment-status--pending";
}

function formatPurpose(purpose: string) {
  return purpose.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function PaymentDashboard() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const propertyId = params.get("propertyId") ?? "";
  const [property, setProperty] = useState<Property | null>(null);
  const [propertyError, setPropertyError] = useState("");
  const [history, setHistory] = useState<Payment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [provider, setProvider] = useState("MTN_MOMO");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [latest, setLatest] = useState<Payment | null>(null);

  useEffect(() => {
    if (!propertyId) return;
    fetch(`/api/properties/${encodeURIComponent(propertyId)}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json() as { property?: Property; error?: string };
        if (!response.ok || !data.property) throw new Error(data.error ?? "Property is unavailable.");
        setProperty(data.property);
      })
      .catch((reason: Error) => setPropertyError(reason.message));
  }, [propertyId]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setHistoryLoading(true);
    fetch("/api/payments", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((data: { payments?: Payment[] } | null) => setHistory(data?.payments ?? []))
      .catch(() => undefined)
      .finally(() => setHistoryLoading(false));
  }, [status]);

  useEffect(() => {
    if (!session?.user) return;
    setFullName((v) => v || session.user.name || "");
    setEmail((v) => v || session.user.email || "");
  }, [session]);

  const depositLabel = useMemo(() => property
    ? `${property.rental_price.toLocaleString()} ${property.currency}`
    : "—", [property]);

  async function startPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!property) return;
    if (status !== "authenticated") {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(`/payment?propertyId=${propertyId}`)}`);
      return;
    }
    setBusy(true); setSubmitError(""); setMessage("");
    try {
      const response = await fetch("/api/payments/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_id: property.id, provider, phone, customer_name: fullName, customer_email: email, address, note }),
      });
      const data = await response.json() as Payment & { error?: string; payment_id?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not start payment.");
      const payment: Payment = {
        ...data,
        id: data.payment_id ?? data.id,
        purpose: "BOOKING_DEPOSIT",
        provider,
        amount: data.amount ?? property.rental_price,
        currency: data.currency ?? property.currency,
        created_at: new Date().toISOString(),
      };
      setLatest(payment);
      setHistory((items) => [payment, ...items]);
      setMessage("Payment request created. Complete the approval on your phone — your receipt will appear below after confirmation.");
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : "Could not start payment.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="payment-dashboard">
        <p className="payment-notice">Loading secure checkout…</p>
      </main>
    );
  }

  if (!propertyId) {
    return (
      <main className="payment-dashboard">
        <section className="payment-checkout-card payment-unavailable">
          <p className="eyebrow">NO PROPERTY SELECTED</p>
          <h2>Choose a property first</h2>
          <p>Browse available homes and select a property to continue to payment.</p>
          <Link className="button" href="/homes">Browse homes</Link>
        </section>
      </main>
    );
  }

  if (propertyError) {
    return (
      <main className="payment-dashboard">
        <section className="payment-checkout-card payment-unavailable">
          <p className="eyebrow">PROPERTY UNAVAILABLE</p>
          <h2>This property is no longer available</h2>
          <p>{propertyError}</p>
          <Link className="button" href="/homes">Browse other homes</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="payment-dashboard">
      <div className="payment-dashboard-head">
        <div>
          <p className="eyebrow">SECURE CHECKOUT</p>
          <h1>Payment dashboard</h1>
          <p>Review your selected property and complete the booking deposit.</p>
        </div>
        <button className="button small" type="button" onClick={() => window.print()}>Print receipt</button>
      </div>

      {/* ── Property + form ── */}
      {property && (
        <section className="payment-checkout-card">
          <div className="payment-property-summary">
            {property.cover_image_url && <img src={property.cover_image_url} alt={property.title} />}
            <div>
              <p className="eyebrow">SELECTED PROPERTY</p>
              <h2>{property.title}</h2>
              <p>{property.neighborhood}, {property.district}</p>
            </div>
            <strong>{depositLabel}<small>booking deposit</small></strong>
          </div>

          <form className="payment-details-form" onSubmit={startPayment}>
            <div className="payment-provider-heading">
              <div>
                <p className="eyebrow">PAYMENT METHOD</p>
                <h2>Choose how you want to pay</h2>
              </div>
              <span>{provider === "MTN_MOMO" ? "MTN Mobile Money" : "Airtel Money"}</span>
            </div>
            <div className="payment-provider-grid">
              <button type="button" className={provider === "MTN_MOMO" ? "selected" : ""} onClick={() => setProvider("MTN_MOMO")}>
                MTN MoMo<small>Approve on your MTN phone</small>
              </button>
              <button type="button" className={provider === "AIRTEL_MONEY" ? "selected" : ""} onClick={() => setProvider("AIRTEL_MONEY")}>
                Airtel Money<small>Approve on your Airtel phone</small>
              </button>
            </div>
            <div className="payment-form-grid">
              <label>Full name<input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" autoComplete="name" /></label>
              <label>Email address<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
              <label>Mobile phone<input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 78 000 0000" autoComplete="tel" /></label>
              <label>City / address<input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Kigali, Rwanda" autoComplete="street-address" /></label>
            </div>
            <label className="payment-details-note">
              Booking details or note
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Share any timing or booking details for the landlord…" rows={3} />
            </label>
            <p className="payment-form-help">Your details help Umutungo and the landlord coordinate your booking. The selected provider will send an approval request to the phone number above.</p>
            {submitError && <p className="payment-notice payment-notice--error" role="alert">{submitError}</p>}
            <button className="button payment-continue" type="submit" disabled={busy}>
              {busy ? "Starting payment…" : `Pay ${depositLabel} via ${provider === "MTN_MOMO" ? "MTN MoMo" : "Airtel Money"}`}
            </button>
          </form>
        </section>
      )}

      {/* ── Success message ── */}
      {message && <p className="payment-notice" role="status">{message}</p>}

      {/* ── Latest receipt ── */}
      {latest && <Receipt payment={latest} property={property} />}

      {/* ── Payment history ── */}
      <section className="payment-history">
        <h2>Your payment history</h2>
        {status !== "authenticated" ? (
          <p className="payment-history-empty">Sign in to view your payment history.</p>
        ) : historyLoading ? (
          <p className="payment-history-empty">Loading your payments…</p>
        ) : history.length === 0 ? (
          <p className="payment-history-empty">No payments yet. Your completed payments will appear here.</p>
        ) : (
          <div className="payment-history-list">
            {history.map((payment) => (
              <div className="payment-history-row" key={payment.id}>
                <div className="payment-history-info">
                  <strong>{formatPurpose(payment.purpose)}</strong>
                  <span>{payment.provider.replace("_", " ")} · {new Date(payment.created_at).toLocaleDateString("en-RW", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <div className="payment-history-amount">
                  <b>{payment.amount.toLocaleString()} {payment.currency}</b>
                  {payment.receipt_number && <span className="payment-history-receipt">Receipt #{payment.receipt_number}</span>}
                </div>
                <span className={`payment-status-badge ${statusBadge(payment.status)}`}>{payment.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Receipt({ payment, property }: { payment: Payment; property: Property | null }) {
  return (
    <article className="payment-invoice" aria-label="Payment receipt">
      <p className="eyebrow">UMUTUNGO RECEIPT</p>
      <h2>Payment receipt</h2>
      {property && <p>{property.title}</p>}
      <dl>
        <div><dt>Status</dt><dd>{payment.status}</dd></div>
        <div><dt>Amount</dt><dd>{payment.amount.toLocaleString()} {payment.currency}</dd></div>
        <div><dt>Provider</dt><dd>{payment.provider.replace("_", " ")}</dd></div>
        <div><dt>Reference</dt><dd>{payment.receipt_number ?? payment.id}</dd></div>
        <div><dt>Date</dt><dd>{new Date(payment.created_at).toLocaleString("en-RW", { dateStyle: "medium", timeStyle: "short" })}</dd></div>
      </dl>
      <small>An email notification will be sent to your account after provider confirmation.</small>
    </article>
  );
}
