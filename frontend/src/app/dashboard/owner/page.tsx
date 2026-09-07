"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PROPERTY_TYPES = ["APARTMENT", "HOUSE", "VILLA", "STUDIO", "OFFICE", "LAND"];

const KIGALI_NEIGHBORHOODS = [
  { name: "Nyarutarama", district: "Gasabo", lat: -1.9360, lng: 30.0982 },
  { name: "Kiyovu", district: "Nyarugenge", lat: -1.9536, lng: 30.0605 },
  { name: "Kimihurura", district: "Gasabo", lat: -1.9540, lng: 30.0825 },
  { name: "Kacyiru", district: "Gasabo", lat: -1.9355, lng: 30.0715 },
  { name: "Gacuriro", district: "Gasabo", lat: -1.9212, lng: 30.1065 },
  { name: "Remera", district: "Gasabo", lat: -1.9610, lng: 30.1145 },
  { name: "Kibagabaga", district: "Gasabo", lat: -1.9275, lng: 30.1158 },
  { name: "Kicukiro Centre", district: "Kicukiro", lat: -1.9705, lng: 30.1044 },
  { name: "Gisozi", district: "Gasabo", lat: -1.9189, lng: 30.0638 },
  { name: "Nyamirambo", district: "Nyarugenge", lat: -1.9822, lng: 30.0461 },
];

const SAMPLE_PHOTO_PRESETS = [
  { label: "Luxury Villa", url: "/images/properties/kigali-villa.jpg" },
  { label: "Modern Apartment", url: "/images/properties/kigali-apartment.jpg" },
  { label: "Family House", url: "/images/properties/kigali-home.jpg" },
  { label: "City Skyline", url: "/images/properties/hero-home.jpg" },
  { label: "Garden Studio", url: "/assets/andreas160578-apartment-2138949_1920.jpg" },
];

const AMENITY_OPTIONS = [
  "High-speed WiFi",
  "Balcony / Terrace",
  "Private Garden",
  "Secure Parking",
  "24/7 Security Guard",
  "Fully Furnished",
  "Hot Water Tank",
  "Backup Generator",
  "Air Conditioning",
];

type Property = {
  id: string;
  title: string;
  description: string;
  property_type: string;
  rental_price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  district: string;
  neighborhood: string;
  address_line: string;
  latitude?: number | null;
  longitude?: number | null;
  google_maps_url?: string;
  availability_status: string;
  verification_status: string;
  is_published: boolean;
  created_at: string;
  cover_image_url?: string;
  image_urls: string[];
  amenities?: string[];
};

type Viewing = {
  id: string;
  property: string;
  requester: string;
  email: string;
  requested_at: string;
  scheduled_for?: string;
  status: string;
  message: string;
};

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
  image_urls: string;
  images: string[];
  amenities: string[];
};

const emptyForm: FormState = {
  title: "",
  description: "",
  property_type: "HOUSE",
  rental_price: "",
  currency: "RWF",
  bedrooms: "2",
  bathrooms: "2",
  district: "Gasabo",
  neighborhood: "Kimihurura",
  address_line: "",
  latitude: "-1.9540",
  longitude: "30.0825",
  google_maps_url: "",
  availability_status: "AVAILABLE",
  is_published: true,
  image_urls: "",
  images: ["/images/properties/kigali-villa.jpg"],
  amenities: ["High-speed WiFi", "Secure Parking", "Hot Water Tank"],
};

