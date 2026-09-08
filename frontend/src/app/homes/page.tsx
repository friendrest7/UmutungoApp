import { SiteHeader } from "@/components/layout";
import { LandingInteractive } from "@/components/landing-interactive";

export default function HomesPage() {
  return (
    <main className="homes-page">
      <SiteHeader />
      <section className="homes-page-heading" aria-labelledby="homes-page-title">
        <div>
          <p className="eyebrow">Umutungo marketplace</p>
          <h1 id="homes-page-title">Find your next home.</h1>
          <p>Search verified homes, apartments, land, and spaces across Rwanda.</p>
        </div>
        <span className="homes-page-count">Live listings - Rwanda</span>
      </section>
      <LandingInteractive showSearch homesOnly />
    </main>
  );
}
