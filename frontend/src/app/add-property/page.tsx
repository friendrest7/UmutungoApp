"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/layout";

const PROPERTY_TYPES_INFO = [
  { id: "HOUSE", label: "House", icon: "🏡", desc: "Standalone family home or compound" },
  { id: "APARTMENT", label: "Apartment", icon: "🏢", desc: "Modern flat or multi-unit residence" },
  { id: "VILLA", label: "Villa", icon: "🏰", desc: "Luxury residence with private garden" },
  { id: "STUDIO", label: "Studio", icon: "🛏️", desc: "Compact self-contained living space" },
  { id: "OFFICE", label: "Commercial", icon: "🏬", desc: "Office space, shop, or showroom" },
  { id: "LAND", label: "Land", icon: "🌿", desc: "Plot for development or residential use" },
];

const CURRENCIES = ["RWF", "USD"];

const SAMPLE_IMAGE_SETS = [
  {
    name: "Luxury Villa",
    icon: "🏰",
    images: [
      "/images/properties/kigali-villa.jpg",
      "/images/properties/hero-home.jpg",
      "/assets/reference1.jpg",
      "/assets/reference4.jpg",
    ],
  },
  {
    name: "Modern Apartment",
    icon: "🏢",
    images: [
      "/images/properties/kigali-apartment.jpg",
      "/assets/reference2.jpg",
      "/assets/reference3.jpg",
      "/assets/reference5.jpg",
    ],
  },
  {
    name: "Family Home",
    icon: "🏡",
    images: [
      "/images/properties/kigali-home.jpg",
      "/assets/reference6.jpg",
      "/images/properties/hero-home.jpg",
    ],
  },
];

const AMENITIES_CATALOG = [
  { id: "High-speed WiFi", icon: "📶" },
  { id: "24/7 Security Guard", icon: "🛡️" },
  { id: "Secure Parking", icon: "🚗" },
  { id: "Private Garden", icon: "🌳" },
  { id: "Swimming Pool", icon: "🏊" },
  { id: "Air Conditioning", icon: "❄️" },
  { id: "Backup Generator", icon: "⚡" },
  { id: "Hot Water Tank", icon: "💧" },
  { id: "Fully Furnished", icon: "🛋️" },
  { id: "DSTV / Cable TV", icon: "📺" },
  { id: "Washing Machine", icon: "🧺" },
  { id: "Balcony / Terrace", icon: "🌅" },
  { id: "Water Reserve Tank", icon: "🚰" },
  { id: "Pet Friendly", icon: "🐾" },
];

const POPULAR_NEIGHBORHOODS = [
  { name: "Kiyovu", district: "Nyarugenge", lat: -1.9536, lng: 30.0605 },
  { name: "Nyarutarama", district: "Gasabo", lat: -1.9360, lng: 30.0982 },
  { name: "Kimihurura", district: "Gasabo", lat: -1.9540, lng: 30.0825 },
  { name: "Kacyiru", district: "Gasabo", lat: -1.9355, lng: 30.0715 },
  { name: "Gacuriro", district: "Gasabo", lat: -1.9212, lng: 30.1065 },
  { name: "Kibagabaga", district: "Gasabo", lat: -1.9275, lng: 30.1158 },
  { name: "Remera", district: "Gasabo", lat: -1.9610, lng: 30.1145 },
  { name: "Gisozi", district: "Gasabo", lat: -1.9189, lng: 30.0638 },
  { name: "Nyamirambo", district: "Nyarugenge", lat: -1.9822, lng: 30.0461 },
  { name: "Kicukiro Centre", district: "Kicukiro", lat: -1.9705, lng: 30.1044 },
  { name: "Kanombe", district: "Kicukiro", lat: -1.9748, lng: 30.1395 },
  { name: "Gikondo", district: "Kicukiro", lat: -1.9768, lng: 30.0793 },
  { name: "Musanze Town", district: "Musanze", lat: -1.4988, lng: 29.6349 },
  { name: "Gisenyi Beach", district: "Rubavu", lat: -1.7029, lng: 29.2562 },
  { name: "Huye / Butare", district: "Huye", lat: -2.5967, lng: 29.7394 },
];

