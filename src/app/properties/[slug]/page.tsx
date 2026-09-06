import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout";
import { SiteFooter } from "@/components/layout";
import { PropertyViewingForm } from "@/components/property-viewing-form";

const demoPropertyIds: Record<string, string> = {
  "kacyiru-apartment": "00000002-0000-0000-0000-000000000001",
  "kimihurura-family-home": "00000002-0000-0000-0000-000000000002",
  "kicukiro-garden-home": "00000002-0000-0000-0000-000000000003",
};

type Property = {
  id: string;
  title: string;
  property_type: string;
  district: string;
  neighborhood: string;
  rental_price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  verification_status: string;
};

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const propertyId = demoPropertyIds[slug] || slug;
  const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8080";
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

  if (!property) notFound();

  return (
    <>
      <SiteHeader variant="minimal" />
      <main className="property-page">
        <Link href="/#homes">← Back to homes</Link>
        <p>{property.verification_status === "VERIFIED" ? "✓ Verified property" : "Property verification in progress"}</p>
        <h1>{property.title}</h1>
        <p>
          {property.neighborhood}, {property.district} · {property.bedrooms} bedrooms · {property.bathrooms} bathrooms ·{" "}
          <strong>{property.rental_price.toLocaleString()} {property.currency}/mo</strong>
        </p>
        <p>
          This {property.property_type.toLowerCase()} is ready to explore. Request a viewing below to confirm
          current availability with the InzuHub partner.
        </p>

        {/* Viewing request section — replaces broken #viewing anchor */}
        <div className="viewing-section" id="viewing">
          <h2>Request a viewing</h2>
          <p>
            Fill in your details and we&apos;ll connect you with the property owner
            or commissioner within 24 hours.
          </p>
          <PropertyViewingForm propertyId={property.id} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
