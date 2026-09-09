import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout";
import { SiteFooter } from "@/components/layout";
import { PropertyViewingForm } from "@/components/property-viewing-form";
import { PropertyPaymentPanel } from "@/components/property-payment-panel";
import { PropertyMessageForm } from "@/components/property-message-form";
import { PropertyReviews } from "@/components/property-reviews";
import { PropertyContactButton } from "@/components/property-contact-button";
import { PropertyActions } from "@/components/property-actions";
import { PropertyShareButtons } from "@/components/property-share-buttons";
import { getBackendUrl } from "@/lib/backend-url";

const demoPropertyIds: Record<string, string> = {
  "kacyiru-apartment": "00000002-0000-0000-0000-000000000001",
  "kimihurura-family-home": "00000002-0000-0000-0000-000000000002",
  "kicukiro-garden-home": "00000002-0000-0000-0000-000000000003",
};

type Property = {
  id: string;
  title: string;
  property_type: string;
  description?: string;
  district: string;
  sector?: string;
  neighborhood: string;
  address_line?: string;
  rental_price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  verification_status: string;
  cover_image_url?: string;
};

export default async function PropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};
  const queryValue = (key: string) => {
    const value = query[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const propertyId = demoPropertyIds[slug] || slug;
  const backendUrl = getBackendUrl();
  let property: Property | undefined;

  try {
    const response = await fetch(`${backendUrl}/api/properties/${encodeURIComponent(propertyId)}`, {
      cache: "no-store",
    });
    if (response.ok) {
      const data = await response.json() as { property?: Property };
      property = data.property;
    }
  } catch {
    property = undefined;
  }

  if (!property && queryValue("title")) {
    property = {
      id: propertyId,
      title: queryValue("title") || "Umutungo home",
      property_type: queryValue("property_type") || "HOUSE",
      district: queryValue("district") || "Rwanda",
      neighborhood: queryValue("neighborhood") || "",
      rental_price: Number(queryValue("rental_price")) || 0,
      currency: queryValue("currency") || "RWF",
      bedrooms: Number(queryValue("bedrooms")) || 0,
      bathrooms: Number(queryValue("bathrooms")) || 0,
      verification_status: "VERIFIED",
      cover_image_url: queryValue("cover_image_url"),
      description: "Connect with the landlord to confirm availability, viewing times, and the next steps.",
    };
  }

  if (!property) notFound();

  const locationQuery = [property.address_line, property.neighborhood, property.sector, property.district, "Rwanda"]
    .filter(Boolean)
    .join(", ");
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`;

  return (
    <>
      <SiteHeader variant="minimal" />
      <main className="property-page">
        <Link href="/homes">← Back to homes</Link>
        <figure className="property-hero-media">
          <img
            src={property.cover_image_url || "/images/properties/hero-home.jpg"}
            alt={`${property.title} in ${property.district}`}
          />
          <figcaption>{property.property_type} · {property.verification_status === "VERIFIED" ? "Verified home" : "Available home"}</figcaption>
        </figure>
        <p className="property-verification">{property.verification_status === "VERIFIED" ? "✓ Verified property" : "Property verification in progress"}</p>
        <h1>{property.title}</h1>
        <p>
          {[property.address_line, property.neighborhood, property.sector, property.district].filter(Boolean).join(", ")} · {property.bedrooms} bedrooms · {property.bathrooms} bathrooms ·{" "}
          <strong>{property.rental_price.toLocaleString()} {property.currency}/mo</strong>
        </p>
        <div className="property-location-card">
          <span className="property-location-pin" aria-hidden="true">⌖</span>
          <div>
            <strong>Property location</strong>
            <small>{locationQuery}</small>
          </div>
          <a href={mapUrl} target="_blank" rel="noreferrer">Open Google Maps ↗</a>
        </div>
        <p>{property.description || `This ${property.property_type.toLowerCase()} is ready to explore.`}</p>
        <PropertyActions propertyId={property.id} />
        <PropertyShareButtons title={property.title} />
        <p className="property-next-step">Contact the landlord first to confirm availability, arrange a viewing, and discuss the next steps. You can return to this page and pay when you are ready.</p>

        {/* Viewing request section — replaces broken #viewing anchor */}
        <div className="viewing-section" id="viewing">
          <h2>Request a viewing</h2>
          <p>
            Fill in your details and we&apos;ll connect you with the property owner
            or commissioner within 24 hours.
          </p>
          <PropertyViewingForm propertyId={property.id} />
        </div>
        <div className="viewing-section" id="message-creator">
          <p className="eyebrow">DIRECT CONTACT</p>
          <h2>Contact the landlord</h2>
          <p>
            Ask about current availability, exact directions, utilities, viewing times, and any questions before you commit.
          </p>
          <PropertyMessageForm propertyId={property.id} />
        </div>
        <div className="viewing-section" id="contact-creator">
          <h2>Call the landlord</h2>
          <p>Prefer a quick conversation? Reveal the verified contact number and call directly.</p>
          <PropertyContactButton propertyId={property.id} />
        </div>
        <PropertyPaymentPanel
          propertyId={property.id}
          propertyTitle={property.title}
        />
        <PropertyReviews propertyId={property.id} />
      </main>
      <SiteFooter />
    </>
  );
}
