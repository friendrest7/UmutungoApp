"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
    meta: "Verified spaces · Kigali",
    price: "From 300,000 RWF/mo",
  },
  {
    image: "/assets/reference2.jpg",
    badge: "Kicukiro",
    title: "Room to settle in and breathe.",
    meta: "Apartments · Trusted local hosts",
    price: "From 420,000 RWF/mo",
  },
  {
    image: "/assets/reference3.jpg",
    badge: "Kimihurura",
    title: "Quiet streets, close to everything.",
    meta: "Homes · Walkable neighbourhoods",
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
  const [aiLoading, setAiLoading] = useState(false);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [propertyResults, setPropertyResults] = useState<Property[]>([]);
  const [propertyError, setPropertyError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const setFilter = (key: keyof Filters, value: string) =>
    setFilters((cur) => ({ ...cur, [key]: value }));

  // ── text + filter matching ────────────────────────────────────
  function filterPropertyList(
    all: Property[],
    loc: string, pType: string, beds: string, bud: string,
    searchTxt?: string
  ): Property[] {
    return all.filter((p) => {
      if (loc && loc !== "Kigali" && loc !== "Anywhere in Rwanda") {
        const pLoc = `${p.district} ${p.neighborhood || ""} ${p.address_line || ""}`.toLowerCase();
        if (!pLoc.includes(loc.toLowerCase())) return false;
      }
      if (pType && pType !== "Any type") {
        if (p.property_type.toUpperCase() !== pType.toUpperCase()) return false;
      }
      if (beds && beds !== "Any") {
        if (beds === "Studio") { if (p.bedrooms !== 0) return false; }
        else if (beds === "5+") { if (p.bedrooms < 5) return false; }
        else {
          const n = parseInt(beds, 10);
          if (!isNaN(n) && p.bedrooms !== n) return false;
        }
      }
      if (bud && bud !== "Any budget") {
        if (bud === "Under 300,000 RWF" && p.rental_price > 300000) return false;
        if (bud === "300,000–600,000 RWF" && (p.rental_price < 300000 || p.rental_price > 600000)) return false;
        if (bud === "600,000+ RWF" && p.rental_price < 600000) return false;
      }
      if (searchTxt && searchTxt.trim()) {
        const term = searchTxt.toLowerCase();
        const content = `${p.title} ${p.description || ""} ${p.property_type} ${p.district} ${p.neighborhood || ""} ${p.address_line || ""}`.toLowerCase();
        if (!content.includes(term)) return false;
      }
      return true;
    });
  }

  // ── run search against current state ─────────────────────────
  function runSearch(q: string, f: Filters, all: Property[]) {
    const results = filterPropertyList(all, f.location, f.type, f.bedrooms, f.budget, q);
    setPropertyResults(results);
  }

  // ── live typing handler ───────────────────────────────────────
  function handleQueryChange(value: string) {
    setQuery(value);
    // Instant local filter as user types
    runSearch(value, filters, allProperties);

    // Debounce AI call — only fire after 600ms pause
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 3) return;
    debounceRef.current = setTimeout(() => {
      callAiParse(value.trim(), filters, allProperties);
    }, 600);
  }

  // ── AI parse for smarter filter extraction ───────────────────
  async function callAiParse(q: string, currentFilters: Filters, all: Property[]) {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/parse-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = (await res.json()) as { ok: true; filters: ParsedFilters } | { error: string };
      if ("ok" in data && data.ok) {
        const f = data.filters;
        const nextFilters: Filters = {
          location: f.location || currentFilters.location,
          type: f.type || currentFilters.type,
          bedrooms: f.bedrooms || currentFilters.bedrooms,
          budget: f.budget || currentFilters.budget,
        };
        setFilters(nextFilters);
        if (f.summary) setAiSummary(f.summary);
        const refined = filterPropertyList(all, nextFilters.location, nextFilters.type, nextFilters.bedrooms, nextFilters.budget, q);
        setPropertyResults(refined.length ? refined : filterPropertyList(all, "", "", "", "", q));
      }
    } catch {
      // keep current results on AI failure
    } finally {
      setAiLoading(false);
    }
  }

  // ── prompt chip click ─────────────────────────────────────────
  function handlePromptClick(p: string) {
    setQuery(p);
    setAiSummary("");
    runSearch(p, filters, allProperties);
    callAiParse(p, filters, allProperties);
  }

  // ── filter dropdown change → re-run search immediately ───────
  function handleFilterChange(key: keyof Filters, value: string) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    runSearch(query, next, allProperties);
  }

  // ── localStorage merge ────────────────────────────────────────
  function mergeWithLocalStorage(apiProperties: Property[]): Property[] {
    try {
      const raw = localStorage.getItem("inzuhub_custom_properties");
      if (!raw) return apiProperties;
      const local: Property[] = JSON.parse(raw);
      const map = new Map<string, Property>();
      apiProperties.forEach((p) => map.set(p.id, p));
      local.forEach((p) => map.set(p.id, p));
      return Array.from(map.values());
    } catch {
      return apiProperties;
    }
  }

  useEffect(() => {
    let cancelled = false;

    const loadProperties = async () => {
      try {
        const response = await fetch("/api/properties", { cache: "no-store" });
        const data = await response.json() as { properties?: Property[]; error?: string };
        if (!response.ok) throw new Error(data.error || "Could not load properties.");
        if (!cancelled) {
          const merged = mergeWithLocalStorage(data.properties ?? []);
          const initialQuery = new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
          setAllProperties(merged);
          setQuery(initialQuery);
          setPropertyResults(initialQuery
            ? filterPropertyList(merged, "", "", "", "", initialQuery)
            : merged);
          setPropertyError("");
        }
      } catch {
        if (!cancelled) {
          const localOnly = mergeWithLocalStorage([]);
          const initialQuery = new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
          setAllProperties(localOnly);
          setQuery(initialQuery);
          setPropertyResults(initialQuery
            ? filterPropertyList(localOnly, "", "", "", "", initialQuery)
            : localOnly);
          if (localOnly.length === 0) {
            setPropertyError("Property listings are temporarily unavailable. Please try again shortly.");
          }
        }
      }
    };

    loadProperties();

    const onPropertyUpdated = () => { if (!cancelled) loadProperties(); };
    window.addEventListener("inzuhub:property-updated", onPropertyUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener("inzuhub:property-updated", onPropertyUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasActiveFilter = Object.values(filters).some(Boolean) || query.trim().length > 0;

  return (
    <>
      {/* ── Search panel ──────────────────────────────────────── */}
      <section className="hero-search" id="homes" aria-label="Search for a home">
        <div className="hero-search-head">
          <div>
            <p className="eyebrow">Start with a few details</p>
            <h2>Find the right fit.</h2>
          </div>
          <span>Search verified homes across Rwanda</span>
        </div>

        {/* ── Live conversational search — results update as you type ── */}
        <div className="ai-search-bar" role="search">
          <input
            ref={inputRef}
            type="text"
            className="ai-search-input"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Type anything — location, rooms, budget, features…"
            aria-label="Search properties"
          />
          {aiLoading && <i className="spinner ai-search-spinner" aria-label="Searching…" />}
          {query && (
            <button
              type="button"
              className="ai-search-clear"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setAiSummary("");
                setFilters(emptyFilters);
                setPropertyResults(allProperties);
              }}
            >✕</button>
          )}
        </div>

        {/* Quick-prompt chips */}
        <div className="hero-chips ai-chips" role="list" aria-label="Example searches">
          {prompts.map((p) => (
            <button key={p} type="button" role="listitem" onClick={() => handlePromptClick(p)}>
              {p}
            </button>
          ))}
        </div>

        {aiSummary && (
          <p className="ai-search-status ok" role="status">✦ {aiSummary}</p>
        )}

        {/* ── Optional refinement filters — nothing required ── */}
        <div className="search-divider" aria-hidden="true">
          <span>refine results</span>
        </div>

        <div className="hero-filter-form">
          <label className="hero-filter-field location-filter">
            <span>Location</span>
            <select value={filters.location} onChange={(e) => handleFilterChange("location", e.target.value)}>
              <option value="">Anywhere in Rwanda</option>
              {locations.map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
          <label className="hero-filter-field type-filter">
            <span>Type</span>
            <select value={filters.type} onChange={(e) => handleFilterChange("type", e.target.value)}>
              <option value="">Any type</option>
              <option>APARTMENT</option>
              <option>HOUSE</option>
              <option>VILLA</option>
              <option>STUDIO</option>
              <option>LAND</option>
            </select>
          </label>
          <label className="hero-filter-field bedrooms-filter">
            <span>Bedrooms</span>
            <select value={filters.bedrooms} onChange={(e) => handleFilterChange("bedrooms", e.target.value)}>
              <option value="">Any</option>
              <option value="Studio">Studio</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5+">5+</option>
            </select>
          </label>
          <label className="hero-filter-field budget-filter">
            <span>Budget /mo</span>
            <select value={filters.budget} onChange={(e) => handleFilterChange("budget", e.target.value)}>
              <option value="">Any budget</option>
              <option>Under 300,000 RWF</option>
              <option>300,000–600,000 RWF</option>
              <option>600,000+ RWF</option>
            </select>
          </label>
          {hasActiveFilter && (
            <button
              type="button"
              className="hero-filter-clear"
              onClick={() => {
                setFilters(emptyFilters);
                setQuery("");
                setAiSummary("");
                setPropertyResults(allProperties);
              }}
            >
              Clear ✕
            </button>
          )}
        </div>
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
              <span data-i18n="home.card1.badge" data-i18n-default="Featured in Kicukiro">Featured in Kicukiro</span>
              <h3 data-i18n="home.card1.title" data-i18n-default="A home with room to breathe.">A home with room to breathe.</h3>
              <p data-i18n="home.card1.meta" data-i18n-default="3 bedrooms · Garden · Verified location">3 bedrooms · Garden · Verified location</p>
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
              <span data-i18n="home.card2.badge" data-i18n-default="Kimihurura">Kimihurura</span>
              <h3 data-i18n="home.card2.title" data-i18n-default="Quiet streets, close to everything.">Quiet streets, close to everything.</h3>
              <b>650,000 <small data-i18n="home.card2.price" data-i18n-default="RWF/mo">RWF/mo</small></b>
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
