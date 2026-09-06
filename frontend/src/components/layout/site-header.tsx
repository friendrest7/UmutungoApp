import Link from "next/link";
import { SiteControls } from "@/components/site-controls";

interface SiteHeaderProps {
  /** "marketing" = full nav + sign-in + get-started (default)
   *  "minimal"   = logo + controls only (used on sign-in, property pages) */
  variant?: "marketing" | "minimal";
}

function Logo() {
  return (
    <Link href="/" className="logo">
      <i aria-hidden="true" />Inzu<span>Hub</span>
    </Link>
  );
}

export function SiteHeader({ variant = "marketing" }: SiteHeaderProps) {
  return (
    <header>
      <Logo />

      {variant === "marketing" && (
        <nav>
          <Link data-i18n="find"   href="/#homes">Find a home</Link>
          <Link data-i18n="list"   href="/#list">List a house</Link>
          <Link data-i18n="agents" href="/#agents">For agents</Link>
          <Link data-i18n="how"    href="/#how">How it works</Link>
        </nav>
      )}

      <div className="head-actions">
        <SiteControls />
        {variant === "marketing" && (
          <>
            <Link data-i18n="signIn" className="sign-in-button" href="/sign-in">
              Sign in
            </Link>
            <Link className="button small" href="/get-started">
              Get started →
            </Link>
          </>
        )}
        {variant === "minimal" && (
          <Link data-i18n="signIn" className="sign-in-button" href="/sign-in">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
