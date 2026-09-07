"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { ParsedFilters } from "@/app/api/ai/parse-search/route";

const locations = ["Kigali", "Gasabo", "Kicukiro", "Nyarugenge", "Nyagatare", "Musanze", "Huye", "Rubavu"];
const prompts = [
  "2 bedroom apartment in Kicukiro under 300k",
  "Quiet house near good transport",
  "Something affordable for students",
];

type Filters = { location: string; type: string; bedrooms: string; budget: string };
type Property = {
  id: string;
  title: string;
  property_type: string;
  district: string;
  neighborhood: string;
  address_line?: string;
  rental_price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  verification_status: string;
  cover_image_url?: string;
  latitude?: number | null;
  longitude?: number | null;
  google_maps_url?: string;
  description?: string;
};

const emptyFilters: Filters = { location: "", type: "", bedrooms: "", budget: "" };

const fallbackListings = [
  {
    image: "/assets/reference1.jpg",
    badge: "Featured in Kigali",
    title: "Light-filled homes, ready for you.",
    meta: "Verified spaces Â· Kigali",
    price: "From 300,000 RWF/mo",
  },
  {
    image: "/assets/reference2.jpg",
    badge: "Kicukiro",
    title: "Room to settle in and breathe.",
    meta: "Apartments Â· Trusted local hosts",
    price: "From 420,000 RWF/mo",
  },
  {
    image: "/assets/reference3.jpg",
    badge: "Kimihurura",
    title: "Quiet streets, close to everything.",
    meta: "Homes Â· Walkable neighbourhoods",
    price: "From 550,000 RWF/mo",
  },
];

const RWANDA_DISTRICTS = [
  { id: "all", name: "Rwanda", query: "Rwanda", zoom: 8 },
  { id: "kicukiro", name: "Kicukiro", query: "Kicukiro, Kigali, Rwanda", zoom: 13 },
  { id: "gasabo", name: "Gasabo", query: "Gasabo, Kigali, Rwanda", zoom: 13 },
  { id: "nyagatare", name: "Nyagatare", query: "Nyagatare, Eastern Province, Rwanda", zoom: 12 },
  { id: "nyarugenge", name: "Nyarugenge", query: "Nyarugenge, Kigali, Rwanda", zoom: 13 },
  { id: "musanze", name: "Musanze", query: "Musanze, Northern Province, Rwanda", zoom: 12 },
  { id: "rubavu", name: "Rubavu", query: "Rubavu, Western Province, Rwanda", zoom: 12 },
];

