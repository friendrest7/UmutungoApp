"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

function dashboardPath(role?: string) {
  const normalized = (role ?? "").toUpperCase();
  if (normalized === "ADMIN") return "/dashboard/admin";
  if (normalized === "OWNER") return "/dashboard/owner";
  if (normalized === "AGENT" || normalized === "COMMISSIONER") return "/dashboard/commissioner";
  return "/dashboard/tenant";
}

function roleLinks(role?: string) {
  const normalized = (role ?? "TENANT").toUpperCase();
  if (normalized === "ADMIN") return [{ href: "/dashboard/admin", label: "Admin portal" }];

  const links = [
    { href: `${dashboardPath(role)}#favorites`, label: "Favorites" },
    { href: "/messages", label: "Messages" },
    { href: `${dashboardPath(role)}#settings`, label: "Settings" },
  ];
  if (normalized === "OWNER" || normalized === "AGENT" || normalized === "COMMISSIONER") {
    links.unshift({ href: `${dashboardPath(role)}#listings`, label: "My Listings" });
    links.push({ href: `${dashboardPath(role)}#verification`, label: "Verification" });
  } else {
    links.push({ href: "/about#contact", label: "Verification / Upgrade" });
  }
  if (normalized === "OWNER") links.push({ href: `${dashboardPath(role)}#billing`, label: "Billing" });
  links.push({ href: "/about#contact", label: "Help & Support" });
  return links;
}

export function AccountNav() {
  const { data: session, status } = useSession();

  if (status !== "authenticated" || !session?.user) {
    return <Link data-i18n="Sign in" className="sign-in-button" href="/sign-in">Sign in</Link>;
  }

  const name = session.user.name?.trim() || session.user.email?.split("@")[0] || "Account";
  const initials = name.slice(0, 1).toUpperCase();

  return (
    <details className="account-menu">
      <summary aria-label={`Open account menu for ${name}`}>
        <span className="account-avatar" aria-hidden="true">
          {session.user.image ? <img src={session.user.image} alt="" referrerPolicy="no-referrer" /> : initials}
        </span>
        <span className="account-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div className="account-dropdown">
        <p className="account-label" data-i18n="SIGNED IN AS">SIGNED IN AS</p>
        <strong>{name}</strong>
        <strong>{session.user.email ?? name}</strong>
        <Link href={dashboardPath(session.user.role)} data-i18n="My Account">My Account</Link>
        {roleLinks(session.user.role).map((item) => (
          <Link key={`${item.href}-${item.label}`} href={item.href} data-i18n={item.label}>{item.label}</Link>
        ))}
        <button type="button" onClick={() => signOut({ callbackUrl: "/" })} data-i18n="Sign out">Sign out</button>
      </div>
    </details>
  );
}

export { dashboardPath };
