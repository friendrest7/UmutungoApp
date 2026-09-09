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
  availability_status?: string;
  is_published?: boolean;
  cover_image_url?: string;
  image_urls?: string[];
  latitude?: number | null;
  longitude?: number | null;
  google_maps_url?: string;
  description?: string;
};

function propertyDetailsHref(property: Property, hash = "") {
  const details = new URLSearchParams({
    title: property.title,
    property_type: property.property_type,
    district: property.district,
    neighborhood: property.neighborhood,
    rental_price: String(property.rental_price),
    currency: property.currency,
    bedrooms: String(property.bedrooms),
    bathrooms: String(property.bathrooms),
  });
  if (property.cover_image_url) details.set("cover_image_url", property.cover_image_url);
  return `/properties/${encodeURIComponent(property.id)}?${details.toString()}${hash}`;
}

const emptyFilters: Filters = { location: "", type: "", bedrooms: "", budget: "" };
const localPropertyKeyPrefix = "inzuhub_custom_properties:";

// Keeps the landing search useful in demo environments where the backend has
// not been seeded yet. Real API properties take priority when available.
const demoHouseProperties: Property[] = [
  {
    id: "00000002-0000-0000-0000-000000000002",
    title: "Quiet family home near town",
    property_type: "HOUSE",
    district: "Gasabo",
    neighborhood: "Kimihurura",
    address_line: "KG 12 St, Kimihurura",
    rental_price: 650000,
    currency: "RWF",
    bedrooms: 3,
    bathrooms: 2,
    verification_status: "VERIFIED",
    availability_status: "AVAILABLE",
    is_published: true,
    cover_image_url: "/images/properties/kigali-home.jpg",
    description: "A well-maintained family home close to schools, shops, and public transport.",
  },
  {
    id: "00000002-0000-0000-0000-000000000003",
    title: "Modern home with a private garden",
    property_type: "HOUSE",
    district: "Kicukiro",
    neighborhood: "Gikondo",
    address_line: "KK 15 Ave, Gikondo",
    rental_price: 550000,
    currency: "RWF",
    bedrooms: 3,
    bathrooms: 2,
    verification_status: "VERIFIED",
    availability_status: "AVAILABLE",
    is_published: true,
    cover_image_url: "/images/properties/kigali-villa.jpg",
    description: "Spacious house with a private garden, security, parking, and Wi-Fi infrastructure.",
  },
  {
    id: "00000002-0000-0000-0000-000000000008",
    title: "Three-bedroom house in Remera",
    property_type: "HOUSE",
    district: "Gasabo",
    neighborhood: "Remera",
    address_line: "KG 9 Ave, Remera",
    rental_price: 620000,
    currency: "RWF",
    bedrooms: 3,
    bathrooms: 2,
    verification_status: "VERIFIED",
    availability_status: "AVAILABLE",
    is_published: true,
    cover_image_url: "/images/properties/kigali-home.jpg",
    description: "A comfortable home near the airport road, supermarkets, and public transport.",
  },
  {
    id: "00000002-0000-0000-0000-000000000009",
    title: "Bright family house in Kicukiro",
    property_type: "HOUSE",
    district: "Kicukiro",
    neighborhood: "Niboye",
    address_line: "KK 28 Ave, Niboye",
    rental_price: 720000,
    currency: "RWF",
    bedrooms: 4,
    bathrooms: 2,
    verification_status: "VERIFIED",
    availability_status: "AVAILABLE",
    is_published: true,
    cover_image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    description: "A spacious family house with a secure compound, parking, and a quiet garden.",
  },
  {
    id: "00000002-0000-0000-0000-000000000015",
    title: "Three-bedroom house with a volcano view",
    property_type: "HOUSE",
    district: "Musanze",
    neighborhood: "Musanze Town",
    address_line: "Musanze Town Road",
    rental_price: 450000,
    currency: "RWF",
    bedrooms: 3,
    bathrooms: 2,
    verification_status: "VERIFIED",
    availability_status: "AVAILABLE",
    is_published: true,
    cover_image_url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
    description: "A warm family home with a large compound and mountain views.",
  },
  {
    id: "00000002-0000-0000-0000-000000000019",
    title: "Quiet townhouse in Kacyiru",
    property_type: "HOUSE",
    district: "Gasabo",
    neighborhood: "Kacyiru",
    address_line: "KG 5 Ave, Kacyiru",
    rental_price: 580000,
    currency: "RWF",
    bedrooms: 2,
    bathrooms: 2,
    verification_status: "VERIFIED",
    availability_status: "AVAILABLE",
    is_published: true,
    cover_image_url: "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1200&q=80",
    description: "A comfortable townhouse with parking, security, and easy access to offices and schools.",
  },
  {
    id: "00000002-0000-0000-0000-000000000025",
    title: "Affordable family house in Gatsibo",
    property_type: "HOUSE",
    district: "Gatsibo",
    neighborhood: "Kabarore",
    address_line: "Kabarore Road",
    rental_price: 350000,
    currency: "RWF",
    bedrooms: 3,
    bathrooms: 2,
    verification_status: "VERIFIED",
    availability_status: "AVAILABLE",
    is_published: true,
    cover_image_url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    description: "A three-bedroom home with a secure yard and access to local markets and transport.",
  },
  {
    id: "00000002-0000-0000-0000-000000000027",
    title: "Garden house in Huye",
    property_type: "HOUSE",
    district: "Huye",
    neighborhood: "Huye Town",
    address_line: "Butare Heights",
    rental_price: 680000,
    currency: "RWF",
    bedrooms: 4,
    bathrooms: 3,
    verification_status: "VERIFIED",
    availability_status: "AVAILABLE",
    is_published: true,
    cover_image_url: "https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1200&q=80",
    description: "A spacious four-bedroom home with a private garden and secure parking.",
  },
];

