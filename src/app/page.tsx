import { SiteControls } from "@/components/site-controls";
import { LandingInteractive } from "@/components/landing-interactive";
import { InzuAiChat } from "@/components/inzu-ai-chat";

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
        <nav>
          <a data-i18n="find"   href="#homes">Find a home</a>
          <a data-i18n="list"   href="#list">List a house</a>
          <a data-i18n="agents" href="#agents">For agents</a>
          <a data-i18n="how"    href="#how">How it works</a>
        </nav>
        <div className="head-actions">
          <SiteControls />
          <a data-i18n="signIn" className="sign-in-button" href="/sign-in">Sign in</a>
          <a className="button small" href="/get-started">Get started →</a>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">● Rwanda&apos;s trusted rental marketplace</p>
          <h1>A place to call <em>home,</em><br />made simple.</h1>
          <p className="lead">
            Find a home you love, list with confidence, and work with trusted
            local agents—all in one place.
          </p>
          <div className="actions">
            <a className="button" href="#homes">Find a home →</a>
            <a className="link"   href="#list">List your property ↗</a>
          </div>
          <p className="rating">
            <b>★ ★ ★ ★ ★</b> <strong>4.9 / 5</strong> from renters across Kigali
          </p>
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
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#contact">Contact</a>
        </div>
        <small>© 2026 InzuHub</small>
      </footer>
    </main>
  );
}
