"use client";

import { useEffect, useMemo, useState } from "react";

type PaymentMethod = "momo" | "airtel" | "card";
type PaymentStatus = "checkout" | "processing" | "paid";

const methods: { id: PaymentMethod; name: string; detail: string; mark: string }[] = [
  { id: "momo", name: "MTN MoMo", detail: "Pay with your MTN Mobile Money number", mark: "M" },
  { id: "airtel", name: "Airtel Money", detail: "Pay with your Airtel Money number", mark: "A" },
  { id: "card", name: "Visa / Mastercard", detail: "Use a secure card checkout", mark: "▣" },
];

type Invoice = {
  invoiceNumber: string;
  transactionReference: string;
  issuedAt: string;
  propertyTitle: string;
  amount: number;
  currency: string;
  method: string;
  phone: string;
};

type PropertyPaymentPanelProps = {
  propertyId?: string;
  propertyTitle: string;
  rentalPrice?: number;
  currency?: string;
};

function formatMoney(amount: number, currency: string) {
  return `${amount.toLocaleString()} ${currency}`;
}

export function PropertyPaymentPanel({
  propertyId = "property",
  propertyTitle,
  rentalPrice = 500000,
  currency = "RWF",
}: PropertyPaymentPanelProps) {
  const [method, setMethod] = useState<PaymentMethod>("momo");
  const [phone, setPhone] = useState("");
  const [notice, setNotice] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("checkout");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const amount = useMemo(() => Math.max(50000, Math.round(rentalPrice * 0.1)), [rentalPrice]);
  const storageKey = `umutungo-invoice-${propertyId}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setInvoice(JSON.parse(saved) as Invoice);
        setStatus("paid");
      }
    } catch {
      // The checkout remains usable when browser storage is unavailable.
    }
  }, [storageKey]);

  function preparePayment() {
    if ((method === "momo" || method === "airtel") && phone.trim().length < 9) {
      setNotice("Enter a valid mobile money phone number to continue.");
      return;
    }

    setNotice("");
    setStatus("processing");

    window.setTimeout(() => {
      const now = new Date();
      const nextInvoice: Invoice = {
        invoiceNumber: `UM-${now.getFullYear()}-${String(now.getTime()).slice(-6)}`,
        transactionReference: `TX-${String(now.getTime()).slice(-8)}`,
        issuedAt: now.toISOString(),
        propertyTitle,
        amount,
        currency,
        method: methods.find((item) => item.id === method)?.name ?? method,
        phone: phone.trim(),
      };

      setInvoice(nextInvoice);
      setStatus("paid");
      try { localStorage.setItem(storageKey, JSON.stringify(nextInvoice)); } catch { /* */ }
    }, 900);
  }

  if (status === "paid" && invoice) {
    return (
      <section className="payment-panel payment-invoice" aria-labelledby="invoice-heading">
        <div className="invoice-topline">
          <div>
            <p className="eyebrow">Payment complete</p>
            <h2 id="invoice-heading">Your Umutungo invoice</h2>
          </div>
          <span className="invoice-paid-badge">Paid</span>
        </div>

        <div className="invoice-meta">
          <span><small>Invoice number</small><strong>{invoice.invoiceNumber}</strong></span>
          <span><small>Issued</small><strong>{new Date(invoice.issuedAt).toLocaleDateString()}</strong></span>
          <span><small>Payment method</small><strong>{invoice.method}</strong></span>
        </div>

        <div className="invoice-line-item">
          <div>
            <strong>Booking deposit</strong>
            <small>{invoice.propertyTitle}</small>
          </div>
          <b>{formatMoney(invoice.amount, invoice.currency)}</b>
        </div>

        <div className="invoice-total">
          <span>Total paid</span>
          <strong>{formatMoney(invoice.amount, invoice.currency)}</strong>
        </div>
        <p className="payment-notice" role="status">
          Payment confirmed. Keep this invoice as proof of your booking deposit.
        </p>
        <p className="invoice-reference">Transaction reference: {invoice.transactionReference}</p>
        <div className="invoice-actions">
          <button className="button" type="button" onClick={() => window.print()}>Print invoice</button>
          <button className="invoice-secondary-button" type="button" onClick={() => { setInvoice(null); setStatus("checkout"); setNotice(""); }}>
            Make another payment
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="payment-panel" aria-labelledby="payment-heading">
      <div className="payment-panel-heading">
        <div>
          <p className="eyebrow">BOOKING &amp; DEPOSIT</p>
          <h2 id="payment-heading">Reserve this home</h2>
        </div>
        <span className="payment-secure">Secure checkout</span>
      </div>
      <p className="payment-intro">
        Pay a 10% booking deposit for <strong>{propertyTitle}</strong>. Your invoice will be ready to print immediately after confirmation.
      </p>
      <div className="payment-amount-card">
        <span>Booking deposit</span>
        <strong>{formatMoney(amount, currency)}</strong>
        <small>10% of the listed monthly rent</small>
      </div>

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
            autoComplete="tel"
          />
        </label>
      )}

      <button className="button payment-continue" type="button" onClick={preparePayment} disabled={status === "processing"}>
        {status === "processing" ? "Confirming payment…" : `Pay ${formatMoney(amount, currency)}`}
        {status !== "processing" && <span aria-hidden="true"> →</span>}
      </button>
      {notice && <p className="payment-notice payment-notice--error" role="alert">{notice}</p>}
      <small className="payment-footnote">Demo checkout is enabled for this interface. Connect MTN MoMo, Airtel Money, or a card provider before accepting live payments.</small>
    </section>
  );
}
