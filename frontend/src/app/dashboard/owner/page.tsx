"use client";

import { FormEvent, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const propertyTypes = ["APARTMENT", "HOUSE", "VILLA", "STUDIO", "OFFICE", "LAND"];

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
  availability_status: string;
  verification_status: string;
  is_published: boolean;
  created_at: string;
  cover_image_url?: string;
  image_urls: string[];
};
type Viewing = { id: string; property: string; requester: string; email: string; requested_at: string; scheduled_for?: string; status: string; message: string };

type FormState = {
  title: string;
  description: string;
  property_type: string;
  rental_price: string;
  bedrooms: string;
  bathrooms: string;
  district: string;
  neighborhood: string;
  address_line: string;
  availability_status: string;
  is_published: boolean;
  image_urls: string;
};

const emptyForm: FormState = {
  title: "", description: "", property_type: "HOUSE", rental_price: "",
  bedrooms: "1", bathrooms: "1", district: "", neighborhood: "", address_line: "",
  availability_status: "AVAILABLE", is_published: false, image_urls: "",
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

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session || session.user.role !== "OWNER") {
      router.replace("/sign-in");
      return;
    }
    loadProperties();
    loadViewings();
  }, [session, sessionStatus, router]);

  async function loadProperties() {
    setLoading(true);
    try {
      const response = await fetch("/api/owner/properties", { cache: "no-store" });
      const data = await response.json() as { properties?: Property[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Could not load properties.");
      setProperties(data.properties ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load properties.");
    } finally {
      setLoading(false);
    }
  }

  async function loadViewings() {
    try {
      const response = await fetch("/api/owner/viewings", { cache: "no-store" });
      const data = await response.json() as { viewings?: Viewing[] };
      if (response.ok) setViewings(data.viewings ?? []);
    } catch {
      // The property list remains usable if viewing requests are unavailable.
    }
  }

  function updateField(field: keyof FormState, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function editProperty(property: Property) {
    setEditingID(property.id);
    setForm({
      title: property.title, description: property.description, property_type: property.property_type,
      rental_price: String(property.rental_price), bedrooms: String(property.bedrooms), bathrooms: String(property.bathrooms),
      district: property.district, neighborhood: property.neighborhood, address_line: property.address_line,
      availability_status: property.availability_status, is_published: property.is_published,
      image_urls: property.image_urls.join("\n"),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveProperty(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setError(""); setMessage("");
    const payload = {
      ...form,
      rental_price: Number(form.rental_price),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      image_urls: form.image_urls.split("\n").map((url) => url.trim()).filter(Boolean),
    };
    try {
      const response = await fetch(editingID ? `/api/owner/properties/${editingID}` : "/api/owner/properties", {
        method: editingID ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not save property.");
      setMessage(form.is_published ? "Property submitted for verification." : "Property saved as draft.");
      setForm(emptyForm); setEditingID(null); await loadProperties();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save property.");
    } finally {
      setSaving(false);
    }
  }

  async function unpublishProperty(id: string) {
    if (!window.confirm("Unpublish this property?")) return;
    const response = await fetch(`/api/owner/properties/${id}`, { method: "DELETE" });
    if (response.ok) await loadProperties();
    else setError("Could not unpublish property.");
  }

  if (sessionStatus === "loading" || !session) return <div className="cd-loading"><span className="cd-spinner" aria-label="Loading" /></div>;
  if (session.user.role !== "OWNER") return null;

  const published = properties.filter((property) => property.is_published).length;
  const drafts = properties.length - published;

  return (
    <div className="cd-root">
      <aside className="cd-sidebar">
        <div className="cd-brand"><i aria-hidden="true" />Inzu<span>Hub</span></div>
        <nav className="cd-nav" aria-label="Owner dashboard navigation">
          <a className="cd-nav-item active" href="#overview">⌂ Overview</a>
          <a className="cd-nav-item" href="#properties">▦ My properties</a>
          <a className="cd-nav-item" href="#add-property">＋ Add property</a>
          <a className="cd-nav-item" href="#viewings">Viewing requests</a>
        </nav>
        <button className="cd-signout" type="button" onClick={() => signOut({ callbackUrl: "/" })}>↩ Sign out</button>
      </aside>

      <main className="cd-main">
        <header className="cd-topbar" id="overview">
          <div><p className="cd-eyebrow">HOUSE OWNER DASHBOARD</p><h1 className="cd-heading">Welcome, {session.user.name?.split(" ")[0] ?? "owner"}</h1></div>
          <button className="cd-btn cd-btn--primary" type="button" onClick={() => document.getElementById("add-property")?.scrollIntoView({ behavior: "smooth" })}>＋ Add property</button>
        </header>

        <section className="cd-stats" aria-label="Property summary">
          <div className="cd-stat-card"><span className="cd-stat-icon">⌂</span><div><p className="cd-stat-label">Total properties</p><p className="cd-stat-value">{properties.length}</p></div></div>
          <div className="cd-stat-card"><span className="cd-stat-icon">✓</span><div><p className="cd-stat-label">Published</p><p className="cd-stat-value">{published}</p></div></div>
          <div className="cd-stat-card"><span className="cd-stat-icon">◷</span><div><p className="cd-stat-label">Drafts</p><p className="cd-stat-value">{drafts}</p></div></div>
          <div className="cd-stat-card"><span className="cd-stat-icon">↗</span><div><p className="cd-stat-label">Verification</p><p className="cd-stat-value">{properties.filter((property) => property.verification_status === "VERIFIED").length}</p></div></div>
        </section>

        {message && <p className="cd-notice cd-notice--success" role="status">{message}</p>}
        {error && <p className="cd-notice cd-notice--error" role="alert">{error}</p>}

        <section className="cd-section" id="properties">
          <div className="cd-section-head"><h2>My properties</h2><span className="cd-muted">{properties.length} total</span></div>
          {loading ? <p>Loading your properties...</p> : properties.length === 0 ? <div className="cd-empty"><h3>No properties yet</h3><p>Start by adding your first property to reach renters on InzuHub.</p><button className="cd-btn cd-btn--primary" type="button" onClick={() => document.getElementById("add-property")?.scrollIntoView({ behavior: "smooth" })}>Add property</button></div> : (
            <div className="cd-table-wrap"><table className="cd-table"><thead><tr><th>Property</th><th>Location</th><th>Rent</th><th>Status</th><th /></tr></thead><tbody>{properties.map((property) => <tr key={property.id}><td><strong>{property.title}</strong><br /><span className="cd-muted">{property.property_type} · {property.bedrooms} bed · {property.bathrooms} bath</span></td><td>{property.neighborhood || property.district}</td><td className="cd-rent">{property.rental_price.toLocaleString()} {property.currency}</td><td><span className={`cd-badge cd-badge--${property.is_published ? "active" : "pending"}`}>{property.is_published ? "Published" : "Draft"}</span></td><td><button className="cd-btn cd-btn--ghost cd-btn--xs" type="button" onClick={() => editProperty(property)}>Edit</button> <button className="cd-btn cd-btn--ghost cd-btn--xs" type="button" onClick={() => unpublishProperty(property.id)}>Unpublish</button></td></tr>)}</tbody></table></div>
          )}
        </section>

        <section className="cd-section" id="add-property">
          <div className="cd-section-head"><h2>{editingID ? "Edit property" : "Add a property"}</h2>{editingID && <button className="cd-btn cd-btn--ghost" type="button" onClick={() => { setEditingID(null); setForm(emptyForm); }}>Cancel edit</button>}</div>
          <form className="owner-form" onSubmit={saveProperty}>
            <label>Property title *<input required value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="e.g. Bright 2-bedroom home in Kacyiru" /></label>
            <label>Property type *<select value={form.property_type} onChange={(event) => updateField("property_type", event.target.value)}>{propertyTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
            <label className="owner-form-wide">Description<textarea rows={4} value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Tell renters what makes this property special." /></label>
            <label>Monthly rent (RWF) *<input required min="1" type="number" value={form.rental_price} onChange={(event) => updateField("rental_price", event.target.value)} /></label>
            <label>Bedrooms<input min="0" type="number" value={form.bedrooms} onChange={(event) => updateField("bedrooms", event.target.value)} /></label>
            <label>Bathrooms<input min="0" type="number" value={form.bathrooms} onChange={(event) => updateField("bathrooms", event.target.value)} /></label>
            <label>District *<input required value={form.district} onChange={(event) => updateField("district", event.target.value)} placeholder="Gasabo" /></label>
            <label>Neighborhood<input value={form.neighborhood} onChange={(event) => updateField("neighborhood", event.target.value)} placeholder="Kacyiru" /></label>
            <label>Address<input value={form.address_line} onChange={(event) => updateField("address_line", event.target.value)} /></label>
            <label>Availability<select value={form.availability_status} onChange={(event) => updateField("availability_status", event.target.value)}><option value="AVAILABLE">Available</option><option value="UNAVAILABLE">Unavailable</option><option value="RENTED">Rented</option></select></label>
            <label className="owner-form-wide">Image URLs <small>One public or storage URL per line. File storage is not configured yet.</small><textarea rows={4} value={form.image_urls} onChange={(event) => updateField("image_urls", event.target.value)} placeholder="https://.../living-room.jpg" /></label>
            <label className="owner-check owner-form-wide"><input type="checkbox" checked={form.is_published} onChange={(event) => updateField("is_published", event.target.checked)} /> Submit this property for verification and publication</label>
            <div className="owner-form-actions owner-form-wide"><button className="cd-btn cd-btn--primary" disabled={saving} type="submit">{saving ? "Saving..." : form.is_published ? "Submit property" : "Save draft"}</button></div>
          </form>
        </section>

        <section className="cd-section" id="viewings">
          <div className="cd-section-head"><h2>Viewing requests</h2><span className="cd-muted">{viewings.length} total</span></div>
          {viewings.length === 0 ? <p className="cd-muted">No viewing requests for your properties yet.</p> : (
            <div className="cd-table-wrap"><table className="cd-table"><thead><tr><th>Property</th><th>Requester</th><th>Requested</th><th>Status</th></tr></thead><tbody>{viewings.map((viewing) => <tr key={viewing.id}><td><strong>{viewing.property}</strong></td><td>{viewing.requester}<br /><span className="cd-muted">{viewing.email}</span></td><td>{new Date(viewing.requested_at).toLocaleDateString()}</td><td><span className={`cd-badge cd-badge--${viewing.status.toLowerCase()}`}>{viewing.status}</span></td></tr>)}</tbody></table></div>
          )}
        </section>
      </main>
    </div>
  );
}