const demoCategoryProperties: Property[] = [
  {
    id: "00000002-0000-0000-0000-000000000010",
    title: "Modern apartment near Kigali City Centre",
    property_type: "APARTMENT",
    district: "Nyarugenge",
    neighborhood: "Kiyovu",
    address_line: "KN 7 St, Kiyovu",
    rental_price: 380000,
    currency: "RWF",
    bedrooms: 2,
    bathrooms: 1,
    verification_status: "VERIFIED",
    availability_status: "AVAILABLE",
    is_published: true,
    cover_image_url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    description: "A clean two-bedroom apartment with reliable water, tiled floors, and easy access to shops.",
  },
  {
    id: "00000002-0000-0000-0000-000000000011",
    title: "Executive five-bedroom villa in Nyarutarama",
    property_type: "VILLA",
    district: "Gasabo",
    neighborhood: "Nyarutarama",
    address_line: "KG 9 Ave, Nyarutarama",
    rental_price: 1500000,
    currency: "RWF",
    bedrooms: 5,
    bathrooms: 4,
    verification_status: "VERIFIED",
    availability_status: "AVAILABLE",
    is_published: true,
    cover_image_url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
    description: "A premium villa with a private garden, staff quarters, secure parking, and Kigali views.",
  },
  {
    id: "00000002-0000-0000-0000-000000000012",
    title: "Furnished student studio in Huye",
    property_type: "STUDIO",
    district: "Huye",
    neighborhood: "Ngoma",
    address_line: "KG 15 Rd, Ngoma",
    rental_price: 220000,
    currency: "RWF",
    bedrooms: 0,
    bathrooms: 1,
    verification_status: "VERIFIED",
    availability_status: "AVAILABLE",
    is_published: true,
    cover_image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    description: "A compact furnished studio close to the university, shops, and everyday transport.",
  },
  {
    id: "00000002-0000-0000-0000-000000000013",
    title: "Serviced office in Kimihurura",
    property_type: "OFFICE",
    district: "Gasabo",
    neighborhood: "Kimihurura",
    address_line: "KG 12 St, Kimihurura",
    rental_price: 900000,
    currency: "RWF",
    bedrooms: 0,
    bathrooms: 2,
    verification_status: "VERIFIED",
    availability_status: "AVAILABLE",
    is_published: true,
    cover_image_url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    description: "A flexible office suite with reception space, secure access, parking, and backup power.",
  },
  {
    id: "00000002-0000-0000-0000-000000000014",
    title: "Residential land plot near Bugesera airport",
    property_type: "LAND",
    district: "Bugesera",
    neighborhood: "Nyamata",
    address_line: "RN3, Nyamata",
    rental_price: 2500000,
    currency: "RWF",
    bedrooms: 0,
    bathrooms: 0,
    verification_status: "VERIFIED",
    availability_status: "AVAILABLE",
    is_published: true,
    cover_image_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    description: "A level residential plot with road access, suitable for a family home or development.",
  },
];

