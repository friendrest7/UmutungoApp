import Link from "next/link";

function Logo() {
  return (
    <Link href="/" className="logo">
      <i aria-hidden="true" />Umutungo
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Logo />
      <p>Rwanda&apos;s trusted property marketplace.</p>
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
