"use client";

import { useState } from "react";

export function PropertyShareButtons({ title }: { title: string }) {
  const [notice, setNotice] = useState("");
  async function share() {
    const url = window.location.href;
    const text = `${title} — Umutungo`;
    if (navigator.share) { await navigator.share({ title, text, url }); return; }
    await navigator.clipboard?.writeText(url);
    setNotice("Listing link copied.");
  }
  const encoded = encodeURIComponent(`${title} — ${typeof window === "undefined" ? "" : window.location.href}`);
  return <div className="property-share" aria-label="Share listing">
    <button type="button" className="button" onClick={share}>Share</button>
    <a className="button" href={`https://wa.me/?text=${encoded}`} target="_blank" rel="noreferrer">WhatsApp</a>
    <a className="button" href={`sms:?body=${encoded}`}>SMS</a>
    {notice && <span role="status">{notice}</span>}
  </div>;
}
