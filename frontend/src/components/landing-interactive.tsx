"use client";

import Image from "next/image";
import { FormEvent, useRef, useState } from "react";
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
  rental_price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  verification_status: string;
};
const emptyFilters: Filters = { location: "", type: "", bedrooms: "", budget: "" };

export function LandingInteractive() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [query, setQuery]     = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [aiError, setAiError]     = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [propertyResults, setPropertyResults] = useState<Property[]>([]);
  const [propertyError, setPropertyError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const hasFilter = Object.values(filters).some(Boolean);
  const setFilter = (key: keyof Filters, value: string) =>
    setFilters((cur) => ({ ...cur, [key]: value }));

  // ── Conversational search ──────────────────────────────────────
  const handleAiSearch = async (text: string) => {
    const q = text.trim();
    if (!q) return;
    setQuery(q);
    setAiError("");
    setAiSummary("");
    setAiLoading(true);
    try {
      const res  = await fetch("/api/ai/parse-search", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ query: q }),
      });
      const data = await res.json() as
        | { ok: true;  filters: ParsedFilters }
        | { error: string };
      if ("ok" in data && data.ok) {
        const f = data.filters;
        setFilters({
          location: f.location || filters.location,
          type:     f.type     || filters.type,
          bedrooms: f.bedrooms || filters.bedrooms,
          budget:   f.budget   || filters.budget,
        });
        setAiSummary(f.summary);
      } else {
        setAiError("error" in data ? data.error : "Could not understand that query.");
      }
    } catch {
      setAiError("AI search is temporarily unavailable. Use the filters below.");
    } finally {
      setAiLoading(false);
    }
  };

  const onAiSubmit = (event: FormEvent) => {
    event.preventDefault();
    handleAiSearch(query);
  };

  // ── Manual filter submit (existing behaviour) ──────────────────
  const submitSearch = async (event: FormEvent) => {
    event.preventDefault();
    if (!hasFilter || filterLoading) return;
    setAiSummary("");
    setAiError("");
    setPropertyError("");
    setFilterLoading(true);
    const params = new URLSearchParams();
    if (filters.location && filters.location !== "Kigali") params.set("location", filters.location);
    if (filters.type) params.set("property_type", filters.type.toUpperCase());
    if (filters.bedrooms) params.set("min_bedrooms", filters.bedrooms.startsWith("3") ? "3" : filters.bedrooms[0]);
    if (filters.budget) {
      const maxPrice = filters.budget === "Under 300,000 RWF"
        ? "300000"
        : filters.budget === "300,000–600,000 RWF" ? "600000" : "";
      if (maxPrice) params.set("max_price", maxPrice);
    }

    try {
      const response = await fetch(`/api/properties?${params}`);
      const data = await response.json() as { properties?: Property[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Could not load properties.");
      setPropertyResults(data.properties || []);
    } catch (error) {
      setPropertyResults([]);
      setPropertyError(error instanceof Error ? error.message : "Could not load properties.");
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
            <p className="eyebrow">Start with a few details</p>
            <h2>Find the right fit.</h2>
          </div>
          <span>Search verified homes across Rwanda</span>
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
              {p}
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
        <form onSubmit={submitSearch}>
          <label>
            <span>Location</span>
            <select
              value={filters.location}
              onChange={(e) => setFilter("location", e.target.value)}
            >
              <option value="">Anywhere in Rwanda</option>
              {locations.map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
          <label>
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
          <label>
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
          <label>
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
            <p className="eyebrow">Live from InzuHub</p>
            <h2>{propertyResults.length} homes match your search.</h2>
          </div>
          {propertyError && <p role="alert">{propertyError}</p>}
          <div className="discovery-cards">
            {propertyResults.map((property) => (
              <article className="small-discovery" key={property.id}>
                <div>
                  <span>{property.verification_status === "VERIFIED" ? "Verified home" : "Verification in progress"}</span>
                  <h3>{property.title}</h3>
                  <p>{property.neighborhood}, {property.district} · {property.bedrooms} bedrooms</p>
                  <b>{property.rental_price.toLocaleString()} <small>{property.currency}/mo</small></b>
                  <a href={`/properties/${property.id}`}>View property →</a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Discovery / listing cards ──────────────────────────── */}
      <section className="discovery" id="list">
        <div className="section-intro">
          <p className="eyebrow coral">The InzuHub way</p>
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
          <a className="map-link" href="https://www.google.com/maps/place/Rwanda" target="_blank" rel="noreferrer">
            Open the map ↗
          </a>
        </div>
        <div className="map-visual">
          <span className="map-marker marker-one">Kicukiro</span>
          <span className="map-marker marker-two">Gasabo</span>
          <span className="map-marker marker-three">Nyagatare</span>
          <div className="map-grid" />
          <p>Map view · Rwanda</p>
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
