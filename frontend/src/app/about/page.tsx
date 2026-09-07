import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/layout";

const values = [
  {
    number: "01",
    title: "Clarity first",
    text: "Every listing should make the important details easy to understand, from monthly rent and location to availability and viewing expectations.",
  },
  {
    number: "02",
    title: "Local trust",
    text: "We work with owners, tenants, and local commissioners who understand their neighbourhoods and care about better outcomes.",
  },
  {
    number: "03",
    title: "Better moves",
    text: "Finding a home is a major life decision. Our tools are designed to make each step calmer, faster, and more human.",
  },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <SiteHeader />

      <section className="about-hero">
        <p className="eyebrow">ABOUT INZUHUB</p>
        <h1>A better way to find <em>your place.</em></h1>
        <p className="about-intro">
          InzuHub is a Rwanda-focused real estate platform helping people find,
          list, and manage homes with more confidence.
        </p>
        <Link className="button" href="/#homes">Explore homes <span aria-hidden="true">↗</span></Link>
      </section>

      <section className="about-story">
        <div>
          <p className="eyebrow">OUR STORY</p>
          <h2>Homes are personal. The process should be too.</h2>
        </div>
        <div>
          <p>
            InzuHub began with a simple observation: people searching for homes
            deserve more than scattered listings and uncertain conversations.
            Owners need better ways to present their properties, and local agents
            need practical tools to serve their communities.
          </p>
          <p>
            We are building one trusted place for that journey, beginning in
            Kigali and growing with the people who make Rwanda&apos;s housing market
            work every day.
          </p>
        </div>
      </section>

      <section className="about-values">
        <div className="about-section-heading">
          <p className="eyebrow">WHAT GUIDES US</p>
          <h2>Useful by design.<br /><em>Human by default.</em></h2>
        </div>
        <div className="about-value-list">
          {values.map((value) => (
            <article key={value.number}>
              <span>{value.number}</span>
              <div>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-contact">
        <div>
          <p className="eyebrow coral">LET&apos;S BUILD BETTER</p>
          <h2>Looking for your next move?</h2>
          <p>Start with a conversation, a property, or a neighbourhood you love.</p>
        </div>
        <div className="actions">
          <Link className="button light" href="/get-started">Get started →</Link>
          <a className="link" href="mailto:hello@inzuhub.rw">hello@inzuhub.rw ↗</a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
