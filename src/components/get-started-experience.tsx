"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";

const districts = [
  "Gasabo","Kicukiro","Nyarugenge","Bugesera","Gatsibo","Kayonza","Kirehe",
  "Ngoma","Nyagatare","Rwamagana","Burera","Gakenke","Gicumbi","Musanze",
  "Rulindo","Gisagara","Huye","Kamonyi","Muhanga","Nyamagabe","Nyanza",
  "Nyaruguru","Ruhango","Karongi","Ngororero","Nyabihu","Nyamasheke",
  "Rubavu","Rusizi","Rutsiro",
];
const propertyTypes = ["Apartment", "House", "Villa", "Studio"];
const bedrooms      = ["1 bedroom", "2 bedrooms", "3 bedrooms", "4+ bedrooms"];
const budgets       = [
  "Under 300,000 RWF",
  "300,000–600,000 RWF",
  "600,000–1,000,000 RWF",
  "1,000,000+ RWF",
];
const amenities = ["Inside toilet", "Parking", "Water", "Security"];

type Filters = {
  location: string; type: string; bedrooms: string;
  budget: string;   amenity: string;
};
const emptyFilters: Filters = {
  location: "", type: "", bedrooms: "", budget: "", amenity: "",
};

export function GetStartedExperience() {
  const [filters, setFilters]   = useState<Filters>(emptyFilters);
  const [loading, setLoading]   = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const hasFilter = Object.values(filters).some(Boolean);
  const selected  = useMemo(
    () =>
      Object.entries(filters)
        .filter(([, v]) => v)
        .map(([key, value]) => ({ key: key as keyof Filters, value })),
    [filters],
  );

  const update = (key: keyof Filters, value: string) =>
    setFilters((cur) => ({ ...cur, [key]: value }));
  const remove = (key: keyof Filters) => update(key, "");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!hasFilter || loading) return;
    setLoading(true);
    window.setTimeout(() => setLoading(false), 900);
  };

  const mapUrl = filters.location
    ? `https://www.google.com/maps/search/${encodeURIComponent(`${filters.location}, Rwanda`)}`
    : "https://www.google.com/maps/place/Rwanda";

  return (
    <main className="get-started-page">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="get-nav">
        <Link href="/" className="get-logo">
          <i aria-hidden="true" />Inzu<span>Hub</span>
        </Link>
        <nav className={menuOpen ? "open" : ""}>
          <Link href="/#homes">Find a House</Link>
          <Link href="/#list">List a House</Link>
          <Link href="/#agents">Commissioners</Link>
          <Link href="/#how">How It Works</Link>
        </nav>
        <div className="get-nav-actions">
          <Link className="get-signin" href="/sign-in">Sign in</Link>
          <a className="get-cta" href="#search">Get started</a>
        </div>
        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          ☰
        </button>
      </div>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="get-hero">
        <div>
          <p className="get-kicker">YOUR NEXT PLACE IN RWANDA</p>
          <h1>Find a home that<br /><em>feels like yours.</em></h1>
          <p>
            Search trusted homes by location, budget, and the details
            that matter to your everyday life.
          </p>
        </div>
        <div className="image-collage">
          <div className="collage-main">
            <Image
              src="/images/properties/kigali-apartment.jpg"
              alt="Modern apartment in Kigali"
              fill priority
              sizes="(max-width: 800px) 70vw, 45vw"
            />
          </div>
          <div className="collage-small">
            <Image
              src="/images/properties/kigali-home.jpg"
              alt="Family home in Rwanda"
              fill
              sizes="(max-width: 800px) 35vw, 20vw"
            />
          </div>
          <div className="collage-accent">
            <Image
              src="/images/properties/kigali-villa.jpg"
              alt="Garden home in Kigali"
              fill
              sizes="180px"
            />
          </div>
          <span className="collage-tag">
            30 districts<br /><b>one easier search</b>
          </span>
        </div>
      </section>

      {/* ── Search workspace ────────────────────────────────────── */}
      <section className="search-workspace" id="search">
        <div className="workspace-heading">
          <div>
            <p className="get-kicker">SEARCH HOMES</p>
            <h2>What are you looking for?</h2>
          </div>
          <p>Choose one or more filters to begin.</p>
        </div>

        <form className="filter-form" onSubmit={submit}>
          <div className="filter-grid">
            <label className="filter-field location-field">
              <span>Location</span>
              <select
                value={filters.location}
                onChange={(e) => update("location", e.target.value)}
              >
                <option value="">Choose a district</option>
                {districts.map((d) => <option key={d}>{d}</option>)}
              </select>
              <small>⌖ Rwanda · Google Maps ready</small>
            </label>

            <label className="filter-field">
              <span>Property type</span>
              <select
                value={filters.type}
                onChange={(e) => update("type", e.target.value)}
              >
                <option value="">Any property type</option>
                {propertyTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>

            <label className="filter-field">
              <span>Bedrooms</span>
              <select
                value={filters.bedrooms}
                onChange={(e) => update("bedrooms", e.target.value)}
              >
                <option value="">Any bedrooms</option>
                {bedrooms.map((b) => <option key={b}>{b}</option>)}
              </select>
            </label>

            <label className="filter-field">
              <span>Monthly budget</span>
              <select
                value={filters.budget}
                onChange={(e) => update("budget", e.target.value)}
              >
                <option value="">Any budget</option>
                {budgets.map((b) => <option key={b}>{b}</option>)}
              </select>
            </label>

            <label className="filter-field">
              <span>Must have</span>
              <select
                value={filters.amenity}
                onChange={(e) => update("amenity", e.target.value)}
              >
                <option value="">Any amenity</option>
                {amenities.map((a) => <option key={a}>{a}</option>)}
              </select>
            </label>

            <button
              className={`search-submit ${hasFilter ? "active" : ""}`}
              disabled={!hasFilter || loading}
              type="submit"
            >
              {loading
                ? <><i className="spinner" />Searching…</>
                : <>Search homes <b>→</b></>}
            </button>
          </div>
        </form>

        {selected.length > 0 && (
          <div className="selected-row">
            <span>Selected:</span>
            {selected.map(({ key, value }) => (
              <button
                type="button"
                className="filter-chip"
                key={key}
                onClick={() => remove(key)}
              >
                {value} ×
              </button>
            ))}
            <button
              type="button"
              className="clear-filters"
              onClick={() => setFilters(emptyFilters)}
            >
              Clear all
            </button>
          </div>
        )}

        <div className="location-strip">
          <div>
            <span className="map-pin">⌖</span>
            <p>
              <b>{filters.location || "Explore Rwanda by district"}</b><br />
              See the area on Google Maps before you decide.
            </p>
          </div>
          <a href={mapUrl} target="_blank" rel="noreferrer">Open map ↗</a>
        </div>
      </section>
    </main>
  );
}
