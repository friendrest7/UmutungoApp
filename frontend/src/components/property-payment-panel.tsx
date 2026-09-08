"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type PaymentMethod = "momo" | "airtel" | "card";

const methods: { id: PaymentMethod; name: string; detail: string; mark: string }[] = [
  { id: "momo", name: "MTN MoMo", detail: "Pay with MTN Mobile Money when enabled", mark: "M" },
  { id: "airtel", name: "Airtel Money", detail: "Pay with Airtel Money when enabled", mark: "A" },
  { id: "card", name: "Visa / Mastercard", detail: "Card checkout is planned for Phase 2", mark: "□" },
];

type PropertyPaymentPanelProps = { propertyId: string; propertyTitle: string };

export function PropertyPaymentPanel({ propertyId, propertyTitle }: PropertyPaymentPanelProps) {
  const router = useRouter();
  const { status } = useSession();
  const [method, setMethod] = useState<PaymentMethod>("momo");
  const [phone, setPhone] = useState("");

  return (
    <section className="payment-panel" aria-labelledby="payment-heading">
      <div className="payment-panel-heading">
        <div>
          <p className="eyebrow">BOOKING &amp; DEPOSIT</p>
          <h2 id="payment-heading">Reserve this home</h2>
        </div>
        <span className="payment-secure">Provider confirmation required</span>
      </div>
      <p className="payment-intro">
        Continue to the payment dashboard to reserve <strong>{propertyTitle}</strong>. The provider will request approval on your phone.
      </p>
      <div className="payment-methods" role="radiogroup" aria-label="Payment method">
        {methods.map((item) => (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={method === item.id}
            className={`payment-method${method === item.id ? " selected" : ""}`}
            onClick={() => setMethod(item.id)}
          >
            <span className={`payment-mark payment-mark--${item.id}`} aria-hidden="true">{item.mark}</span>
            <span><strong>{item.name}</strong><small>{item.detail}</small></span>
            <span className="payment-check" aria-hidden="true">{method === item.id ? "✓" : ""}</span>
          </button>
        ))}
      </div>
      {(method === "momo" || method === "airtel") && (
        <label className="payment-phone">
          Mobile Money phone number
          <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Enter this on the payment dashboard" inputMode="tel" autoComplete="tel" disabled />
        </label>
      )}
      <button className="button payment-continue" type="button" onClick={() => router.push(status === "authenticated" ? `/payment?propertyId=${encodeURIComponent(propertyId)}` : `/sign-in?callbackUrl=${encodeURIComponent(`/payment?propertyId=${propertyId}`)}`)}>
        {status === "authenticated" ? "Continue to payment dashboard →" : "Sign in to continue →"}
      </button>
      <p className="payment-notice" role="status">No payment is requested until you submit the payment dashboard.</p>
    </section>
  );
}