const RWANDA_DISTRICTS_LIST = [
  "Gasabo", "Kicukiro", "Nyarugenge", "Bugesera", "Gatsibo", "Kayonza", "Kirehe",
  "Ngoma", "Nyagatare", "Rwamagana", "Burera", "Gakenke", "Gicumbi", "Musanze",
  "Rulindo", "Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza",
  "Nyaruguru", "Ruhango", "Karongi", "Ngororero", "Nyabihu", "Nyamasheke",
  "Rubavu", "Rusizi", "Rutsiro",
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
  title: "",
  description: "",
  property_type: "HOUSE",
  rental_price: "",
  currency: "RWF",
  bedrooms: "2",
  bathrooms: "1",
  district: "Gasabo",
  neighborhood: "Kimihurura",
  address_line: "",
  latitude: "-1.9540",
  longitude: "30.0825",
  google_maps_url: "",
  availability_status: "AVAILABLE",
  is_published: true,
  amenities: ["High-speed WiFi", "Secure Parking", "Hot Water Tank"],
  images: ["/images/properties/kigali-villa.jpg"],
};

// ── Steps ────────────────────────────────────────────────────
const STEPS = [
  { id: 0, label: "Photos", icon: "📸" },
  { id: 1, label: "Details", icon: "🏡" },
  { id: 2, label: "Location", icon: "📍" },
  { id: 3, label: "Pricing & Review", icon: "💎" },
];

