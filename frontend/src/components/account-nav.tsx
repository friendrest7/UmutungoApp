"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

function dashboardPath(role?: string) {
  if (role === "ADMIN") return "/dashboard/admin";
  if (role === "OWNER") return "/dashboard/owner";
  if (role === "AGENT" || role === "commissioner") return "/dashboard/commissioner";
  return "/dashboard/tenant";
}

export function AccountNav() {
  const { data: session, status } = useSession();

  if (status !== "authenticated" || !session?.user) {
    return <Link data-i18n="signIn" className="sign-in-button" href="/sign-in">Sign in</Link>;
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
        <p className="account-label">SIGNED IN AS</p>
        <strong>{name}</strong>
        <strong>{session.user.email ?? name}</strong>
        <Link href={dashboardPath(session.user.role)}>Open dashboard <span aria-hidden="true">↗</span></Link>
        <button type="button" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</button>
      </div>
    </details>
  );
}
