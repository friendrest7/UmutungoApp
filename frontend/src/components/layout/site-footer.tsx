import Link from "next/link";

function Logo() {
  return (
    <Link href="/" className="logo">
      <i aria-hidden="true" />Inzu<span>Hub</span>
    </Link>
  );
}

export function SiteFooter() {
  return (
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
  );
}
