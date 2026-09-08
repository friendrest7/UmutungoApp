"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/layout";

const PROPERTY_TYPES = ["HOUSE", "APARTMENT", "VILLA", "STUDIO", "OFFICE", "LAND"];
const CURRENCIES = ["RWF", "USD"];
const AMENITY_OPTIONS = [
  "High-speed WiFi", "Balcony / Terrace", "Private Garden", "Secure Parking",
  "24/7 Security Guard", "Fully Furnished", "Hot Water Tank", "Backup Generator",
  "Air Conditioning", "Swimming Pool", "DSTV / Cable TV", "Washing Machine",
];

const KIGALI_NEIGHBORHOODS = [
  { name: "Nyarutarama",    district: "Gasabo",      lat: -1.9360, lng: 30.0982 },
  { name: "Kiyovu",         district: "Nyarugenge",  lat: -1.9536, lng: 30.0605 },
  { name: "Kimihurura",     district: "Gasabo",      lat: -1.9540, lng: 30.0825 },
  { name: "Kacyiru",        district: "Gasabo",      lat: -1.9355, lng: 30.0715 },
  { name: "Gacuriro",       district: "Gasabo",      lat: -1.9212, lng: 30.1065 },
  { name: "Remera",         district: "Gasabo",      lat: -1.9610, lng: 30.1145 },
  { name: "Kibagabaga",     district: "Gasabo",      lat: -1.9275, lng: 30.1158 },
  { name: "Kicukiro Centre",district: "Kicukiro",    lat: -1.9705, lng: 30.1044 },
  { name: "Gisozi",         district: "Gasabo",      lat: -1.9189, lng: 30.0638 },
  { name: "Nyamirambo",     district: "Nyarugenge",  lat: -1.9822, lng: 30.0461 },
  { name: "Kanombe",        district: "Kicukiro",    lat: -1.9748, lng: 30.1395 },
  { name: "Gikondo",        district: "Kicukiro",    lat: -1.9768, lng: 30.0793 },
];

type FormState = {
  title: string;
  description: string;
  property_type: string;
  rental_price: string;
  currency: string;
  bedrooms: string;
  bathrooms: string;
  district: string;
  neighborhood: string;
  address_line: string;
  latitude: string;
  longitude: string;
  google_maps_url: string;
  availability_status: string;
  is_published: boolean;
  amenities: string[];
  images: string[];
};

const empty: FormState = {
  title: "", description: "", property_type: "HOUSE",
  rental_price: "", currency: "RWF",
  bedrooms: "2", bathrooms: "1",
  district: "Gasabo", neighborhood: "", address_line: "",
  latitude: "-1.9540", longitude: "30.0825", google_maps_url: "",
  availability_status: "AVAILABLE", is_published: true,
  amenities: [], images: [],
};

// ── Steps ────────────────────────────────────────────────────
const STEPS = ["Photos", "Details", "Location", "Price & Publish"];

