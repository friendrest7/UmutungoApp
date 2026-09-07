"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { SiteControls } from "@/components/site-controls";
import { AccountNav } from "@/components/account-nav";

interface SiteHeaderProps {
  /** "marketing" = full nav + pills + showcase drawer + controls (default)
   *  "minimal"   = logo + search/controls only (used on sign-in, property pages) */
  variant?: "marketing" | "minimal";
}

interface ShowcaseCard {
  id: string;
  title: string;
  price: string;
  specs: string;
  badge: string;
  timeAgo: string;
  image: string;
  href: string;
}

const SHOWCASE_ITEMS: ShowcaseCard[] = [
  {
    id: "villa-1",
    title: "Nyarutarama Villa",
    price: "$1,400/mo",
    specs: "4 Beds · Pool",
    badge: "✦ Featured",
    timeAgo: "5m ago",
    image: "/images/properties/kigali-villa.jpg",
    href: "/#homes",
  },
  {
    id: "apt-1",
    title: "Kiyovu Heights",
    price: "$850/mo",
    specs: "2 Beds · City View",
    badge: "✓ Verified",
    timeAgo: "18m ago",
    image: "/images/properties/kigali-apartment.jpg",
    href: "/#homes",
  },
  {
    id: "home-1",
    title: "Kimihurura Garden",
    price: "$600/mo",
    specs: "3 Beds · Yard",
    badge: "★ Top Rated",
    timeAgo: "23m ago",
    image: "/images/properties/kigali-home.jpg",
    href: "/#homes",
  },
  {
    id: "sky-1",
    title: "Gacuriro Residence",
    price: "$950/mo",
    specs: "3 Beds · Balcony",
    badge: "✦ New",
    timeAgo: "35m ago",
    image: "/images/properties/hero-home.jpg",
    href: "/#homes",
  },
  {
    id: "studio-1",
    title: "Kacyiru Studio",
    price: "$450/mo",
    specs: "1 Bed · Fast WiFi",
    badge: "⚡ Instant",
    timeAgo: "42m ago",
    image: "/assets/denisdoukhan-south-africa-3688006_1920.jpg",
    href: "/#homes",
  },
];

function BrandLogo() {
  return (
    <Link href="/" className="logo" aria-label="Umutungo Home">
      <i aria-hidden="true" />
      <span>Umutungo</span>
    </Link>
  );
}

