"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// ── Static mock data (Phase 2: replace with real API calls) ──────────────────

const STATS = [
  { label: "Active Listings",  value: "12",  delta: "+2 this month",  icon: "🏠" },
  { label: "Rentals Closed",   value: "47",  delta: "+5 this month",  icon: "🤝" },
  { label: "Pending Leads",    value: "8",   delta: "3 new today",    icon: "📩" },
  { label: "Avg. Rating",      value: "4.9", delta: "from 31 reviews",icon: "★" },
];

const LISTINGS = [
  { id: 1, title: "2BR Apartment – Kacyiru",        district: "Gasabo",     rent: "450,000 RWF", status: "active",  leads: 3, image: "🏢" },
  { id: 2, title: "3BR House – Remera",             district: "Gasabo",     rent: "620,000 RWF", status: "active",  leads: 5, image: "🏡" },
  { id: 3, title: "Studio – Nyamirambo",            district: "Nyarugenge", rent: "180,000 RWF", status: "rented",  leads: 0, image: "🛏" },
  { id: 4, title: "Villa – Kiyovu",                 district: "Nyarugenge", rent: "1,200,000 RWF",status:"active",  leads: 2, image: "🏰" },
  { id: 5, title: "1BR Apartment – Gikondo",        district: "Kicukiro",   rent: "280,000 RWF", status: "active",  leads: 1, image: "🏠" },
  { id: 6, title: "4BR House – Kibagabaga",         district: "Gasabo",     rent: "850,000 RWF", status: "pending", leads: 0, image: "🏘" },
];

const LEADS = [
  { id: 1, name: "Jean-Pierre M.",  property: "2BR Apartment – Kacyiru",  time: "2 hours ago",  status: "new" },
  { id: 2, name: "Alice Uwase",     property: "3BR House – Remera",       time: "5 hours ago",  status: "new" },
  { id: 3, name: "David K.",        property: "Villa – Kiyovu",           time: "Yesterday",    status: "contacted" },
  { id: 4, name: "Marie Ingabire",  property: "1BR Apartment – Gikondo",  time: "Yesterday",    status: "contacted" },
  { id: 5, name: "Claude Nzeyimana",property: "3BR House – Remera",       time: "2 days ago",   status: "closed" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return <span className={`cd-badge cd-badge--${status}`}>{status}</span>;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CommissionerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Guard: only agents or the legacy commissioner account may enter.
  useEffect(() => {
    if (status === "loading") return;
    if (!session || !["AGENT", "commissioner"].includes(session.user.role ?? "")) {
      router.replace("/sign-in");
    }
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="cd-loading">
        <span className="cd-spinner" aria-label="Loading…" />
      </div>
    );
  }

  if (!["AGENT", "commissioner"].includes(session.user.role ?? "")) return null;

  const firstName = session.user.name?.split(" ")[0] ?? "Commissioner";

  return (
    <div className="cd-root">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="cd-sidebar">
        <div className="cd-brand">
          <i aria-hidden="true" />Inzu<span>Hub</span>
        </div>

        <nav className="cd-nav" aria-label="Dashboard navigation">
          <a href="#overview"  className="cd-nav-item active">
            <span aria-hidden="true">📊</span> Overview
          </a>
          <a href="#listings"  className="cd-nav-item">
            <span aria-hidden="true">🏠</span> My Listings
          </a>
          <a href="#leads"     className="cd-nav-item">
            <span aria-hidden="true">📩</span> Leads
            <span className="cd-badge cd-badge--new cd-nav-dot">8</span>
          </a>
          <a href="#earnings"  className="cd-nav-item">
            <span aria-hidden="true">💰</span> Earnings
          </a>
          <a href="#settings"  className="cd-nav-item">
            <span aria-hidden="true">⚙️</span> Settings
          </a>
        </nav>

        <button
          className="cd-signout"
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <span aria-hidden="true">↩</span> Sign out
        </button>
      </aside>

      {/* ── Main content ────────────────────────────────────── */}
      <main className="cd-main">

        {/* Top bar */}
        <header className="cd-topbar">
          <div>
            <p className="cd-eyebrow">COMMISSIONER DASHBOARD</p>
            <h1 className="cd-heading">Good day, {firstName} 👋</h1>
          </div>
          <div className="cd-topbar-actions">
            <button className="cd-btn cd-btn--primary" type="button">
              + Add listing
            </button>
            <div className="cd-avatar" aria-label={session.user.name ?? "Profile"}>
              {session.user.image
                ? <img src={session.user.image} alt={session.user.name ?? ""} referrerPolicy="no-referrer" />
                : (session.user.name?.[0] ?? "C")}
            </div>
          </div>
        </header>

        {/* ── Stats row ───────────────────────────────────────── */}
        <section id="overview" className="cd-stats" aria-label="Overview statistics">
          {STATS.map((s) => (
            <div className="cd-stat-card" key={s.label}>
              <span className="cd-stat-icon" aria-hidden="true">{s.icon}</span>
              <div>
                <p className="cd-stat-value">{s.value}</p>
                <p className="cd-stat-label">{s.label}</p>
                <p className="cd-stat-delta">{s.delta}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── Listings table ──────────────────────────────────── */}
        <section id="listings" className="cd-section">
          <div className="cd-section-head">
            <h2>My Listings</h2>
            <button className="cd-btn cd-btn--ghost" type="button">View all →</button>
          </div>
          <div className="cd-table-wrap">
            <table className="cd-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>District</th>
                  <th>Monthly Rent</th>
                  <th>Status</th>
                  <th>Leads</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {LISTINGS.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <span className="cd-prop-icon" aria-hidden="true">{l.image}</span>
                      {l.title}
                    </td>
                    <td>{l.district}</td>
                    <td className="cd-rent">{l.rent}</td>
                    <td><StatusBadge status={l.status} /></td>
                    <td>{l.leads > 0 ? <b>{l.leads}</b> : <span className="cd-muted">—</span>}</td>
                    <td>
                      <button className="cd-btn cd-btn--xs cd-btn--ghost" type="button">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Leads panel ─────────────────────────────────────── */}
        <section id="leads" className="cd-section">
          <div className="cd-section-head">
            <h2>Recent Leads</h2>
            <button className="cd-btn cd-btn--ghost" type="button">View all →</button>
          </div>
          <div className="cd-leads">
            {LEADS.map((lead) => (
              <div className="cd-lead-card" key={lead.id}>
                <div className="cd-lead-avatar" aria-hidden="true">
                  {lead.name[0]}
                </div>
                <div className="cd-lead-info">
                  <p className="cd-lead-name">{lead.name}</p>
                  <p className="cd-lead-prop">{lead.property}</p>
                  <p className="cd-lead-time">{lead.time}</p>
                </div>
                <div className="cd-lead-actions">
                  <StatusBadge status={lead.status} />
                  {lead.status !== "closed" && (
                    <button className="cd-btn cd-btn--xs cd-btn--primary" type="button">
                      Contact
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
