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
    text: "We work with owners, clients, and Komisiyoneri who understand their neighbourhoods and care about better outcomes.",
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
        <p className="eyebrow">ABOUT UMUTUNGO</p>
        <h1>A better way to find <em>your place.</em></h1>
        <p className="about-intro">
          Umutungo is a Rwanda-focused property platform helping people find,
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
            Umutungo began with a simple observation: people searching for homes
            deserve more than scattered listings and uncertain conversations.
            Owners need better ways to present their properties, and Komisiyoneri
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
          <a className="link" href="mailto:hello@umutungo.rw">hello@umutungo.rw ↗</a>
        </div>
      </section>

      <section className="about-legal" aria-label="Umutungo policies and contact">
        <article id="privacy">
          <p className="eyebrow">PRIVACY</p>
          <h2>Your information, handled with care.</h2>
          <p>
            Umutungo collects the information needed to create accounts, verify
            sellers, publish listings, respond to enquiries, arrange viewings,
            and support hospitality bookings. This may include your name, phone
            number, email, profile photo, location details, messages, and account
            activity.
          </p>
          <p>
            We use this information to operate the marketplace, prevent fraud,
            provide verification and moderation, improve search, and send service
            messages. Payment providers process payment details directly where
            available; Umutungo does not ask users to place payment secrets in
            the browser or in chat.
          </p>
          <p>
            You may request access, correction, or deletion of your personal
            information by contacting us. We aim to handle personal data in line
            with Rwanda&apos;s Law No. 058/2021 relating to the protection of personal
            data and privacy. Final legal wording and retention periods should be
            reviewed before public launch.
          </p>
        </article>

        <article id="terms">
          <p className="eyebrow">TERMS</p>
          <h2>A trusted marketplace needs shared rules.</h2>
          <p>
            Users must provide accurate information, keep account credentials
            secure, and have the right to list or represent any property they
            publish. Listings should accurately describe price, location,
            availability, ownership, and contact preferences.
          </p>
          <p>
            Umutungo provides marketplace tools and trust signals; it does not
            transfer ownership, guarantee a transaction, or replace independent
            legal, financial, or property advice. Verification badges describe
            the verification completed by Umutungo and are not a guarantee of a
            property, seller, or transaction.
          </p>
          <p>
            We may pause, flag, remove, or request evidence for listings that are
            fraudulent, duplicated, unavailable, offensive, misleading, or in
            breach of applicable law. Booking, subscription, and payment terms
            will be shown before a user confirms a supported transaction.
          </p>
        </article>

        <article id="contact">
          <p className="eyebrow">CONTACT</p>
          <h2>Talk to the Umutungo team.</h2>
          <p>
            For support, verification questions, listing reports, partnership
            requests, or account privacy requests, contact us through the details
            below. Please do not send passwords, OTP codes, or payment secrets by
            email or WhatsApp.
          </p>
          <div className="about-contact-details">
            <a href="mailto:umutungoapp@estate.com">umutungoapp@estate.com</a>
            <a href="tel:+250783618941">+250 783 618 941</a>
            <span>Kigali, Rwanda</span>
          </div>
        </article>
      </section>

      <SiteFooter />
    </main>
  );
}