export function LandingInteractive() {
  const [activeDistrict, setActiveDistrict] = useState(RWANDA_DISTRICTS[0]);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [query, setQuery]     = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [aiError, setAiError]     = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [propertyResults, setPropertyResults] = useState<Property[]>([]);
  const [propertyError, setPropertyError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const hasFilter = Object.values(filters).some(Boolean);
  const setFilter = (key: keyof Filters, value: string) =>
    setFilters((cur) => ({ ...cur, [key]: value }));

  function getCombinedProperties(): Property[] {
    return allProperties;
  }

  function filterPropertyList(all: Property[], loc: string, pType: string, beds: string, bud: string, searchTxt?: string): Property[] {
    return all.filter((p) => {
      // Location filter
      if (loc && loc !== "Kigali" && loc !== "Anywhere in Rwanda") {
        const pLoc = `${p.district} ${p.neighborhood || ""} ${p.address_line || ""}`.toLowerCase();
        if (!pLoc.includes(loc.toLowerCase())) return false;
      }
      // Property type filter
      if (pType && pType !== "Any type") {
        if (p.property_type.toUpperCase() !== pType.toUpperCase()) return false;
      }
      // Bedrooms filter
      if (beds && beds !== "Any bedrooms") {
        const minB = beds.startsWith("3") ? 3 : parseInt(beds[0], 10);
        if (!isNaN(minB) && p.bedrooms < minB) return false;
      }
      // Budget filter
      if (bud && bud !== "Any budget") {
        if (bud === "Under 300,000 RWF" && p.rental_price > 300000) return false;
        if (bud === "300,000–600,000 RWF" && (p.rental_price < 300000 || p.rental_price > 600000)) return false;
        if (bud === "600,000+ RWF" && p.rental_price < 600000) return false;
      }
      // Text search filter
      if (searchTxt && searchTxt.trim()) {
        const term = searchTxt.toLowerCase();
        const content = `${p.title} ${p.description || ""} ${p.property_type} ${p.district} ${p.neighborhood || ""} ${p.address_line || ""}`.toLowerCase();
        if (!content.includes(term)) return false;
      }
      return true;
    });
  }

  // ── Conversational search ──────────────────────────────────────
  const handleAiSearch = async (text: string) => {
    const q = text.trim();
    if (!q) return;
    setQuery(q);
    setAiError("");
    setAiSummary("");
    setAiLoading(true);

    // Filter combined properties immediately
    const baselineResults = filterPropertyList(getCombinedProperties(), "", "", "", "", q);
    setPropertyResults(baselineResults);

    try {
      const res = await fetch("/api/ai/parse-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = (await res.json()) as
        | { ok: true; filters: ParsedFilters }
        | { error: string };
      if ("ok" in data && data.ok) {
        const f = data.filters;
        const nextFilters = {
          location: f.location || filters.location,
          type: f.type || filters.type,
          bedrooms: f.bedrooms || filters.bedrooms,
          budget: f.budget || filters.budget,
        };
        setFilters(nextFilters);
        setAiSummary(f.summary);

        const refinedResults = filterPropertyList(
          getCombinedProperties(),
          nextFilters.location,
          nextFilters.type,
          nextFilters.bedrooms,
          nextFilters.budget,
          q
        );
        setPropertyResults(refinedResults.length ? refinedResults : baselineResults);
      } else {
        setAiError("error" in data ? data.error : "Could not understand that query.");
      }
    } catch {
      // Offline fallback: keep filtered baseline results
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadProperties = async () => {
      try {
        const response = await fetch("/api/properties", { cache: "no-store" });
        const data = await response.json() as { properties?: Property[]; error?: string };
        if (!response.ok) throw new Error(data.error || "Could not load properties.");
        if (!cancelled) {
          const properties = data.properties ?? [];
          setAllProperties(properties);
          setPropertyResults(properties);
          setPropertyError("");
        }
      } catch {
        if (!cancelled) {
          setAllProperties([]);
          setPropertyResults([]);
          setPropertyError("Property listings are temporarily unavailable. Please try again shortly.");
        }
      }
    };
    loadProperties();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAiSubmit = (event: FormEvent) => {
    event.preventDefault();
    handleAiSearch(query);
  };

  // ── Manual filter submit ──────────────────────────────────────
  const submitSearch = async (event: FormEvent) => {
    event.preventDefault();
    if (!hasFilter || filterLoading) return;
    setAiSummary("");
    setAiError("");
    setPropertyError("");
    setFilterLoading(true);

    const databaseMatches = filterPropertyList(
      getCombinedProperties(),
      filters.location,
      filters.type,
      filters.bedrooms,
      filters.budget,
      query
    );
    setPropertyResults(databaseMatches);

    const params = new URLSearchParams();
    if (filters.location && filters.location !== "Kigali") params.set("location", filters.location);
    if (filters.type) params.set("property_type", filters.type.toUpperCase());
    if (filters.bedrooms) params.set("min_bedrooms", filters.bedrooms.startsWith("3") ? "3" : filters.bedrooms[0]);
    if (filters.budget) {
      const maxPrice =
        filters.budget === "Under 300,000 RWF"
          ? "300000"
          : filters.budget === "300,000–600,000 RWF"
          ? "600000"
          : "";
      if (maxPrice) params.set("max_price", maxPrice);
    }

    try {
      const response = await fetch(`/api/properties?${params}`);
      const data = (await response.json()) as { properties?: Property[]; error?: string };
      if (response.ok && data.properties?.length) {
        const map = new Map(databaseMatches.map((p) => [p.id, p]));
        data.properties.forEach((p) => map.set(p.id, p));
        setPropertyResults(Array.from(map.values()));
      }
    } catch {
      setPropertyError("We could not refresh property listings. Please try again.");
    } finally {
      setFilterLoading(false);
    }
  };

  return (
    <>
      {/* ── Search panel ──────────────────────────────────────── */}
      <section className="hero-search" id="homes" aria-label="Search for a home">
        <div className="hero-search-head">
          <div>
            <p className="eyebrow" data-i18n="search.kicker" data-i18n-default="Start with a few details">Start with a few details</p>
            <h2 data-i18n="search.title" data-i18n-default="Find the right fit.">Find the right fit.</h2>
          </div>
          <span data-i18n="search.subtitle" data-i18n-default="Search verified homes across Rwanda">Search verified homes across Rwanda</span>
        </div>

        {/* Conversational / AI search input */}
        <form className="ai-search-bar" onSubmit={onAiSubmit} aria-label="Search with natural language">
          <input
            ref={inputRef}
            type="text"
            className="ai-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 2 bedroom apartment in Kigali under 300,000 RWF…"
            aria-label="Describe what you're looking for"
            disabled={aiLoading}
          />
          <button
            type="submit"
            className={`ai-search-btn ${aiLoading ? "loading" : ""}`}
            disabled={!query.trim() || aiLoading}
            aria-label="Search with AI"
          >
            {aiLoading
              ? <><i className="spinner" />Searching…</>
              : <>✦ Search</>}
          </button>
        </form>

        {/* Quick-prompt chips */}
        <div className="hero-chips ai-chips" role="list" aria-label="Example searches">
          {prompts.map((p) => (
            <button
              key={p}
              type="button"
              role="listitem"
              onClick={() => handleAiSearch(p)}
              disabled={aiLoading}
            >
              <span data-i18n={`search.prompt.${p === prompts[0] ? "one" : p === prompts[1] ? "two" : "three"}`} data-i18n-default={p}>{p}</span>
            </button>
          ))}
        </div>

        {/* AI feedback */}
        {aiSummary && (
          <p className="ai-search-status ok" role="status">
            ✦ {aiSummary}
          </p>
        )}
        {aiError && (
          <p className="ai-search-status error" role="alert">
            {aiError}
          </p>
        )}

        {/* Divider */}
        <div className="search-divider" aria-hidden="true">
          <span>or refine with filters</span>
        </div>

        {/* Existing manual filters */}
        <form className="hero-filter-form" onSubmit={submitSearch}>
          <label className="hero-filter-field location-filter">
            <span>Location</span>
            <select
              value={filters.location}
              onChange={(e) => setFilter("location", e.target.value)}
            >
              <option value="">Anywhere in Rwanda</option>
              {locations.map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
          <label className="hero-filter-field type-filter">
            <span>Property type</span>
            <select
              value={filters.type}
              onChange={(e) => setFilter("type", e.target.value)}
            >
              <option value="">Any type</option>
              <option>Apartment</option>
              <option>House</option>
              <option>Villa</option>
            </select>
          </label>
          <label className="hero-filter-field bedrooms-filter">
            <span>Bedrooms</span>
            <select
              value={filters.bedrooms}
              onChange={(e) => setFilter("bedrooms", e.target.value)}
            >
              <option value="">Any bedrooms</option>
              <option>1 bedroom</option>
              <option>2 bedrooms</option>
              <option>3+ bedrooms</option>
            </select>
          </label>
          <label className="hero-filter-field budget-filter">
            <span>Budget</span>
            <select
              value={filters.budget}
              onChange={(e) => setFilter("budget", e.target.value)}
            >
              <option value="">Any budget</option>
              <option>Under 300,000 RWF</option>
              <option>300,000–600,000 RWF</option>
              <option>600,000+ RWF</option>
            </select>
          </label>
          <button
            className={`hero-search-submit ${hasFilter ? "is-active" : ""}`}
            disabled={!hasFilter || filterLoading}
            type="submit"
          >
            {filterLoading
              ? <><i className="spinner" />Searching</>
              : <>Search homes <b>→</b></>}
          </button>
        </form>

        {/* Active filter chips */}
        {hasFilter && (
          <div className="hero-chips">
            {Object.entries(filters)
              .filter(([, v]) => v)
              .map(([key, value]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setFilter(key as keyof Filters, "")}
                >
                  {value} ×
                </button>
              ))}
            <button
              type="button"
              className="clear-all-chip"
              onClick={() => {
                setFilters(emptyFilters);
                setAiSummary("");
                setAiError("");
                setQuery("");
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </section>

      {(propertyResults.length > 0 || propertyError) && (
        <section className="search-results" aria-live="polite">
          <div className="section-intro">
            <p className="eyebrow">Live from Umutungo</p>
            <h2>
              {propertyResults.length > 0
                ? `${propertyResults.length} homes match your search.`
                : "Explore a few homes while listings refresh."}
            </h2>
            {!propertyResults.length && (
              <p className="search-results-subtitle">
                Start with these trusted Kigali spaces, then search again when you are ready.
              </p>
            )}
          </div>
          {propertyError && (
            <p className="search-results-notice" role="status">
              Listings are refreshing in the background. You can still explore these homes while we reconnect.
            </p>
          )}
          <div className="discovery-cards">
            {propertyResults.length === 0
              ? fallbackListings.map((listing) => (
                <article className="small-discovery fallback-discovery" key={listing.title}>
                  <Image
                    src={listing.image}
                    fill
                    sizes="(max-width: 850px) 100vw, 33vw"
                    alt={listing.title}
                  />
                  <div>
                    <span>{listing.badge}</span>
                    <h3>{listing.title}</h3>
                    <p>{listing.meta}</p>
                    <b>{listing.price}</b>
                  </div>
                </article>
              ))
              : propertyResults.map((property) => {
              const mapLink =
                property.google_maps_url ||
                (property.latitude && property.longitude
                  ? `https://www.google.com/maps?q=${property.latitude},${property.longitude}`
                  : undefined);

              return (
                <article className="small-discovery" key={property.id}>
                  <div className="search-result-image" style={{ position: "relative", height: "180px" }}>
                    <img
                      src={
                        property.cover_image_url ||
                        "/images/properties/hero-home.jpg"
                      }
                      alt={`${property.title} in ${property.district}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <span>
                      {property.property_type} · {property.verification_status === "VERIFIED" ? "Verified home" : "Active listing"}
                    </span>
                    <h3>{property.title}</h3>
                    <p style={{ margin: "4px 0 2px" }}>
                      📍 {property.neighborhood ? `${property.neighborhood}, ` : ""}{property.district} · 🛏 {property.bedrooms} beds · 🚿 {property.bathrooms} baths
                    </p>
                    <b>
                      {property.rental_price.toLocaleString()} <small>{property.currency}/mo</small>
                    </b>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
                      <a href={`/properties/${property.id}`} className="button small" style={{ fontSize: "12px", padding: "6px 14px" }}>
                        View property →
                      </a>
                      {mapLink && (
                        <a
                          href={mapLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "var(--accent)", fontSize: "12px", fontWeight: 700, textDecoration: "none" }}
                        >
                          🗺 Google Map ↗
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Discovery / listing cards ──────────────────────────── */}
      <section className="discovery" id="list">
        <div className="section-intro">
          <p className="eyebrow coral">The Umutungo way</p>
          <h2>More than a listing.<br /><em>A better decision.</em></h2>
          <p>Every detail is designed to make renting in Rwanda more informed, more human, and less uncertain.</p>
        </div>
        <div className="discovery-cards">
          <article className="large-discovery">
            <Image
              src="/images/properties/kigali-villa.jpg"
              fill
              sizes="(max-width:800px) 100vw, 45vw"
              alt="Modern villa available in Kigali"
            />
            <div>
              <span>Featured in Kicukiro</span>
              <h3>A home with room to breathe.</h3>
              <p>3 bedrooms · Garden · Verified location</p>
            </div>
          </article>
          <article className="small-discovery">
            <Image
              src="/images/properties/kigali-home.jpg"
              fill
              sizes="(max-width:800px) 100vw, 25vw"
              alt="Family home in Rwanda"
            />
            <div>
              <span>Kimihurura</span>
              <h3>Quiet streets, close to everything.</h3>
              <b>650,000 <small>RWF/mo</small></b>
            </div>
          </article>
        </div>
      </section>

      {/* ── Trust Rail ──────────────────────────────────────────── */}
      <section className="trust-rail">
        <div>
          <p className="eyebrow">Trust, built in</p>
          <h2>Know before<br /><em>you move.</em></h2>
        </div>
        <div className="trust-items">
          <span><b>✓</b><strong>Verified owners</strong><small>Identity checked</small></span>
          <span><b>⌂</b><strong>Verified homes</strong><small>Listing reviewed</small></span>
          <span><b>⌖</b><strong>Verified locations</strong><small>Place confirmed</small></span>
          <span><b>✦</b><strong>Trusted agents</strong><small>Partners, not middlemen</small></span>
        </div>
      </section>

      {/* ── Journey Steps ───────────────────────────────────────── */}
      <section className="journey" id="how">
        <div>
          <p className="eyebrow">A clearer rental journey</p>
          <h2>From searching<br /><em>to settling in.</em></h2>
        </div>
        <div className="journey-steps">
          {([
            ["01","Discover","Search by place, price, or natural language."],
            ["02","Verify","See the signals that build confidence."],
            ["03","View","Request a visit when it suits you."],
            ["04","Agree","Compare, offer, and negotiate clearly."],
            ["05","Rent","Move forward with less uncertainty."],
          ] as const).map(([number, title, description], index) => (
            <div className={index === 0 ? "current" : ""} key={number}>
              <b>{number}</b>
              <strong>{title}</strong>
              <span>{description}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Rwanda Map ──────────────────────────────────────────── */}
      <section className="rwanda-map">
        <div className="map-copy">
          <p className="eyebrow">Explore Rwanda</p>
          <h2>Your next address<br /><em>starts here.</em></h2>
          <p>Explore homes by district, from Kigali neighbourhoods to growing cities across the country.</p>

          <div className="map-districts-pills">
            {RWANDA_DISTRICTS.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`map-district-pill ${activeDistrict.id === d.id ? "active" : ""}`}
                onClick={() => setActiveDistrict(d)}
              >
                {d.name}
              </button>
            ))}
          </div>

          <div className="map-actions-row">
            <a
              className="map-link"
              href={`https://www.google.com/maps/search/${encodeURIComponent(activeDistrict.query)}`}
              target="_blank"
              rel="noreferrer"
            >
              Open the map ↗
            </a>
            {activeDistrict.id !== "all" && (
              <a
                className="map-filter-link"
                href={`/?q=${encodeURIComponent(activeDistrict.name)}#homes`}
              >
                Explore {activeDistrict.name} homes →
              </a>
            )}
          </div>
        </div>

        <div className="map-visual real-map-container">
          <iframe
            title={`Real Map of ${activeDistrict.name}, Rwanda`}
            src={`https://maps.google.com/maps?q=${encodeURIComponent(activeDistrict.query)}&hl=en&z=${activeDistrict.zoom}&output=embed`}
            width="100%"
            height="100%"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            className="real-map-iframe"
          />
          <div className="map-visual-badge">
            <span>● Live Map · {activeDistrict.name}</span>
          </div>
        </div>
      </section>

      {/* ── Intel Cards ─────────────────────────────────────────── */}
      <section className="intelligence">
        <div>
          <p className="eyebrow">Rental intelligence</p>
          <h2>A smarter view<br /><em>of the market.</em></h2>
        </div>
        <div className="intel-cards">
          <article>
            <small>AVERAGE RENT · KIGALI</small>
            <b>420,000 <i>RWF/mo</i></b>
            <span>↗ 6.4% this year</span>
          </article>
          <article>
            <small>HIGH DEMAND AREA</small>
            <b>Kicukiro</b>
            <span>More two-bedroom searches</span>
          </article>
          <article>
            <small>POPULAR THIS MONTH</small>
            <b>2 bedrooms</b>
            <span>Across 4 districts</span>
          </article>
        </div>
      </section>
    </>
  );
}