const demoSearchProperties = [...demoHouseProperties, ...demoCategoryProperties];

/*
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
*/

const RWANDA_DISTRICTS = [
  { id: "all", name: "Rwanda", query: "Rwanda", zoom: 8 },
  { id: "kicukiro", name: "Kicukiro", query: "Kicukiro, Kigali, Rwanda", zoom: 13 },
  { id: "gasabo", name: "Gasabo", query: "Gasabo, Kigali, Rwanda", zoom: 13 },
  { id: "nyagatare", name: "Nyagatare", query: "Nyagatare, Eastern Province, Rwanda", zoom: 12 },
  { id: "nyarugenge", name: "Nyarugenge", query: "Nyarugenge, Kigali, Rwanda", zoom: 13 },
  { id: "musanze", name: "Musanze", query: "Musanze, Northern Province, Rwanda", zoom: 12 },
  { id: "rubavu", name: "Rubavu", query: "Rubavu, Western Province, Rwanda", zoom: 12 },
];

export function LandingInteractive({ showSearch = false, homesOnly = false }: { showSearch?: boolean; homesOnly?: boolean }) {
  const searchEnabled = showSearch || homesOnly;
  const [activeDistrict, setActiveDistrict] = useState(RWANDA_DISTRICTS[0]);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [query, setQuery]     = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [propertyResults, setPropertyResults] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyError, setPropertyError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
        const term = searchTxt.toLowerCase().trim();
        const content = `${p.title} ${p.description || ""} ${p.property_type} ${p.district} ${p.neighborhood || ""} ${p.address_line || ""}`.toLowerCase();
        const categoryAliases: Record<string, string[]> = {
          APARTMENT: ["apartment", "apartments", "flat", "flats"],
          HOUSE: ["house", "houses", "home", "homes"],
          VILLA: ["villa", "villas"],
          STUDIO: ["studio", "studios"],
          OFFICE: ["office", "offices"],
          LAND: ["land", "plot", "plots"],
        };
        const categoryMatch = Object.entries(categoryAliases).some(([type, aliases]) =>
          p.property_type.toUpperCase() === type && aliases.some((alias) => term === alias),
        );
        if (!content.includes(term) && !categoryMatch) return false;
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
      callAiParse(value.trim(), filters);
    }, 600);
  }

  // ── AI parse for smarter filter extraction ───────────────────
  async function callAiParse(q: string, currentFilters: Filters) {
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
        const parsedFilters = normalizeAiFilters(f);
        const nextFilters: Filters = {
          location: parsedFilters.location || currentFilters.location,
          type: parsedFilters.type || currentFilters.type,
          bedrooms: parsedFilters.bedrooms || currentFilters.bedrooms,
          budget: parsedFilters.budget || currentFilters.budget,
        };
        setFilters(nextFilters);
        if (f.summary) setAiSummary(f.summary);
        setSearchLoading(true);
        try {
          await loadDatabaseSearchResults(q, nextFilters);
        } finally {
          setSearchLoading(false);
        }
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
    callAiParse(p, filters);
  }

  // ── filter dropdown change → re-run search immediately ───────
  function handleFilterChange(key: keyof Filters, value: string) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    runSearch(query, next, allProperties);
  }

  function normalizeAiFilters(parsed: ParsedFilters): Filters {
    const type = parsed.type.toUpperCase();
    const bedrooms = parsed.bedrooms.startsWith("3") ? "3+" : parsed.bedrooms.match(/^([0-9]+)/)?.[1] ?? "";
    return {
      location: parsed.location,
      type: ["APARTMENT", "HOUSE", "VILLA", "STUDIO", "OFFICE", "LAND"].includes(type) ? type : "",
      bedrooms,
      budget: parsed.budget,
    };
  }

  function buildDatabaseSearchParams(q: string, f: Filters) {
    const params = new URLSearchParams({ limit: "100" });
    const structuredSearch = Object.values(f).some(Boolean);
    if (q.trim() && !structuredSearch) params.set("q", q.trim());
    if (f.location && f.location !== "Anywhere in Rwanda") params.set("location", f.location);
    if (f.type && f.type !== "Any type") params.set("property_type", f.type.toUpperCase());
    if (f.bedrooms && f.bedrooms !== "Any" && f.bedrooms !== "Studio") {
      params.set("min_bedrooms", f.bedrooms === "5+" || f.bedrooms === "3+" ? "3" : String(parseInt(f.bedrooms, 10)));
    }
    if (f.budget === "Under 300,000 RWF") params.set("max_price", "300000");
    if (f.budget === "300,000â€“600,000 RWF") {
      params.set("min_price", "300000");
      params.set("max_price", "600000");
    }
    if (f.budget === "600,000+ RWF") params.set("min_price", "600000");
    return params;
  }

  async function loadDatabaseSearchResults(q: string, f: Filters) {
    const response = await fetch(`/api/properties?${buildDatabaseSearchParams(q, f).toString()}`, { cache: "no-store" });
    const data = await response.json() as { properties?: Property[]; error?: string };
    if (!response.ok) throw new Error(data.error || "Search could not be completed.");
    const properties = mergeWithLocalStorage(data.properties ?? []);
    const hasStructuredSearch = Object.values(f).some(Boolean);
    setAllProperties(properties);
    setPropertyResults(filterPropertyList(properties, f.location, f.type, f.bedrooms, f.budget, hasStructuredSearch ? "" : q));
    return properties;
  }

  async function searchDatabase() {
    if (!hasActiveFilter) return;
    setSearchLoading(true);
    setPropertyError("");
    try {
      await loadDatabaseSearchResults(query, filters);
    } catch (reason) {
      setPropertyResults([]);
      setPropertyError(reason instanceof Error ? reason.message : "Search could not be completed.");
    } finally {
      setSearchLoading(false);
    }
  }

  // ── localStorage merge ────────────────────────────────────────
  function mergeWithLocalStorage(apiProperties: Property[]): Property[] {
    try {
      // Only deliberately published listings are public. Account-owned drafts
      // stay in the account-specific storage key used by the owner portal.
      const local: Property[] = [];
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (!key?.startsWith(localPropertyKeyPrefix)) continue;
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const items = JSON.parse(raw) as Property[];
        local.push(...items.filter((property) =>
          property.is_published !== false && property.availability_status !== "RENTED" && property.availability_status !== "UNAVAILABLE",
        ));
      }
      const map = new Map<string, Property>();
      const searchableProperties = apiProperties.length > 0 ? apiProperties : demoSearchProperties;
      searchableProperties.forEach((p) => map.set(p.id, p));
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
        const response = await fetch("/api/properties?limit=100", { cache: "no-store" });
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
          if (initialQuery) {
            void callAiParse(initialQuery, emptyFilters);
          }
        }
      } catch {
        if (!cancelled) {
          const initialQuery = new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
          const fallback = mergeWithLocalStorage([]);
          setAllProperties(fallback);
          setQuery(initialQuery);
          setPropertyResults(initialQuery
            ? filterPropertyList(fallback, "", "", "", "", initialQuery)
            : fallback);
          setPropertyError("");
        }
      }
    };

    if (!searchEnabled) return;

    loadProperties();

    const onPropertyUpdated = () => { if (!cancelled) loadProperties(); };
    window.addEventListener("inzuhub:property-updated", onPropertyUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener("inzuhub:property-updated", onPropertyUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchEnabled]);

  const hasActiveFilter = Object.values(filters).some(Boolean) || query.trim().length > 0;

  return (
    <>
      {/* ── Search panel ──────────────────────────────────────── */}
      {searchEnabled && (
        <>
      <section className="hero-search" id="search" aria-label="Search for a home">
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
              <option>OFFICE</option>
              <option>LAND</option>
            </select>
          </label>
          <label className="hero-filter-field bedrooms-filter">
            <span>Bedrooms</span>
            <select value={filters.bedrooms} onChange={(e) => handleFilterChange("bedrooms", e.target.value)}>
              <option value="">Any</option>
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
          <button
            type="button"
            className="hero-filter-search"
            onClick={searchDatabase}
            disabled={!hasActiveFilter || searchLoading}
          >
            {searchLoading ? "Searching..." : "Search homes"}
          </button>
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

      {(hasActiveFilter || propertyResults.length > 0) && (
        <section className="search-results" aria-live="polite">
          <div className="section-intro">
            <p className="eyebrow">Live from Umutungo</p>
            <h2>
              {propertyResults.length > 0
                ? `${propertyResults.length} homes match your search.`
                : "No published properties match your search."}
            </h2>
            {!propertyResults.length && (
              <p className="search-results-subtitle">
                Start with these trusted Kigali spaces, then search again when you are ready.
              </p>
            )}
          </div>
          {propertyError && (
            <p className="search-results-notice" role="status">
              No published properties match your search.
            </p>
          )}
          <div className="discovery-cards">
            {propertyResults.length === 0 ? (
              <p className="search-results-notice" role="status">
                {propertyError || "No published properties match your search."}
              </p>
            ) : propertyResults.map((property) => {
              const mapLink =
                property.google_maps_url ||
                (property.latitude && property.longitude
                  ? `https://www.google.com/maps?q=${property.latitude},${property.longitude}`
                  : undefined);
              const photoCount = Math.max(property.image_urls?.length ?? 0, property.cover_image_url ? 1 : 0);

              return (
                <article className="small-discovery" key={property.id}>
                  <button
                    type="button"
                    className="search-result-image search-result-image-button"
                    onClick={() => setSelectedProperty(property)}
                    aria-label={`Preview ${property.title}`}
                  >
                    <img
                      src={
                        property.cover_image_url ||
                        "/images/properties/hero-home.jpg"
                      }
                      alt={`${property.title} in ${property.district}`}
                      loading="lazy"
                    />
                    <span className="search-result-category">{property.property_type}</span>
                    <span className="search-result-photo-count">
                      {photoCount} {photoCount === 1 ? "photo" : "photos"}
                    </span>
                    <span className="search-image-hint">View larger image</span>
                  </button>
                  <div className="search-result-content">
                    <span className="search-result-kicker">
                      {property.property_type} · {property.verification_status === "VERIFIED" ? "Verified home" : "Active listing"}
                    </span>
                    <h3>{property.title}</h3>
                    <p className="search-result-location">
                      📍 {property.neighborhood ? `${property.neighborhood}, ` : ""}{property.district}
                    </p>
                    <div className="search-result-price-row">
                      <b className="search-result-price">
                        {property.rental_price.toLocaleString()} <small>{property.currency}/mo</small>
                      </b>
                      <a href={propertyDetailsHref(property)} className="button small search-result-view-action">
                        View house →
                      </a>
                    </div>
                    <div className="search-result-features" aria-label="Property features">
                      <span>🛏 {property.bedrooms} beds</span>
                      <span>🚿 {property.bathrooms} baths</span>
                      <span className="search-result-verified">✓ Verified</span>
                      {mapLink && (
                        <a
                          className="search-result-map-link"
                          href={mapLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          🗺 Map ↗
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
      {selectedProperty && (
        <div
          className="search-preview-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedProperty(null);
          }}
        >
          <section className="search-preview-panel" role="dialog" aria-modal="true" aria-labelledby="search-preview-title">
            <button
              type="button"
              className="search-preview-close"
              onClick={() => setSelectedProperty(null)}
              aria-label="Close property preview"
            >
              ×
            </button>
            <div className="search-preview-image-wrap">
              <img
                src={selectedProperty.cover_image_url || "/images/properties/hero-home.jpg"}
                alt={`${selectedProperty.title} in ${selectedProperty.district}`}
              />
            </div>
            <div className="search-preview-content">
              <span className="search-preview-kicker">
                {selectedProperty.property_type} · {selectedProperty.verification_status === "VERIFIED" ? "Verified home" : "Active listing"}
              </span>
              <h2 id="search-preview-title">{selectedProperty.title}</h2>
              <p className="search-preview-location">
                {selectedProperty.neighborhood ? `${selectedProperty.neighborhood}, ` : ""}{selectedProperty.district} · {selectedProperty.bedrooms} bedrooms · {selectedProperty.bathrooms} bathrooms
              </p>
              <strong className="search-preview-price">
                {selectedProperty.rental_price.toLocaleString()} {selectedProperty.currency}/mo
              </strong>
              {selectedProperty.description && <p className="search-preview-description">{selectedProperty.description}</p>}
              <div className="search-preview-actions">
                <a
                  href={propertyDetailsHref(selectedProperty)}
                  className="button search-preview-view-btn"
                >
                  View house →
                </a>
              </div>
            </div>
          </section>
        </div>
      )}

        </>
      )}

      {!homesOnly && (
        <>
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
              <a
                href={propertyDetailsHref(demoHouseProperties[1])}
                className="discovery-view-btn"
              >
                View house →
              </a>
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
              <a
                href={propertyDetailsHref(demoHouseProperties[0])}
                className="discovery-view-btn"
              >
                View house →
              </a>
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
                href={`/homes?q=${encodeURIComponent(activeDistrict.name)}#search`}
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
      )}
    </>
  );
}