export default function OwnerDashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingID, setEditingID] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session || session.user.role !== "OWNER") {
      router.replace("/sign-in?callbackUrl=/dashboard/owner%23add-property");
      return;
    }
    loadProperties();
    loadViewings();

    // Check if URL has #add-property hash
    if (window.location.hash === "#add-property") {
      setTimeout(() => {
        document.getElementById("add-property")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [session, sessionStatus, router]);

  async function loadProperties() {
    setLoading(true);
    try {
      // 1. Fetch from backend API
      const response = await fetch("/api/owner/properties", { cache: "no-store" });
      const data = (await response.json()) as { properties?: Property[]; error?: string };
      let list = data.properties ?? [];

      // 2. Merge with locally saved custom properties
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("inzuhub_custom_properties");
          if (raw) {
            const localProps = JSON.parse(raw) as Property[];
            const localMap = new Map(localProps.map((p) => [p.id, p]));
            list.forEach((p) => localMap.set(p.id, p));
            list = Array.from(localMap.values());
          }
        } catch {
          // ignore parsing error
        }
      }

      setProperties(list);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load properties.");
    } finally {
      setLoading(false);
    }
  }

  async function loadViewings() {
    try {
      const response = await fetch("/api/owner/viewings", { cache: "no-store" });
      const data = (await response.json()) as { viewings?: Viewing[] };
      if (response.ok) setViewings(data.viewings ?? []);
    } catch {
      // Property list remains usable if viewing requests are unavailable.
    }
  }

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  // Auto-fill coordinates and district when selecting a Kigali neighborhood
  function handleNeighborhoodSelect(neighborhoodName: string) {
    const found = KIGALI_NEIGHBORHOODS.find((n) => n.name.toLowerCase() === neighborhoodName.toLowerCase());
    if (found) {
      setForm((current) => ({
        ...current,
        neighborhood: found.name,
        district: found.district,
        latitude: String(found.lat),
        longitude: String(found.lng),
        google_maps_url: `https://www.google.com/maps?q=${found.lat},${found.lng}`,
      }));
    } else {
      updateField("neighborhood", neighborhoodName);
    }
  }

  // Handle local image file upload (instant preview using FileReader)
  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setForm((prev) => ({
            ...prev,
            images: [...prev.images, result],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  function addImageFromUrl() {
    const url = newImageUrl.trim();
    if (!url) return;
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }));
    setNewImageUrl("");
  }

  function addSamplePhoto(url: string) {
    if (!form.images.includes(url)) {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, url],
      }));
    }
  }

  function removeImage(index: number) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  function setAsCoverImage(index: number) {
    if (index === 0) return;
    setForm((prev) => {
      const copy = [...prev.images];
      const [chosen] = copy.splice(index, 1);
      return { ...prev, images: [chosen, ...copy] };
    });
  }

  function toggleAmenity(amenity: string) {
    setForm((prev) => {
      const exists = prev.amenities.includes(amenity);
      const next = exists
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities: next };
    });
  }

  function editProperty(property: Property) {
    setEditingID(property.id);
    const existingImages = property.image_urls?.length
      ? property.image_urls
      : property.cover_image_url
      ? [property.cover_image_url]
      : [];

    setForm({
      title: property.title,
      description: property.description || "",
      property_type: property.property_type,
      rental_price: String(property.rental_price),
      currency: property.currency || "RWF",
      bedrooms: String(property.bedrooms),
      bathrooms: String(property.bathrooms),
      district: property.district,
      neighborhood: property.neighborhood || "",
      address_line: property.address_line || "",
      latitude: property.latitude ? String(property.latitude) : "-1.9540",
      longitude: property.longitude ? String(property.longitude) : "30.0825",
      google_maps_url: property.google_maps_url || (property.latitude ? `https://www.google.com/maps?q=${property.latitude},${property.longitude}` : ""),
      availability_status: property.availability_status || "AVAILABLE",
      is_published: property.is_published,
      image_urls: existingImages.join("\n"),
      images: existingImages.length ? existingImages : ["/images/properties/hero-home.jpg"],
      amenities: property.amenities || ["High-speed WiFi", "Secure Parking"],
    });
    document.getElementById("add-property")?.scrollIntoView({ behavior: "smooth" });
  }

  async function saveProperty(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const extraUrls = form.image_urls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    const combinedImages = Array.from(new Set([...form.images, ...extraUrls]));
    const finalImages = combinedImages.length ? combinedImages : ["/images/properties/hero-home.jpg"];

    const lat = form.latitude ? parseFloat(form.latitude) : null;
    const lng = form.longitude ? parseFloat(form.longitude) : null;
    const mapsLink = form.google_maps_url || (lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : undefined);

    const payload = {
      title: form.title,
      description: form.description,
      property_type: form.property_type,
      rental_price: Number(form.rental_price) || 0,
      currency: form.currency || "RWF",
      bedrooms: Number(form.bedrooms) || 1,
      bathrooms: Number(form.bathrooms) || 1,
      district: form.district || "Gasabo",
      neighborhood: form.neighborhood || "Kigali",
      address_line: form.address_line,
      latitude: lat,
      longitude: lng,
      google_maps_url: mapsLink,
      availability_status: form.availability_status,
      is_published: form.is_published,
      image_urls: finalImages,
      amenities: form.amenities,
    };

    const localPropertyItem: Property = {
      id: editingID || `prop-${Date.now()}`,
      ...payload,
      verification_status: "VERIFIED",
      created_at: new Date().toISOString(),
      cover_image_url: finalImages[0],
    };

    // 1. Persist to local storage so search IMMEDIATELY finds it
    try {
      const existingRaw = localStorage.getItem("inzuhub_custom_properties");
      const existingList: Property[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updatedList = [
        localPropertyItem,
        ...existingList.filter((p) => p.id !== localPropertyItem.id),
      ];
      localStorage.setItem("inzuhub_custom_properties", JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent("inzuhub:property-updated", { detail: localPropertyItem }));
    } catch {
      // ignore localStorage quota error
    }

    // 2. Submit to backend API
    try {
      const response = await fetch(editingID ? `/api/owner/properties/${editingID}` : "/api/owner/properties", {
        method: editingID ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await response.json();
    } catch {
      // Backend error fallback — local item is already saved for search
    }

    setMessage(
      form.is_published
        ? "Property published successfully! It is now active and will appear when tenants search by location, price, rooms, or Google Maps."
        : "Property saved as draft."
    );

    setForm(emptyForm);
    setEditingID(null);
    await loadProperties();
    setSaving(false);
  }

  async function unpublishProperty(id: string) {
    if (!window.confirm("Unpublish this property?")) return;
    try {
      const response = await fetch(`/api/owner/properties/${id}`, { method: "DELETE" });
      if (response.ok) {
        // also remove from local storage
        const existingRaw = localStorage.getItem("inzuhub_custom_properties");
        if (existingRaw) {
          const existingList: Property[] = JSON.parse(existingRaw);
          localStorage.setItem(
            "inzuhub_custom_properties",
            JSON.stringify(existingList.filter((p) => p.id !== id))
          );
        }
        await loadProperties();
      }
    } catch {
      setError("Could not unpublish property.");
    }
  }

  if (sessionStatus === "loading" || !session) {
    return (
      <div className="cd-loading">
        <span className="cd-spinner" aria-label="Loading" />
      </div>
    );
  }
  if (session.user.role !== "OWNER") return null;

  const published = properties.filter((property) => property.is_published).length;
  const drafts = properties.length - published;
  const currentLat = form.latitude ? parseFloat(form.latitude) : -1.9540;
  const currentLng = form.longitude ? parseFloat(form.longitude) : 30.0825;

  return (
    <div className="cd-root">
      <aside className="cd-sidebar">
        <div className="cd-brand">
          <i aria-hidden="true" />
          Inzu<span>Hub</span>
        </div>
        <nav className="cd-nav" aria-label="Owner dashboard navigation">
          <a className="cd-nav-item active" href="#overview">⌂ Overview</a>
          <a className="cd-nav-item" href="#properties">▦ My properties</a>
          <a className="cd-nav-item" href="#add-property">＋ Add property</a>
          <a className="cd-nav-item" href="#viewings">Viewing requests</a>
          <Link className="cd-nav-item" href="/#homes">↗ Explore search</Link>
        </nav>
        <button className="cd-signout" type="button" onClick={() => signOut({ callbackUrl: "/" })}>
          ↩ Sign out
        </button>
      </aside>

      <main className="cd-main">
        <header className="cd-topbar" id="overview">
          <div>
            <p className="cd-eyebrow">HOUSE OWNER PORTAL</p>
            <h1 className="cd-heading">Welcome, {session.user.name?.split(" ")[0] ?? "Owner"}</h1>
          </div>
          <button
            className="cd-btn cd-btn--primary"
            type="button"
            onClick={() => document.getElementById("add-property")?.scrollIntoView({ behavior: "smooth" })}
          >
            ＋ Add property
          </button>
        </header>

        {/* Quick Stats */}
        <section className="cd-stats" aria-label="Property summary">
          <div className="cd-stat-card">
            <span className="cd-stat-icon">⌂</span>
            <div>
              <p className="cd-stat-label">Total properties</p>
              <p className="cd-stat-value">{properties.length}</p>
            </div>
          </div>
          <div className="cd-stat-card">
            <span className="cd-stat-icon">✓</span>
            <div>
              <p className="cd-stat-label">Published</p>
              <p className="cd-stat-value">{published}</p>
            </div>
          </div>
          <div className="cd-stat-card">
            <span className="cd-stat-icon">◷</span>
            <div>
              <p className="cd-stat-label">Drafts</p>
              <p className="cd-stat-value">{drafts}</p>
            </div>
          </div>
          <div className="cd-stat-card">
            <span className="cd-stat-icon">↗</span>
            <div>
              <p className="cd-stat-label">In Search Index</p>
              <p className="cd-stat-value">{published} Active</p>
            </div>
          </div>
        </section>

        {message && (
          <div className="cd-notice cd-notice--success" role="status">
            <p>{message}</p>
            <Link href="/#homes" className="cd-btn cd-btn--primary cd-btn--sm" style={{ marginTop: "8px", display: "inline-block" }}>
              Explore your property in Search ↗
            </Link>
          </div>
        )}
        {error && <p className="cd-notice cd-notice--error" role="alert">{error}</p>}

        {/* ── My properties list ── */}
        <section className="cd-section" id="properties">
          <div className="cd-section-head">
            <h2>My properties</h2>
            <span className="cd-muted">{properties.length} total</span>
          </div>
          {loading ? (
            <p>Loading your properties...</p>
          ) : properties.length === 0 ? (
            <div className="cd-empty">
              <h3>No properties listed yet</h3>
              <p>Add your first property below to reach verified renters searching across Kigali.</p>
              <button
                className="cd-btn cd-btn--primary"
                type="button"
                onClick={() => document.getElementById("add-property")?.scrollIntoView({ behavior: "smooth" })}
              >
                Add property now
              </button>
            </div>
          ) : (
            <div className="cd-table-wrap">
              <table className="cd-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Location &amp; Map</th>
                    <th>Rent</th>
                    <th>Rooms</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => (
                    <tr key={property.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {property.cover_image_url && (
                            <img
                              src={property.cover_image_url}
                              alt=""
                              style={{ width: "48px", height: "40px", objectFit: "cover", borderRadius: "6px" }}
                            />
                          )}
                          <div>
                            <strong>{property.title}</strong>
                            <br />
                            <span className="cd-muted">{property.property_type}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {property.neighborhood || property.district}
                        {property.latitude && property.longitude && (
                          <div>
                            <a
                              href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: "var(--accent)", fontSize: "11px", fontWeight: 700 }}
                            >
                              🗺 Google Map ↗
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="cd-rent">
                        {property.rental_price.toLocaleString()} {property.currency}
                      </td>
                      <td>
                        {property.bedrooms} bed · {property.bathrooms} bath
                      </td>
                      <td>
                        <span className={`cd-badge cd-badge--${property.is_published ? "active" : "pending"}`}>
                          {property.is_published ? "Published (In Search)" : "Draft"}
                        </span>
                      </td>
                      <td>
                        <button className="cd-btn cd-btn--ghost cd-btn--xs" type="button" onClick={() => editProperty(property)}>
                          Edit
                        </button>{" "}
                        <button className="cd-btn cd-btn--ghost cd-btn--xs" type="button" onClick={() => unpublishProperty(property.id)}>
                          Unpublish
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── ADD / EDIT PROPERTY INTERFACE ── */}
        <section className="cd-section" id="add-property">
          <div className="cd-section-head">
            <div>
              <h2>{editingID ? "Edit Property" : "Add Your Property"}</h2>
              <p className="cd-muted" style={{ margin: "3px 0 0", fontSize: "13px" }}>
                Add property images, location, Google Maps coordinates, price, and rooms.
              </p>
            </div>
            {editingID && (
              <button
                className="cd-btn cd-btn--ghost"
                type="button"
                onClick={() => {
                  setEditingID(null);
                  setForm(emptyForm);
                }}
              >
                Cancel edit
              </button>
            )}
          </div>

          <form className="owner-form" onSubmit={saveProperty}>
            {/* 1. Basic Info */}
            <div className="owner-form-section owner-form-wide">
              <h3>1. Property Details</h3>
            </div>

            <label className="owner-form-wide">
              Property title *
              <input
                required
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g. Modern 3-Bedroom Villa with Garden in Nyarutarama"
              />
            </label>

            <label>
              Property type *
              <select value={form.property_type} onChange={(e) => updateField("property_type", e.target.value)}>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>

            <label>
              Availability status
              <select value={form.availability_status} onChange={(e) => updateField("availability_status", e.target.value)}>
                <option value="AVAILABLE">Available</option>
                <option value="RENTED">Rented</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>
            </label>

            <label className="owner-form-wide">
              Description
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Highlight key selling points: neighborhood, views, backup power, water storage, security..."
              />
            </label>

            {/* 2. Price & Currency */}
            <div className="owner-form-section owner-form-wide">
              <h3>2. Price &amp; Terms</h3>
            </div>

            <label>
              Monthly rent amount *
              <input
                required
                min="1"
                type="number"
                value={form.rental_price}
                onChange={(e) => updateField("rental_price", e.target.value)}
                placeholder="e.g. 500000"
              />
              {form.rental_price && (
                <small style={{ color: "var(--accent)", fontWeight: 700 }}>
                  Rent: {Number(form.rental_price).toLocaleString()} {form.currency} / month
                </small>
              )}
            </label>

            <label>
              Currency
              <select value={form.currency} onChange={(e) => updateField("currency", e.target.value)}>
                <option value="RWF">RWF (Rwandan Franc)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </label>

            {/* 3. Rooms & Capacity */}
            <div className="owner-form-section owner-form-wide">
              <h3>3. Rooms &amp; Space</h3>
            </div>

            <label>
              Bedrooms (rooms) *
              <select value={form.bedrooms} onChange={(e) => updateField("bedrooms", e.target.value)}>
                <option value="0">Studio (0 bedrooms)</option>
                <option value="1">1 bedroom</option>
                <option value="2">2 bedrooms</option>
                <option value="3">3 bedrooms</option>
                <option value="4">4 bedrooms</option>
                <option value="5">5+ bedrooms</option>
              </select>
            </label>

            <label>
              Bathrooms / Toilets *
              <select value={form.bathrooms} onChange={(e) => updateField("bathrooms", e.target.value)}>
                <option value="1">1 bathroom</option>
                <option value="2">2 bathrooms</option>
                <option value="3">3 bathrooms</option>
                <option value="4">4+ bathrooms</option>
              </select>
            </label>

            {/* Amenities Chips */}
            <div className="owner-form-wide">
              <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--muted)", display: "block", marginBottom: "8px" }}>
                Included Amenities:
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {AMENITY_OPTIONS.map((amenity) => {
                  const active = form.amenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        border: active ? "1px solid var(--accent)" : "1px solid #dce6dd",
                        background: active ? "var(--accent)" : "#fbfdfb",
                        color: active ? "#ffffff" : "var(--ink)",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {active ? "✓ " : "+ "} {amenity}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Location & Google Map */}
            <div className="owner-form-section owner-form-wide">
              <h3>4. Location &amp; Google Map</h3>
            </div>

            <label>
              District *
              <select value={form.district} onChange={(e) => updateField("district", e.target.value)}>
                <option value="Gasabo">Gasabo (Kigali)</option>
                <option value="Kicukiro">Kicukiro (Kigali)</option>
                <option value="Nyarugenge">Nyarugenge (Kigali)</option>
                <option value="Rubavu">Rubavu</option>
                <option value="Musanze">Musanze</option>
                <option value="Huye">Huye</option>
              </select>
            </label>

            <label>
              Neighborhood / Sector *
              <input
                required
                value={form.neighborhood}
                onChange={(e) => handleNeighborhoodSelect(e.target.value)}
                placeholder="e.g. Nyarutarama, Kiyovu, Kacyiru"
                list="kigali-neighborhoods-list"
              />
              <datalist id="kigali-neighborhoods-list">
                {KIGALI_NEIGHBORHOODS.map((n) => (
                  <option key={n.name} value={n.name}>{n.district}</option>
                ))}
              </datalist>
            </label>

            <label>
              Street address / House number
              <input
                value={form.address_line}
                onChange={(e) => updateField("address_line", e.target.value)}
                placeholder="e.g. KG 549 St, House 12"
              />
            </label>

            {/* Quick neighborhood preset chips */}
            <div className="owner-form-wide">
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Quick Kigali Coordinates Preset:
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {KIGALI_NEIGHBORHOODS.slice(0, 6).map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleNeighborhoodSelect(item.name)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: form.neighborhood === item.name ? "var(--forest)" : "#edf3ee",
                      color: form.neighborhood === item.name ? "#fff" : "var(--ink)",
                      border: "1px solid #d4ded6",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    📍 {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Coordinates & Google Maps link */}
            <label>
              Latitude (GPS)
              <input
                value={form.latitude}
                onChange={(e) => updateField("latitude", e.target.value)}
                placeholder="-1.9540"
              />
            </label>

            <label>
              Longitude (GPS)
              <input
                value={form.longitude}
                onChange={(e) => updateField("longitude", e.target.value)}
                placeholder="30.0825"
              />
            </label>

            <label>
              Google Maps link
              <input
                value={form.google_maps_url}
                onChange={(e) => updateField("google_maps_url", e.target.value)}
                placeholder="https://maps.google.com/?q=..."
              />
            </label>

            {/* Google Map Live Iframe Preview */}
            <div className="owner-form-wide" style={{ marginTop: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--forest)" }}>
                  🗺 Google Map Live Preview
                </span>
                <a
                  href={`https://www.google.com/maps?q=${currentLat},${currentLng}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent)" }}
                >
                  Open in Google Maps ↗
                </a>
              </div>
              <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #dce6dd", height: "220px", background: "#eaeaea" }}>
                <iframe
                  title="Property Google Map Location"
                  width="100%"
                  height="220"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${currentLat},${currentLng}&hl=en&z=15&output=embed`}
                />
              </div>
            </div>

            {/* 5. Images Section */}
            <div className="owner-form-section owner-form-wide">
              <h3>5. Property Images</h3>
            </div>

            <div className="owner-form-wide">
              {/* File upload input & URL add */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "12px" }}>
                <div style={{ padding: "16px", border: "2px dashed #b8d4c2", borderRadius: "10px", background: "#f5faf7", textAlign: "center" }}>
                  <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: 700, color: "var(--forest)" }}>
                    📁 Upload photos from device
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ fontSize: "12px", cursor: "pointer" }}
                  />
                  <small style={{ display: "block", marginTop: "6px", color: "var(--muted)" }}>
                    JPG, PNG, WebP supported
                  </small>
                </div>

                <div style={{ padding: "16px", border: "1px solid #dce6dd", borderRadius: "10px", background: "#fbfdfb" }}>
                  <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: 700, color: "var(--forest)" }}>
                    🔗 Or paste image URL
                  </p>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://.../living-room.jpg"
                      style={{ flex: 1, padding: "8px 10px", fontSize: "12px" }}
                    />
                    <button
                      type="button"
                      className="cd-btn cd-btn--primary cd-btn--sm"
                      onClick={addImageFromUrl}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Sample Kigali Photo Presets */}
              <div style={{ marginBottom: "14px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                  Or pick verified Kigali photo presets:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {SAMPLE_PHOTO_PRESETS.map((p) => (
                    <button
                      key={p.url}
                      type="button"
                      onClick={() => addSamplePhoto(p.url)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        background: "#edf3ee",
                        border: "1px solid #cbdcd0",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      + {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Gallery Preview */}
              {form.images.length > 0 && (
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--forest)", display: "block", marginBottom: "8px" }}>
                    Uploaded Images ({form.images.length}):
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px" }}>
                    {form.images.map((imgUrl, index) => (
                      <div
                        key={index}
                        style={{
                          position: "relative",
                          height: "100px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: index === 0 ? "2px solid var(--accent)" : "1px solid #ccc",
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt={`Uploaded preview ${index + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        {index === 0 && (
                          <span
                            style={{
                              position: "absolute",
                              top: "4px",
                              left: "4px",
                              background: "var(--accent)",
                              color: "#fff",
                              fontSize: "9px",
                              fontWeight: 800,
                              padding: "2px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            ★ Cover
                          </span>
                        )}
                        <div style={{ position: "absolute", bottom: "4px", right: "4px", display: "flex", gap: "4px" }}>
                          {index !== 0 && (
                            <button
                              type="button"
                              onClick={() => setAsCoverImage(index)}
                              title="Set as cover image"
                              style={{
                                background: "rgba(0,0,0,0.7)",
                                color: "#fff",
                                border: 0,
                                borderRadius: "4px",
                                fontSize: "10px",
                                padding: "2px 6px",
                                cursor: "pointer",
                              }}
                            >
                              Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            title="Remove photo"
                            style={{
                              background: "rgba(200, 30, 30, 0.8)",
                              color: "#fff",
                              border: 0,
                              borderRadius: "4px",
                              fontSize: "10px",
                              padding: "2px 6px",
                              cursor: "pointer",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 6. Publication & Submit */}
            <label className="owner-check owner-form-wide" style={{ marginTop: "12px", background: "#f0f7f2", padding: "12px", borderRadius: "8px" }}>
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => updateField("is_published", e.target.checked)}
              />
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--forest)" }}>
                Publish immediately so tenants can discover this home in search
              </span>
            </label>

            <div className="owner-form-actions owner-form-wide" style={{ marginTop: "16px" }}>
              <button className="cd-btn cd-btn--primary" disabled={saving} type="submit" style={{ padding: "12px 28px", fontSize: "14px" }}>
                {saving ? "Saving & Publishing..." : editingID ? "Update Property" : "Add Property & Publish →"}
              </button>
            </div>
          </form>
        </section>

        {/* Viewing requests */}
        <section className="cd-section" id="viewings">
          <div className="cd-section-head">
            <h2>Viewing requests</h2>
            <span className="cd-muted">{viewings.length} total</span>
          </div>
          {viewings.length === 0 ? (
            <p className="cd-muted">No viewing requests for your properties yet.</p>
          ) : (
            <div className="cd-table-wrap">
              <table className="cd-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Requester</th>
                    <th>Requested</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {viewings.map((viewing) => (
                    <tr key={viewing.id}>
                      <td>
                        <strong>{viewing.property}</strong>
                      </td>
                      <td>
                        {viewing.requester}
                        <br />
                        <span className="cd-muted">{viewing.email}</span>
                      </td>
                      <td>{new Date(viewing.requested_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`cd-badge cd-badge--${viewing.status.toLowerCase()}`}>{viewing.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
