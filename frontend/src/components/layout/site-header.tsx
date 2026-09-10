"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { SiteControls } from "@/components/site-controls";
import { AccountNav } from "@/components/account-nav";
import { BrandLogo } from "@/components/brand-logo";

interface SiteHeaderProps {
  /** "marketing" shows the full marketplace navigation; "minimal" keeps only core controls. */
  variant?: "marketing" | "minimal";
}

function dashboardPath(role?: string) {
  const normalized = (role ?? "").toUpperCase();
  if (normalized === "ADMIN") return "/dashboard/admin";
  if (normalized === "OWNER") return "/dashboard/owner";
  if (normalized === "AGENT" || normalized === "COMMISSIONER") return "/dashboard/commissioner";
  return "/dashboard/tenant";
}


function SearchForm({
  value,
  onChange,
  onSubmit,
  mobile = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  mobile?: boolean;
}) {
  return (
    <form
      className={`nav-search-form ${mobile ? "nav-search-mobile" : "nav-search-desktop"}`}
      onSubmit={onSubmit}
      role="search"
    >
      <span className="nav-search-icon" aria-hidden="true">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <label className="sr-only" htmlFor={mobile ? "mobile-property-search" : "property-search"}>
        Search properties
      </label>
      <input
        id={mobile ? "mobile-property-search" : "property-search"}
        className="nav-search-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search houses, land, apartments..."
        data-i18n="Search houses, land, apartments..."
        aria-label="Search properties"
      />
      <button type="submit" className="nav-search-submit" aria-label="Search properties" title="Search">
        <span aria-hidden="true">↵</span>
      </button>
    </form>
  );
}

function NotificationButton({ role, mobile = false }: { role?: string; mobile?: boolean }) {
  const href = `${dashboardPath(role)}#notifications`;
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    fetch("/api/notifications", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (mounted && payload?.ok && typeof payload.unread_count === "number") {
          setUnreadCount(payload.unread_count);
        }
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  const label = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";
  return (
    <Link className={`nav-action-link nav-notification-link${mobile ? " mobile-only-action" : ""}`} href={href} aria-label={label} title={label}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
      <span className="sr-only">Notifications</span>
      {unreadCount > 0 && <span className="nav-notification-badge" aria-label={`${unreadCount} unread`}>{unreadCount > 99 ? "99+" : unreadCount}</span>}
    </Link>
  );
}

function PostAction({ authenticated: _authenticated, mobile = false }: { authenticated: boolean; mobile?: boolean }) {
  // Everyone — authenticated sellers and unauthenticated users alike — goes straight to the form.
  // Sign-in is requested only when they try to publish.
  return (
    <Link className="nav-action-link nav-post-link" href="/add-property">
      <span aria-hidden="true">＋</span>
      <span data-i18n="Add a Post">Add a Post</span>
    </Link>
  );
}

export function SiteHeader({ variant = "marketing" }: SiteHeaderProps) {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const authenticated = status === "authenticated" && Boolean(session?.user);
  const role = session?.user?.role;

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    window.location.assign(query ? `/homes?q=${encodeURIComponent(query)}#search` : "/homes#search");
  }

  return (
    <div className={`site-header-wrapper site-header-wrapper--${variant}`}>
      <header className="site-header-island">
        <div className="nav-row-top">
          <BrandLogo textOnly />

          <Link className="nav-text-link nav-home-link" href="/" data-i18n="Home">Home</Link>
          <SearchForm value={searchQuery} onChange={setSearchQuery} onSubmit={handleSearchSubmit} />

          <nav className="nav-primary" aria-label="Marketplace navigation">
            {variant === "marketing" && <PostAction authenticated={authenticated} />}
            {authenticated && <NotificationButton role={role} />}
            <SiteControls />
            <AccountNav />
          </nav>

          <div className="nav-mobile-actions" aria-label="Quick actions">
            {authenticated && <NotificationButton role={role} mobile />}
            <AccountNav />
          </div>
        </div>

        <SearchForm value={searchQuery} onChange={setSearchQuery} onSubmit={handleSearchSubmit} mobile />

        {variant === "marketing" && (
          <nav className="mobile-bottom-nav" aria-label="Mobile marketplace navigation">
            <Link href="/" data-i18n="Home">
              <span aria-hidden="true">⌂</span>
              <span>Home</span>
            </Link>
            <PostAction authenticated={authenticated} mobile />
            {authenticated && (
              <NotificationButton role={role} mobile />
            )}
            <Link href={authenticated ? dashboardPath(role) : "/sign-in"}>
              <span aria-hidden="true">◎</span>
              <span data-i18n="My Account">My Account</span>
            </Link>
          </nav>
        )}
      </header>
    </div>
  );
}