export default function AddPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [deposit, setDeposit] = useState("1 Month Deposit");
  const accountStorageKey = session?.user?.id
    ? `inzuhub_custom_properties:${session.user.id}`
    : session?.user?.email
      ? `inzuhub_custom_properties:${session.user.email.toLowerCase()}`
      : null;

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function toggleAmenity(a: string) {
    set(
      "amenities",
      form.amenities.includes(a)
        ? form.amenities.filter((x) => x !== a)
        : [...form.amenities, a]
    );
  }

  function handleNeighborhood(name: string) {
    const found = POPULAR_NEIGHBORHOODS.find((n) => n.name === name);
    if (found) {
      setForm((f) => ({
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
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          set("images", [...form.images, ev.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files ?? []).filter((f) =>
      f.type.startsWith("image/")
    );
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          set("images", [...form.images, ev.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function addCustomImageUrl() {
    const url = customImageUrl.trim();
    if (!url) return;
    set("images", [...form.images, url]);
    setCustomImageUrl("");
  }

  function applySampleImages(images: string[]) {
    set("images", images);
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

    const staffRole = ["OWNER", "AGENT", "ADMIN"].includes(session.user.role ?? "");
    const publishListing = form.is_published && staffRole;

    const lat = form.latitude ? parseFloat(form.latitude) : null;
    const lng = form.longitude ? parseFloat(form.longitude) : null;
    const mapsUrl =
      form.google_maps_url ||
      (lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : undefined);

    const payload = {
      title: form.title,
      description: form.description,
      property_type: form.property_type,
      rental_price: Number(form.rental_price) || 0,
      currency: form.currency,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 1,
      district: form.district,
      neighborhood: form.neighborhood,
      address_line: form.address_line,
      latitude: lat,
      longitude: lng,
      google_maps_url: mapsUrl,
      availability_status: form.availability_status,
      is_published: publishListing,
      image_urls: form.images.length ? form.images : ["/images/properties/hero-home.jpg"],
      amenities: form.amenities,
    };

    // Save locally for instant search visibility
    try {
      const raw = accountStorageKey ? localStorage.getItem(accountStorageKey) : null;
      const list = raw ? JSON.parse(raw) : [];
      const item = {
        ...payload,
        id: `prop-${Date.now()}`,
        verification_status: "VERIFIED",
        created_at: new Date().toISOString(),
        cover_image_url: payload.image_urls[0],
      };
      if (accountStorageKey) localStorage.setItem(accountStorageKey, JSON.stringify([item, ...list]));
      window.dispatchEvent(new CustomEvent("inzuhub:property-updated", { detail: item }));
    } catch {
      /* ignore */
    }

    // Submit to API
    try {
      await fetch("/api/owner/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      /* backend offline — local save is enough */
    }

    setSaving(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="ap-page-wrapper">
        <SiteHeader variant="minimal" />
        <main className="ap-container">
          <div className="ap-success-card">
            <div className="ap-celebrate-icon">🎉</div>
            <h1 className="ap-success-title">Property Listed!</h1>
            <p className="ap-success-desc">
              Your property <strong>{form.title}</strong> is now {form.is_published && session?.user?.role !== "TENANT" ? "live and searchable by tenants across Rwanda" : "saved as a draft in your portal for review"}.
            </p>
            <div className="ap-success-actions-row">
              <Link className="button" href="/homes">
                Explore in Search →
              </Link>
              <button
                className="ap-btn-back"
                type="button"
                onClick={() => router.push("/dashboard/owner")}
              >
                Owner Dashboard ↗
              </button>
              <button
                className="ap-btn-back"
                type="button"
                onClick={() => {
                  setForm(empty);
                  setDone(false);
                  setStep(0);
                }}
              >
                ＋ List Another Property
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const lat = form.latitude ? parseFloat(form.latitude) : -1.954;
  const lng = form.longitude ? parseFloat(form.longitude) : 30.0825;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  const formattedPrice = form.rental_price
    ? `${Number(form.rental_price).toLocaleString()} ${form.currency}/mo`
    : "";

  return (
    <div className="ap-page-wrapper">
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
              Your property details are safely preserved. Sign in to save your listing and submit it for review.
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

      <main className="ap-container">
        {/* Top bar with Smart Back button & Studio Badge */}
        <div className="ap-top-nav">
          <Link
            href={session ? "/dashboard/owner" : "/"}
            className="ap-back-link"
          >
            ← {session?.user?.role === "OWNER" ? "Back to Owner Dashboard" : "Back to Umutungo"}
          </Link>
          <span className="ap-badge-pill">
            <span className="ap-pulse-dot" /> Listing Studio
          </span>
        </div>

        <div className="ap-header">
          <h1 className="ap-title">List your property</h1>
          <p className="ap-subtitle">
            Share your space with thousands of verified renters and commissioners across Kigali and Rwanda.
          </p>
        </div>

        {/* ── Modern Stepper Card with Progress Bar ── */}
        <div className="ap-stepper-card">
          <div className="ap-progress-bar-wrap">
            <div
              className="ap-progress-bar-fill"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <nav className="ap-steps-list" aria-label="Creation steps">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`ap-step-btn ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}
                onClick={() => setStep(i)}
              >
                <span className="ap-step-badge">{i < step ? "✓" : i + 1}</span>
                <span className="ap-step-text">{s.icon} {s.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <form className="ap-form-card" onSubmit={handleSubmit}>
          {/* ══ STEP 0: PHOTOS ══ */}
          {step === 0 && (
            <div className="ap-step-content">
              <div className="ap-section-head">
                <h2 className="ap-section-title">Property Photos</h2>
                <p className="ap-section-desc">
                  High quality photos build renter trust. The first photo will be showcased as the cover image in discovery and search.
                </p>
              </div>

              <div className="ap-protip">
                <span className="ap-protip-icon">💡</span>
                <div>
                  <strong>Pro tip:</strong> Listings with bright exterior shots and clean room photos receive 3x more viewing requests.
                </div>
              </div>

              {/* Sample Photo Presets */}
              <div className="ap-presets-row">
                <span className="ap-presets-label">⚡ Quick load sample photo sets:</span>
                {SAMPLE_IMAGE_SETS.map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    className="ap-preset-pill"
                    onClick={() => applySampleImages(sample.images)}
                  >
                    <span>{sample.icon}</span>
                    <span>{sample.name}</span>
                  </button>
                ))}
              </div>

              {/* Drag and Drop Zone */}
              <label
                className={`ap-dropzone ${isDragging ? "dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input type="file" accept="image/*" multiple onChange={handleImageFiles} hidden />
                <span className="ap-dropzone-icon">📸</span>
                <p className="ap-dropzone-text">
                  {form.images.length > 0 ? "Add more photos" : "Drag and drop photos here, or click to browse"}
                </p>
                <p className="ap-dropzone-sub">Supports JPG, PNG, WEBP — up to 10 high-resolution images</p>
              </label>

              {/* Or Add Image by Web URL */}
              <div className="ap-url-input-row">
                <input
                  type="url"
                  className="ap-url-input"
                  placeholder="Paste direct image URL (e.g. https://...)..."
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                />
                <button
                  type="button"
                  className="ap-url-btn"
                  onClick={addCustomImageUrl}
                  disabled={!customImageUrl.trim()}
                >
                  ＋ Add URL
                </button>
              </div>

              {/* Uploaded Photos Gallery */}
              {form.images.length > 0 && (
                <div>
                  <div className="ap-gallery-header">
                    <span className="ap-gallery-count">
                      {form.images.length} photo{form.images.length !== 1 ? "s" : ""} selected
                    </span>
                    <span className="ap-char-count">Click ★ to set as cover</span>
                  </div>
                  <div className="ap-gallery-grid">
                    {form.images.map((src, i) => (
                      <div
                        key={i}
                        className={`ap-thumb-card ${i === 0 ? "is-cover" : ""}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Property upload ${i + 1}`} className="ap-thumb-img" />
                        {i === 0 && <span className="ap-cover-tag">★ Cover</span>}
                        <div className="ap-thumb-actions">
                          {i !== 0 && (
                            <button
                              type="button"
                              className="ap-thumb-btn"
                              onClick={() => makeCover(i)}
                              title="Set as main cover"
                            >
                              ★
                            </button>
                          )}
                          <button
                            type="button"
                            className="ap-thumb-btn btn-delete"
                            onClick={() => removeImage(i)}
                            title="Delete photo"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="ap-actions-bar">
                <button
                  type="button"
                  className="ap-btn-back"
                  onClick={() => router.push(session?.user?.role === "OWNER" ? "/dashboard/owner" : "/")}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ap-btn-next"
                  onClick={() => setStep(1)}
                  disabled={form.images.length === 0}
                >
                  Continue: Details →
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 1: DETAILS ══ */}
          {step === 1 && (
            <div className="ap-step-content">
              <div className="ap-section-head">
                <h2 className="ap-section-title">Property Details</h2>
                <p className="ap-section-desc">
                  Provide the core features, room layout, and highlights of your rental property.
                </p>
              </div>

              {/* Visual Property Type Cards */}
              <div className="ap-field-group">
                <label className="ap-label">
                  <span>Property Type <em className="ap-req">*</em></span>
                </label>
                <div className="ap-type-grid">
                  {PROPERTY_TYPES_INFO.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`ap-type-card ${form.property_type === t.id ? "selected" : ""}`}
                      onClick={() => set("property_type", t.id)}
                    >
                      <div className="ap-type-top">
                        <span className="ap-type-icon">{t.icon}</span>
                        {form.property_type === t.id && (
                          <span className="ap-type-check">✓</span>
                        )}
                      </div>
                      <span className="ap-type-label">{t.label}</span>
                      <span className="ap-type-desc">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="ap-field-group">
                <label className="ap-label">
                  <span>Listing Title <em className="ap-req">*</em></span>
                  <span className="ap-char-count">{form.title.length}/80</span>
                </label>
                <input
                  type="text"
                  className="ap-input"
                  placeholder="e.g. Modern 3BR Villa with Private Garden in Kimihurura"
                  value={form.title}
                  maxLength={80}
                  onChange={(e) => set("title", e.target.value)}
                  required
                />
                <div className="ap-idea-chips">
                  <span className="ap-presets-label">Suggestions:</span>
                  {[
                    "Furnished 2BR Apartment in Kacyiru",
                    "Spacious Villa with Garden in Kibagabaga",
                    "Quiet Family Home in Remera",
                  ].map((sugg) => (
                    <button
                      key={sugg}
                      type="button"
                      className="ap-idea-chip"
                      onClick={() => set("title", sugg)}
                    >
                      ＋ {sugg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="ap-field-group">
                <label className="ap-label">
                  <span>Description</span>
                  <span className="ap-char-count">Optional but recommended</span>
                </label>
                <textarea
                  className="ap-textarea"
                  rows={4}
                  placeholder="Describe your property — layout, natural lighting, quiet surroundings, water tanks, proximity to markets or tarmac roads..."
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>

              {/* Rooms: Bedrooms & Bathrooms Pills */}
              <div className="ap-grid-2">
                <div className="ap-field-group">
                  <label className="ap-label">
                    <span>Bedrooms</span>
                  </label>
                  <div className="ap-pill-row">
                    {[
                      { val: "0", label: "Studio" },
                      { val: "1", label: "1" },
                      { val: "2", label: "2" },
                      { val: "3", label: "3" },
                      { val: "4", label: "4" },
                      { val: "5", label: "5+" },
                    ].map((b) => (
                      <button
                        key={b.val}
                        type="button"
                        className={`ap-pill-btn ${form.bedrooms === b.val ? "selected" : ""}`}
                        onClick={() => set("bedrooms", b.val)}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ap-field-group">
                  <label className="ap-label">
                    <span>Bathrooms</span>
                  </label>
                  <div className="ap-pill-row">
                    {["1", "2", "3", "4+"].map((bath) => (
                      <button
                        key={bath}
                        type="button"
                        className={`ap-pill-btn ${form.bathrooms === bath ? "selected" : ""}`}
                        onClick={() => set("bathrooms", bath)}
                      >
                        {bath}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Availability Status */}
              <div className="ap-field-group">
                <label className="ap-label">
                  <span>Availability Status</span>
                </label>
                <div className="ap-pill-row">
                  {[
                    { id: "AVAILABLE", label: "🟢 Available Now" },
                    { id: "RESERVED", label: "🟡 Reserved" },
                    { id: "RENTED", label: "🔴 Rented" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      className={`ap-pill-btn ${form.availability_status === st.id ? "selected" : ""}`}
                      onClick={() => set("availability_status", st.id)}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities Grid with Icons */}
              <div className="ap-field-group">
                <label className="ap-label">
                  <span>Key Amenities &amp; Features</span>
                  <span className="ap-char-count">{form.amenities.length} selected</span>
                </label>
                <div className="ap-amenities-grid">
                  {AMENITIES_CATALOG.map((item) => {
                    const isSelected = form.amenities.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`ap-amenity-card ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleAmenity(item.id)}
                      >
                        <span className="ap-amenity-icon">{item.icon}</span>
                        <span>{item.id}</span>
                        {isSelected && <span className="ap-amenity-check">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="ap-actions-bar">
                <button type="button" className="ap-btn-back" onClick={() => setStep(0)}>
                  ← Back to Photos
                </button>
                <button
                  type="button"
                  className="ap-btn-next"
                  onClick={() => setStep(2)}
                  disabled={!form.title.trim()}
                >
                  Continue: Location →
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 2: LOCATION ══ */}
          {step === 2 && (
            <div className="ap-step-content">
              <div className="ap-section-head">
                <h2 className="ap-section-title">Property Location</h2>
                <p className="ap-section-desc">
                  Help renters pinpoint your neighbourhood. Accurate coordinates provide instant interactive Google Maps navigation.
                </p>
              </div>

              {/* Popular Kigali & Rwanda Location Chips */}
              <div className="ap-field-group">
                <label className="ap-label">
                  <span>Popular Locations (click for 1-click pin)</span>
                </label>
                <div className="ap-neighborhood-pills">
                  {POPULAR_NEIGHBORHOODS.map((nh) => (
                    <button
                      key={nh.name}
                      type="button"
                      className={`ap-neighborhood-chip ${form.neighborhood === nh.name ? "selected" : ""}`}
                      onClick={() => handleNeighborhood(nh.name)}
                    >
                      📍 {nh.name} ({nh.district})
                    </button>
                  ))}
                </div>
              </div>

              {/* District & Neighborhood Row */}
              <div className="ap-grid-2">
                <div className="ap-field-group">
                  <label className="ap-label">
                    <span>District <em className="ap-req">*</em></span>
                  </label>
                  <select
                    className="ap-select"
                    value={form.district}
                    onChange={(e) => set("district", e.target.value)}
                  >
                    {RWANDA_DISTRICTS_LIST.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ap-field-group">
                  <label className="ap-label">
                    <span>Neighborhood / Sector</span>
                  </label>
                  <input
                    type="text"
                    className="ap-input"
                    placeholder="e.g. Kimihurura, Kiyovu, Kacyiru"
                    value={form.neighborhood}
                    onChange={(e) => set("neighborhood", e.target.value)}
                  />
                </div>
              </div>

              {/* Street Address */}
              <div className="ap-field-group">
                <label className="ap-label">
                  <span>Street / Landmark / Address</span>
                </label>
                <input
                  type="text"
                  className="ap-input"
                  placeholder="e.g. KG 11 Ave, near Kacyiru Primary School or Papyrus"
                  value={form.address_line}
                  onChange={(e) => set("address_line", e.target.value)}
                />
              </div>

              {/* Coordinates */}
              <div className="ap-grid-2">
                <div className="ap-field-group">
                  <label className="ap-label">
                    <span>Latitude</span>
                  </label>
                  <input
                    type="text"
                    className="ap-input"
                    placeholder="-1.9540"
                    value={form.latitude}
                    onChange={(e) => set("latitude", e.target.value)}
                  />
                </div>
                <div className="ap-field-group">
                  <label className="ap-label">
                    <span>Longitude</span>
                  </label>
                  <input
                    type="text"
                    className="ap-input"
                    placeholder="30.0825"
                    value={form.longitude}
                    onChange={(e) => set("longitude", e.target.value)}
                  />
                </div>
              </div>

              {/* Google Maps Link */}
              <div className="ap-field-group">
                <label className="ap-label">
                  <span>Google Maps Share Link <span className="ap-char-count">(Optional)</span></span>
                </label>
                <input
                  type="url"
                  className="ap-input"
                  placeholder="https://maps.app.goo.gl/..."
                  value={form.google_maps_url}
                  onChange={(e) => set("google_maps_url", e.target.value)}
                />
              </div>

              {/* Live Interactive Map Preview Card */}
              <div className="ap-map-container">
                <div className="ap-map-header">
                  <span className="ap-map-header-title">
                    📍 Live Map Preview · {form.neighborhood || "Kigali"}, {form.district}
                  </span>
                  <a
                    className="ap-map-open-link"
                    href={`https://www.google.com/maps?q=${lat},${lng}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Google Maps ↗
                  </a>
                </div>
                <iframe
                  title="Property map coordinates"
                  src={mapEmbedUrl}
                  className="ap-map-iframe"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="ap-actions-bar">
                <button type="button" className="ap-btn-back" onClick={() => setStep(1)}>
                  ← Back to Details
                </button>
                <button type="button" className="ap-btn-next" onClick={() => setStep(3)}>
                  Continue: Price &amp; Review →
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 3: PRICE & REVIEW ══ */}
          {step === 3 && (
            <div className="ap-step-content">
              <div className="ap-section-head">
                <h2 className="ap-section-title">Pricing &amp; Review</h2>
                <p className="ap-section-desc">
                  Set your rental terms and preview how your property card will appear to thousands of renters.
                </p>
              </div>

              {/* Monthly Rent & Currency Switcher */}
              <div className="ap-field-group">
                <label className="ap-label">
                  <span>Monthly Rental Rate <em className="ap-req">*</em></span>
                </label>
                <div className="ap-price-wrap">
                  <div className="ap-price-input-box">
                    <input
                      type="number"
                      min="0"
                      className="ap-input ap-price-input"
                      placeholder="e.g. 500000"
                      value={form.rental_price}
                      onChange={(e) => set("rental_price", e.target.value)}
                      required
                    />
                  </div>
                  <div className="ap-currency-toggle" role="radiogroup" aria-label="Currency selection">
                    {CURRENCIES.map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        className={`ap-currency-btn ${form.currency === curr ? "selected" : ""}`}
                        onClick={() => set("currency", curr)}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>
                {formattedPrice && (
                  <span className="ap-price-readout">
                    💰 Set to: <strong>{formattedPrice}</strong>
                  </span>
                )}
              </div>

              {/* Security Deposit Selector */}
              <div className="ap-field-group">
                <label className="ap-label">
                  <span>Security Deposit (Standard Practice)</span>
                </label>
                <div className="ap-pill-row">
                  {["None", "1 Month Deposit", "2 Months Deposit"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`ap-pill-btn ${deposit === opt ? "selected" : ""}`}
                      onClick={() => setDeposit(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Card Preview */}
              <div className="ap-preview-section">
                <div className="ap-preview-badge-row">
                  <span className="ap-preview-title">👀 Live Listing Card Preview</span>
                  <span className="ap-char-count">As seen by renters</span>
                </div>

                <article className="ap-live-card">
                  <div className="ap-live-card-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.images[0] || "/images/properties/hero-home.jpg"}
                      alt="Property card preview"
                      className="ap-live-card-img"
                    />
                    <span className="ap-live-badge">
                      {form.property_type} · Verified
                    </span>
                  </div>
                  <div className="ap-live-card-body">
                    <h3 className="ap-live-card-title">{form.title || "Untitled Property Listing"}</h3>
                    <p className="ap-live-card-meta">
                      📍 {form.neighborhood ? `${form.neighborhood}, ` : ""}{form.district} · 🛏 {form.bedrooms} beds · 🚿 {form.bathrooms} baths
                    </p>
                    <div className="ap-live-card-price">
                      {form.rental_price ? (
                        <>
                          {Number(form.rental_price).toLocaleString()} <small>{form.currency}/mo</small>
                        </>
                      ) : (
                        <span style={{ color: "#888" }}>Price on request</span>
                      )}
                    </div>
                  </div>
                </article>
              </div>

              {/* Publish Immediately Switch */}
              <label className="ap-switch-row">
                <div className="ap-switch-info">
                  <span className="ap-switch-title">
                    {form.is_published ? "Publish Immediately (Recommended)" : "Save as Draft"}
                  </span>
                  <span className="ap-switch-desc">
                    {form.is_published
                      ? "Your property listing will be immediately searchable on the homepage and search index."
                      : "The listing will remain saved in your dashboard and hidden from renters until you publish."}
                  </span>
                </div>
                <input
                  type="checkbox"
                  className="ap-switch-input"
                  checked={form.is_published}
                  onChange={(e) => set("is_published", e.target.checked)}
                />
                <span className="ap-switch-slider" />
              </label>

              {error && <p className="ap-error" role="alert">{error}</p>}

              <div className="ap-actions-bar">
                <button type="button" className="ap-btn-back" onClick={() => setStep(2)}>
                  ← Back to Location
                </button>
                <button
                  type="submit"
                  className="ap-btn-next"
                  disabled={saving || !form.title.trim() || !form.rental_price}
                >
                  {saving
                    ? "Publishing..."
                    : form.is_published
                    ? "🚀 Publish Property Now"
                    : "💾 Save Draft"}
                </button>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
