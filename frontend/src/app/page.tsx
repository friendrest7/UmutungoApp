import { SiteControls } from "@/components/site-controls";
import { LandingInteractive } from "@/components/landing-interactive";
import { InzuAiChat } from "@/components/inzu-ai-chat";
import { HeaderHomeSearch } from "@/components/header-home-search";
import { AccountNav } from "@/components/account-nav";

function Logo() {
  return (
    <a href="#top" className="logo">
      <i aria-hidden="true" />Inzu<span>Hub</span>
    </a>
  );
}

export default function Home() {
  return (
    <main id="top">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header>
        <Logo />
        <div className="header-center">
          <nav className="site-nav" aria-label="Primary navigation">
            <a className="active" data-i18n="find"   href="#homes">Find a home</a>
            <a data-i18n="list"   href="#list">List a house</a>
            <a data-i18n="agents" href="#agents">For agents</a>
            <a data-i18n="how"    href="#how">How it works</a>
          </nav>
          <HeaderHomeSearch />
        </div>
        <div className="head-actions">
          <SiteControls />
          <AccountNav />
          <details className="mobile-menu">
            <summary aria-label="Open navigation"><span /><span /><span /></summary>
            <nav aria-label="Mobile navigation">
              <a href="#homes">Find a home</a>
              <a href="#list">List a house</a>
              <a href="#agents">For agents</a>
              <a href="#how">How it works</a>
            </nav>
          </details>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-kicker"><span /> Kigali · Rwanda <b>New homes every week</b></div>
          <h1>Find a place that feels like <em>yours.</em></h1>
          <p className="lead">
            Thoughtfully listed homes, honest details, and trusted local people.
            Your next address starts here.
          </p>
          <div className="actions">
            <a className="button" href="#homes">Explore homes <span aria-hidden="true">↗</span></a>
            <a className="link" href="#list">List your property <span aria-hidden="true">↗</span></a>
          </div>
          <div className="hero-proof">
            <div className="proof-avatars" aria-hidden="true"><i>A</i><i>J</i><i>M</i><i>+</i></div>
            <p><strong>4.9 / 5</strong><span>from renters across Kigali</span></p>
          </div>
        </div>
        <div className="hero-image">
          <video
            className="hero-video"
            autoPlay muted loop playsInline
            preload="metadata"
            aria-label="Homes and neighbourhoods available through InzuHub"
          >
            <source src="/media/landing.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      {/* ── Interactive landing sections (search, discovery, etc.) */}
      <LandingInteractive />

      {/* ── Floating AI chat widget ──────────────────────────────── */}
      <InzuAiChat />

      {/* ── Agents / partners anchor ─────────────────────────────── */}
      <section className="partner" id="agents">
        <div>
          <p className="eyebrow">For commissioners &amp; agents</p>
          <h2>We back the people<br />who make it <em>happen.</em></h2>
          <p>
            InzuHub doesn&apos;t cut out commissioners. We give you the digital tools
            to manage properties, leads, and commissions—so you can do more of
            what you do best.
          </p>
          <div className="actions">
            <a className="button light" href="/get-started">Become an agent →</a>
          </div>
        </div>
        <aside>
          <small>COMMISSIONER PROFILE</small>
          <div className="avatar">C</div>
          <h3>Claude Nkurunziza</h3>
          <p>Licensed commissioner · Kigali</p>
          <div>
            <b>12<small>Active listings</small></b>
            <b>47<small>Rentals closed</small></b>
            <b>4.9<small>Rating</small></b>
          </div>
        </aside>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="cta">
        <p className="eyebrow coral">A simpler way forward</p>
        <h2>Ready to find your next <em>home?</em></h2>
        <p>
          Whether you&apos;re moving in, listing out, or helping someone find the
          right place, we&apos;re here for it.
        </p>
        <div className="actions">
          <a className="button" href="/get-started">Get started free →</a>
          <a className="link"   href="#homes">I need help listing my house ↗</a>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="site-footer">
        <Logo />
        <p>Rwanda&apos;s home for renting better.</p>
        <div>
          <a href="/about">About us</a>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#contact">Contact</a>
        </div>
        <small>© 2026 InzuHub</small>
      </footer>
    </main>
  );
}