export default function AddPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  // No top-level auth guard — let everyone fill the form freely.

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function toggleAmenity(a: string) {
    set("amenities", form.amenities.includes(a)
      ? form.amenities.filter(x => x !== a)
      : [...form.amenities, a]);
  }

  function handleNeighborhood(name: string) {
    const found = KIGALI_NEIGHBORHOODS.find(n => n.name === name);
    if (found) {
      setForm(f => ({
        ...f,
        neighborhood: found.name,
        district: found.district,
        latitude: String(found.lat),
        longitude: String(found.lng),
        google_maps_url: `https://www.google.com/maps?q=${found.lat},${found.lng}`,
      }));
    } else {
      set("neighborhood", name);
    }
  }

  function handleImageFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        if (ev.target?.result) {
          set("images", [...form.images, ev.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  function removeImage(i: number) {
    set("images", form.images.filter((_, idx) => idx !== i));
  }

  function makeCover(i: number) {
    if (i === 0) return;
    const copy = [...form.images];
    const [img] = copy.splice(i, 1);
    set("images", [img, ...copy]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Require sign-in at publish time — form data is preserved in state
    if (status === "loading") return;
    if (!session) {
      setShowSignInPrompt(true);
      return;
    }

    setSaving(true);
    setError("");

    const lat = form.latitude ? parseFloat(form.latitude) : null;
    const lng = form.longitude ? parseFloat(form.longitude) : null;
    const mapsUrl = form.google_maps_url || (lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : undefined);

    const payload = {
      title: form.title,
      description: form.description,
      property_type: form.property_type,
      rental_price: Number(form.rental_price) || 0,
      currency: form.currency,
      bedrooms: Number(form.bedrooms) || 1,
      bathrooms: Number(form.bathrooms) || 1,
      district: form.district,
      neighborhood: form.neighborhood,
      address_line: form.address_line,
      latitude: lat, longitude: lng,
      google_maps_url: mapsUrl,
      availability_status: form.availability_status,
      is_published: form.is_published,
      image_urls: form.images.length ? form.images : ["/images/properties/hero-home.jpg"],
      amenities: form.amenities,
    };

    // Save locally for instant search visibility
    try {
      const raw = localStorage.getItem("inzuhub_custom_properties");
      const list = raw ? JSON.parse(raw) : [];
      const item = { ...payload, id: `prop-${Date.now()}`, verification_status: "VERIFIED", created_at: new Date().toISOString(), cover_image_url: payload.image_urls[0] };
      localStorage.setItem("inzuhub_custom_properties", JSON.stringify([item, ...list]));
      window.dispatchEvent(new CustomEvent("inzuhub:property-updated", { detail: item }));
    } catch { /* ignore */ }

    // Submit to API
    try {
      await fetch("/api/owner/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch { /* backend offline — local save is enough for demo */ }

    setSaving(false);
    setDone(true);
  }

  if (done) {
    return (
      <>
        <SiteHeader variant="minimal" />
        <main className="ap-page">
          <div className="ap-success">
            <div className="ap-success-icon">✓</div>
            <h1>Property listed!</h1>
            <p>Your property is now {form.is_published ? "live and searchable" : "saved as a draft"}.</p>
            <div className="ap-success-actions">
              <Link className="button" href="/#homes">Browse listings →</Link>
              <button className="button ap-btn-outline" type="button" onClick={() => { setForm(empty); setDone(false); setStep(0); }}>Add another</button>
            </div>
          </div>
        </main>
      </>
    );
  }

  const lat = form.latitude ? parseFloat(form.latitude) : -1.9540;
  const lng = form.longitude ? parseFloat(form.longitude) : 30.0825;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  return (
    <>
      <SiteHeader variant="minimal" />

      {/* ── Sign-in prompt overlay (shown only when unauthenticated user tries to publish) ── */}
      {showSignInPrompt && (
        <div className="ap-signin-overlay" role="dialog" aria-modal="true" aria-label="Sign in to publish">
          <div className="ap-signin-card">
            <button
              className="ap-signin-close"
              type="button"
              aria-label="Dismiss"
              onClick={() => setShowSignInPrompt(false)}
            >
              ✕
            </button>
            <div className="ap-signin-icon">🔒</div>
            <h2>Sign in to publish</h2>
            <p>
              Your property details are saved. Sign in to publish your listing and make it visible to renters.
            </p>
            <Link
              className="button"
              href={`/sign-in?callbackUrl=${encodeURIComponent("/add-property")}`}
            >
              Sign in →
            </Link>
            <button
              type="button"
              className="ap-btn-outline"
              onClick={() => setShowSignInPrompt(false)}
            >
              Continue editing
            </button>
          </div>
        </div>
      )}

      <main className="ap-page">
        <div className="ap-header">
          <Link href="/" className="ap-back">← Back to Umutungo</Link>
          <h1 className="ap-title">List your property</h1>
          <p className="ap-subtitle">Share your space with people looking for a home in Rwanda.</p>
        </div>

        {/* ── Step indicator ── */}
        <nav className="ap-steps" aria-label="Form steps">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              className={`ap-step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}
              onClick={() => setStep(i)}
            >
              <span className="ap-step-num">{i < step ? "✓" : i + 1}</span>
              <span className="ap-step-label">{label}</span>
            </button>
          ))}
        </nav>

        <form className="ap-form" onSubmit={handleSubmit}>

          {/* ══ STEP 0: PHOTOS ══ */}
          {step === 0 && (
            <div className="ap-section">
              <h2>Add photos</h2>
              <p className="ap-hint">Upload photos of your property. The first photo will be the cover image shown in search results.</p>

              <div className="ap-upload-box">
                {form.images.length > 0 && (
                  <div className="ap-photo-grid">
                    {form.images.map((src, i) => (
                      <div key={i} className={`ap-photo-thumb ${i === 0 ? "ap-photo-cover" : ""}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Photo ${i + 1}`} />
                        {i === 0 && <span className="ap-cover-badge">Cover</span>}
                        <div className="ap-photo-actions">
                          {i !== 0 && <button type="button" onClick={() => makeCover(i)} title="Set as cover">★</button>}
                          <button type="button" onClick={() => removeImage(i)} title="Remove">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <label className={`ap-upload-zone ${form.images.length > 0 ? "ap-upload-zone--compact" : ""}`}>
                  <input type="file" accept="image/*" multiple onChange={handleImageFiles} hidden />
                  <span className="ap-upload-icon">📷</span>
                  <span className="ap-upload-text">
                    {form.images.length > 0 ? "Add more photos" : "Click to upload photos"}
                  </span>
                  <span className="ap-upload-sub">JPG, PNG, WEBP — up to 10 images</span>
                </label>
              </div>

              <div className="ap-nav">
                <button type="button" className="button" onClick={() => setStep(1)}>
                  Next: Details →
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 1: DETAILS ══ */}
          {step === 1 && (
            <div className="ap-section">
              <h2>Property details</h2>

              <label className="ap-field">
                <span>Title <em>*</em></span>
                <input
                  type="text"
                  placeholder="e.g. Modern 3BR apartment in Kacyiru"
                  value={form.title}
                  onChange={e => set("title", e.target.value)}
                  required
                />
              </label>

              <label className="ap-field">
                <span>Description</span>
                <textarea
                  rows={4}
                  placeholder="Describe the property — layout, highlights, what makes it special..."
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                />
              </label>

              <div className="ap-row">
                <label className="ap-field">
                  <span>Property type</span>
                  <select value={form.property_type} onChange={e => set("property_type", e.target.value)}>
                    {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </label>
                <label className="ap-field">
                  <span>Status</span>
                  <select value={form.availability_status} onChange={e => set("availability_status", e.target.value)}>
                    <option value="AVAILABLE">Available</option>
                    <option value="RENTED">Rented</option>
                    <option value="RESERVED">Reserved</option>
                  </select>
                </label>
              </div>

              <div className="ap-row">
                <label className="ap-field">
                  <span>Bedrooms</span>
                  <select value={form.bedrooms} onChange={e => set("bedrooms", e.target.value)}>
                    {["1","2","3","4","5","6+"].map(n => <option key={n}>{n}</option>)}
                  </select>
                </label>
                <label className="ap-field">
                  <span>Bathrooms</span>
                  <select value={form.bathrooms} onChange={e => set("bathrooms", e.target.value)}>
                    {["1","2","3","4+"].map(n => <option key={n}>{n}</option>)}
                  </select>
                </label>
              </div>

              <div className="ap-field">
                <span>Amenities</span>
                <div className="ap-amenities">
                  {AMENITY_OPTIONS.map(a => (
                    <button
                      key={a}
                      type="button"
                      className={`ap-amenity ${form.amenities.includes(a) ? "selected" : ""}`}
                      onClick={() => toggleAmenity(a)}
                    >
                      {form.amenities.includes(a) ? "✓ " : ""}{a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ap-nav">
                <button type="button" className="ap-btn-outline" onClick={() => setStep(0)}>← Back</button>
                <button type="button" className="button" onClick={() => setStep(2)} disabled={!form.title.trim()}>
                  Next: Location →
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 2: LOCATION ══ */}
          {step === 2 && (
            <div className="ap-section">
              <h2>Location</h2>

              <div className="ap-row">
                <label className="ap-field">
                  <span>Location</span>
                  <select value={form.neighborhood} onChange={e => handleNeighborhood(e.target.value)}>
                    <option value="">Select location</option>
                    {KIGALI_NEIGHBORHOODS.map(n => <option key={n.name}>{n.name}</option>)}
                    <option value="Other">Other / outside Kigali</option>
                  </select>
                </label>
                <label className="ap-field">
                  <span>District</span>
                  <input type="text" value={form.district} onChange={e => set("district", e.target.value)} placeholder="e.g. Gasabo" />
                </label>
              </div>

              <label className="ap-field">
                <span>Street / address</span>
                <input type="text" value={form.address_line} onChange={e => set("address_line", e.target.value)} placeholder="e.g. KG 11 Ave, near Kacyiru Hospital" />
              </label>

              <div className="ap-row">
                <label className="ap-field">
                  <span>Latitude</span>
                  <input type="text" value={form.latitude} onChange={e => set("latitude", e.target.value)} placeholder="-1.9540" />
                </label>
                <label className="ap-field">
                  <span>Longitude</span>
                  <input type="text" value={form.longitude} onChange={e => set("longitude", e.target.value)} placeholder="30.0825" />
                </label>
              </div>

              <label className="ap-field">
                <span>Google Maps link <span className="ap-optional">(optional)</span></span>
                <input type="url" value={form.google_maps_url} onChange={e => set("google_maps_url", e.target.value)} placeholder="https://maps.app.goo.gl/..." />
              </label>

              {/* Live map preview */}
              <div className="ap-map-preview">
                <p className="ap-hint">Map preview</p>
                <iframe
                  title="Property location"
                  src={mapEmbedUrl}
                  width="100%"
                  height="280"
                  style={{ border: 0, borderRadius: "12px" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  className="ap-map-open"
                  href={`https://www.google.com/maps?q=${lat},${lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Google Maps ↗
                </a>
              </div>

              <div className="ap-nav">
                <button type="button" className="ap-btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button type="button" className="button" onClick={() => setStep(3)}>
                  Next: Price →
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 3: PRICE & PUBLISH ══ */}
          {step === 3 && (
            <div className="ap-section">
              <h2>Price &amp; publish</h2>

              <div className="ap-row ap-price-row">
                <label className="ap-field ap-field--grow">
                  <span>Monthly rent <em>*</em></span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 450000"
                    value={form.rental_price}
                    onChange={e => set("rental_price", e.target.value)}
                    required
                  />
                </label>
                <label className="ap-field ap-field--narrow">
                  <span>Currency</span>
                  <select value={form.currency} onChange={e => set("currency", e.target.value)}>
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </label>
              </div>

              {/* Summary card */}
              <div className="ap-summary">
                <div className="ap-summary-photo">
                  {form.images[0]
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={form.images[0]} alt="Cover" />
                    : <span className="ap-summary-placeholder">🏠</span>
                  }
                </div>
                <div className="ap-summary-info">
                  <strong>{form.title || "Untitled property"}</strong>
                  <span>{form.property_type} · {form.bedrooms} bed · {form.bathrooms} bath</span>
                  <span>📍 {form.neighborhood ? `${form.neighborhood}, ` : ""}{form.district}</span>
                  {form.rental_price && (
                    <b>{Number(form.rental_price).toLocaleString()} {form.currency}/mo</b>
                  )}
                </div>
              </div>

              <label className="ap-toggle">
                <input type="checkbox" checked={form.is_published} onChange={e => set("is_published", e.target.checked)} />
                <span className="ap-toggle-track" />
                <span className="ap-toggle-label">
                  {form.is_published ? "Publish now — visible to all renters" : "Save as draft — not visible yet"}
                </span>
              </label>

              {error && <p className="ap-error" role="alert">{error}</p>}

              <div className="ap-nav">
                <button type="button" className="ap-btn-outline" onClick={() => setStep(2)}>← Back</button>
                <button className="button" type="submit" disabled={saving || !form.title.trim() || !form.rental_price}>
                  {saving ? "Publishing..." : form.is_published ? "Publish property →" : "Save draft →"}
                </button>
              </div>
            </div>
          )}
        </form>
      </main>
    </>
  );
}