export function SiteHeader({ variant = "marketing" }: SiteHeaderProps) {
  const [activeTab, setActiveTab] = useState<string>("find");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showcaseOpen, setShowcaseOpen] = useState<boolean>(false);
  const [savedCount] = useState<number>(3);
  const [moreOpen, setMoreOpen] = useState<boolean>(false);

  // Sync active tab with hash on load and change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "homes") setActiveTab("find");
      else if (hash === "list") setActiveTab("list");
      else if (hash === "agents") setActiveTab("agents");
      else if (hash === "how") setActiveTab("how");
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = searchQuery.trim();
    window.location.assign(query ? `/?q=${encodeURIComponent(query)}#homes` : "/#homes");
  }

  return (
    <div className="site-header-wrapper">
      <header className={`site-header-island ${variant === "minimal" ? "minimal" : ""}`}>
        {/* Top-left concave SVG ear (Mac / Dynamic Island Notch curve from 2.png) */}
        <svg className="notch-ear notch-ear-left" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M 0,0 Q 24,0 24,24 L 24,0 Z" className="notch-ear-fill" />
          <path d="M 0,0 Q 24,0 24,24" fill="none" className="notch-ear-stroke" />
        </svg>

        {/* ── ROW 1: Brand + Minimalist Search + Right Action Buttons ── */}
        <div className="nav-row-top">
          <div className="nav-brand-search">
            <BrandLogo />

            <form className="nav-search-form" onSubmit={handleSearchSubmit} role="search">
              <span className="nav-search-icon" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                className="nav-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search homes, Kigali..."
              aria-label="Search properties in Rwanda"
              />
              <button type="submit" className="nav-search-kbd" aria-label="Submit search" title="Search">
                ↵
              </button>
            </form>
          </div>

          <div className="nav-actions">
            {/* Star / Saved button (from 2.png circular buttons) */}
            <Link
              href="/#homes"
              className="nav-circle-btn"
              aria-label={`Saved homes (${savedCount})`}
              title="Saved homes"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {savedCount > 0 && <span className="nav-badge-dot" />}
            </Link>

            {/* Grid toggle button (matching 2.png grid icon to toggle Kigali cards drawer) */}
            {variant === "marketing" && (
              <button
                type="button"
                className={`nav-circle-btn ${showcaseOpen ? "active" : ""}`}
                onClick={() => setShowcaseOpen((prev) => !prev)}
                aria-label={showcaseOpen ? "Close Kigali showcase" : "Open Kigali showcase drawer"}
                title="Toggle featured showcase"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </button>
            )}

            {/* Site controls: Language, Accent picker, Theme mode */}
            <SiteControls />

            {/* Account / Sign-in */}
            <AccountNav />

            {/* One secondary navigation bar, hidden until requested. */}
            {variant === "marketing" && (
              <button
                type="button"
                className={`nav-more-button ${moreOpen ? "active" : ""}`}
                onClick={() => setMoreOpen((prev) => !prev)}
                aria-label={moreOpen ? "Hide navigation" : "Show navigation"}
                aria-expanded={moreOpen}
              >
                <span aria-hidden="true">{moreOpen ? "−" : "+"}</span>
                <small>See more</small>
              </button>
            )}
          </div>
        </div>

        {/* ── ROW 2: Pill Navigation Tabs (The signature 2.png Pill Tabs!) ── */}
        {variant === "marketing" && moreOpen && (
          <nav className="nav-row-pills" aria-label="Primary navigation">
            <Link
              href="/#homes"
              data-i18n="find"
              className={`nav-pill ${activeTab === "find" ? "active" : ""}`}
              onClick={() => setActiveTab("find")}
            >
              <span>Find a home</span>
              <span className="nav-pill-badge">48</span>
            </Link>

            <Link
              href="/sign-in?callbackUrl=/dashboard/owner%23add-property"
              data-i18n="addProperty"
              className={`nav-pill ${activeTab === "add-property" ? "active" : ""}`}
              onClick={() => setActiveTab("add-property")}
            >
              <span>Add your property</span>
              <span className="nav-pill-badge">New</span>
            </Link>

            <Link
              href="/#agents"
              data-i18n="agents"
              className={`nav-pill ${activeTab === "agents" ? "active" : ""}`}
              onClick={() => setActiveTab("agents")}
            >
              <span>For agents</span>
              <span className="nav-pill-badge">12</span>
            </Link>

            <Link
              href="/#how"
              data-i18n="how"
              className={`nav-pill ${activeTab === "how" ? "active" : ""}`}
              onClick={() => setActiveTab("how")}
            >
              <span>How it works</span>
              <span className="nav-pill-badge">Guide</span>
            </Link>

            <Link
              href="/about"
              className={`nav-pill ${activeTab === "about" ? "active" : ""}`}
              onClick={() => setActiveTab("about")}
            >
              <span>About us</span>
              <span className="nav-pill-badge">Story</span>
            </Link>

            {/* Plus button (circular button from 2.png) */}
            <Link
              href="/sign-in?callbackUrl=/dashboard/owner%23add-property"
              className="nav-pill-plus"
              aria-label="Add your property"
              title="Add your property"
            >
              +
            </Link>
          </nav>
        )}

        {/* ── ROW 3: Kigali Quick Discovery Cards Showcase (from 2.png cards row) ── */}
        {variant === "marketing" && showcaseOpen && (
          <div className="nav-showcase-drawer" role="region" aria-label="Featured Kigali homes showcase">
            <div className="nav-showcase-header">
              <span className="nav-showcase-title">Featured Kigali Listings</span>
              <button
                type="button"
                className="nav-showcase-close"
                onClick={() => setShowcaseOpen(false)}
                aria-label="Close showcase drawer"
              >
                ✕ Close
              </button>
            </div>
            <div className="nav-cards-grid">
              {SHOWCASE_ITEMS.map((item) => (
                <Link key={item.id} href={item.href} className="nav-card-item">
                  <img src={item.image} alt={item.title} className="nav-card-thumb" loading="lazy" />
                  <div className="nav-card-overlay">
                    <span className="nav-card-top-tag">{item.badge}</span>
                    <div className="nav-card-info">
                      <strong className="nav-card-name">{item.title}</strong>
                      <span className="nav-card-meta">{item.specs}</span>
                      <div className="nav-card-footer">
                        <span>{item.price}</span>
                        <span>•</span>
                        <span>{item.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Top-right concave SVG ear (Mac / Dynamic Island Notch curve from 2.png) */}
        <svg className="notch-ear notch-ear-right" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M 24,0 Q 0,0 0,24 L 0,0 Z" className="notch-ear-fill" />
          <path d="M 24,0 Q 0,0 0,24" fill="none" className="notch-ear-stroke" />
        </svg>
      </header>
    </div>
  );
}
