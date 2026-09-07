"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

const DEMO_ROLE_DESTINATIONS: Record<string, string> = {
  "tenant@inzuhub.demo": "/dashboard/tenant",
  "owner@inzuhub.demo": "/dashboard/owner",
  "agent@inzuhub.demo": "/dashboard/commissioner",
  "admin@inzuhub.demo": "/dashboard/admin",
};

function GoogleIcon() {
  return (
    <svg className="google-icon" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [returnTo, setReturnTo] = useState<string | null>(null);

  useEffect(() => {
    const requestedUrl = new URLSearchParams(window.location.search).get("callbackUrl");
    const authError = new URLSearchParams(window.location.search).get("error");
    if (requestedUrl?.startsWith("/") && !requestedUrl.startsWith("//")) {
      setReturnTo(requestedUrl);
    }
    if (authError) {
      setError("Google sign-in could not complete. Please check the OAuth configuration and try again.");
    }
  }, []);

  async function handleGoogleSignIn() {
    setError("");
    const result = await signIn("google", {
      redirect: false,
      redirectTo: returnTo ?? "/dashboard/tenant",
    });
    if (result?.error) {
      setError("Google sign-in could not complete. Please try again.");
      return;
    }
    if (result?.url) window.location.assign(result.url);
  }

  async function handleSignIn() {
    setIsSigningIn(true);
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const result = await signIn("demo-credentials", {
      email: normalizedEmail,
      password,
      redirect: false,
      callbackUrl: returnTo ?? DEMO_ROLE_DESTINATIONS[normalizedEmail] ?? "/",
    });

    if (result?.error) {
      setError("Invalid email or password. Use a development demo account.");
    } else {
      window.location.assign(result?.url ?? "/");
    }

    setIsSigningIn(false);
  }

  return (
    <main className="sign-in-page">
      <Link href="/">← Back to Umutungo</Link>

      <section>
        <p>WELCOME BACK</p>
        <h1>Sign in to Umutungo</h1>

        <button
          className="google-signin-btn"
          type="button"
          onClick={handleGoogleSignIn}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="signin-divider"><span>or sign in with email</span></div>

        <label htmlFor="sign-in-email">
          Email address
          <input
            id="sign-in-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label htmlFor="sign-in-password">
          Password
          <input
            id="sign-in-password"
            type="password"
            placeholder="Your password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <button className="button" type="button" onClick={handleSignIn} disabled={isSigningIn}>
          {isSigningIn ? "Signing in..." : "Sign in →"}
        </button>

        {error && <p role="alert">{error}</p>}
        <small>Development demo accounts are enabled for this environment.</small>
      </section>
    </main>
  );
}
