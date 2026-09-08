import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <BrandLogo />
      <p>Rwanda&apos;s trusted property marketplace.</p>
      <div className="site-footer-contact">
        <a href="mailto:umutungoapp@estate.com">umutungoapp@estate.com</a>
        <a href="tel:+250783618941">+250 783 618 941</a>
      </div>
      <div>
        <Link href="/about">About us</Link>
        <Link href="/about#privacy">Privacy</Link>
        <Link href="/about#terms">Terms</Link>
        <Link href="/about#contact">Contact</Link>
      </div>
      <small>© 2026 Umutungo</small>
    </footer>
  );
}
