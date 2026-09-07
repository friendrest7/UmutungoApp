"use client";

import { useState } from "react";

type PaymentMethod = "momo" | "airtel" | "card";

const methods: { id: PaymentMethod; name: string; detail: string; mark: string }[] = [
  { id: "momo", name: "MTN MoMo", detail: "Pay with your MTN Mobile Money number", mark: "M" },
  { id: "airtel", name: "Airtel Money", detail: "Pay with your Airtel Money number", mark: "A" },
  { id: "card", name: "Visa / Mastercard", detail: "Pay securely through a supported PSP", mark: "▣" },
];

export function PropertyPaymentPanel({ propertyTitle }: { propertyTitle: string }) {
  const [method, setMethod] = useState<PaymentMethod>("momo");
  const [phone, setPhone] = useState("");
  const [notice, setNotice] = useState("");

  function preparePayment() {
    setNotice(
      method === "card"
        ? "Card payments will be enabled when the payment provider is connected."
        : `The ${methods.find((item) => item.id === method)?.name} connection is ready for provider credentials.`,
    );
  }

  return (
    <section className="payment-panel" aria-labelledby="payment-heading">
      <div className="payment-panel-heading">
        <div>
          <p className="eyebrow">BOOKING &amp; DEPOSIT</p>
          <h2 id="payment-heading">Choose a payment method</h2>
        </div>
        <span className="payment-secure">Secure checkout</span>
      </div>
      <p className="payment-intro">
        Select a method for a future booking deposit or paid reservation for <strong>{propertyTitle}</strong>.
        No payment is charged until the provider and booking details are confirmed.
      </p>

      <div className="payment-methods" role="radiogroup" aria-label="Payment method">
        {methods.map((item) => (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={method === item.id}
            className={`payment-method${method === item.id ? " selected" : ""}`}
            onClick={() => { setMethod(item.id); setNotice(""); }}
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
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+250 78 000 0000"
            inputMode="tel"
          />
        </label>
      )}

      <button className="button payment-continue" type="button" onClick={preparePayment}>
        Continue with {methods.find((item) => item.id === method)?.name} <span aria-hidden="true">→</span>
      </button>
      {notice && <p className="payment-notice" role="status">{notice}</p>}
      <small className="payment-footnote">Payment credentials are kept server-side. Umutungo never stores your mobile money PIN.</small>
    </section>
  );
}
