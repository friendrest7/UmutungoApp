import { SiteHeader } from "@/components/layout";
import { BrandLogo } from "@/components/brand-logo";
import { LandingInteractive } from "@/components/landing-interactive";
import { UmutungoAiChat } from "@/components/inzu-ai-chat";
import { HeroImageSlider } from "@/components/hero-image-slider";

export default function Home() {
  return (
    <main id="top">
      {/* ── Header ──────────────────────────────────────────────── */}
      <SiteHeader />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-kicker"><b data-i18n="hero.kicker" data-i18n-default="New homes every week">New homes every week</b> <span className="hero-kicker-dot" aria-hidden="true" /> <span data-i18n="hero.location" data-i18n-default="Kigali · Rwanda">Kigali · Rwanda</span></div>
          <h1><span data-i18n="hero.title" data-i18n-default="Find a place that feels like ">Find a place that feels like </span><em data-i18n="hero.titleEm" data-i18n-default="yours.">yours.</em></h1>
          <p className="lead" data-i18n="hero.lead" data-i18n-default="Thoughtfully listed homes, honest details, and trusted local people. Your next address starts here.">
            Thoughtfully listed homes, honest details, and trusted local people. Your next address starts here.
          </p>
          <div className="actions">
            <a className="button" href="#homes">Explore homes <span aria-hidden="true">↗</span></a>
            <a className="button" href="/add-property">Add Property <span aria-hidden="true">＋</span></a>
            <a className="link" href="/dashboard/owner">View My Properties <span aria-hidden="true">→</span></a>
          </div>
          <div className="hero-proof">
            <div className="proof-avatars" aria-hidden="true"><i>A</i><i>J</i><i>M</i><i>+</i></div>
            <p><strong>4.9 / 5</strong><span>from renters across Kigali</span></p>
          </div>
        </div>
        <HeroImageSlider />
        <div className="hero-video-frame">
          <video
            className="hero-video"
            autoPlay muted loop playsInline
            preload="metadata"
            aria-label="Homes and neighbourhoods available through Umutungo"
          >
            <source src="/media/landing.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      {/* ── Interactive landing sections (search, discovery, etc.) */}
      <LandingInteractive />

      {/* ── Floating AI chat widget ──────────────────────────────── */}
      <UmutungoAiChat />

      {/* ── Agents / partners anchor ─────────────────────────────── */}
      <section className="partner" id="agents">
        <div>
          <p className="eyebrow">For Komisiyoneri &amp; property businesses</p>
          <h2>We back the people<br />who make it <em>happen.</em></h2>
          <p>
            Umutungo gives commissioners the digital tools
            to manage properties, leads, and commissions—so you can do more of
            what you do best.
          </p>
          <div className="actions">
            <a className="button light" href="/get-started">Become an agent →</a>
          </div>
        </div>
        <aside>
          <small>KOMISIYONERI PROFILE</small>
          <div className="avatar">C</div>
          <h3>Claude Nkurunziza</h3>
          <p>Verified Komisiyoneri · Kigali</p>
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
          <a className="button" href="/add-property">Add Property ＋</a>
          <a className="link" href="/dashboard/owner">View My Properties →</a>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="site-footer">
        <BrandLogo />
        <p>Rwanda&apos;s home for renting better.</p>
        <div className="site-footer-contact">
          <a href="mailto:umutungoapp@estate.com">umutungoapp@estate.com</a>
          <a href="tel:+250783618941">+250 783 618 941</a>
        </div>
        <div>
          <a href="/about">About us</a>
          <a href="/about#privacy">Privacy</a>
          <a href="/about#terms">Terms</a>
          <a href="/about#contact">Contact</a>
        </div>
        <small>© 2026 Umutungo</small>
      </footer>
    </main>
  );
}
