"use client";

import { useEffect, useState, useId } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

const DEMO_ROLE_DESTINATIONS: Record<string, string> = {
  "tenant@inzuhub.demo": "/dashboard/tenant",
  "owner@inzuhub.demo": "/dashboard/owner",
  "agent@inzuhub.demo": "/dashboard/commissioner",
  "admin@inzuhub.demo": "/dashboard/admin",
};

// ── Password strength helpers ────────────────────────────────────────────────

type Rule = { label: string; test: (pw: string) => boolean };

const RULES: Rule[] = [
  { label: "At least 6 characters",      test: (pw) => pw.length >= 6 },
  { label: "Contains a letter",           test: (pw) => /[a-zA-Z]/.test(pw) },
  { label: "Contains a number",           test: (pw) => /[0-9]/.test(pw) },
  { label: "Contains a symbol (!@#…)",    test: (pw) => /[^a-zA-Z0-9]/.test(pw) },
];

function strengthScore(pw: string): number {
  return RULES.filter((r) => r.test(pw)).length; // 0–4
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "#c94f35", "#b07b20", "#2c6fa8", "#34765b"];

// ── Google SVG (reused in both tabs) ────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg className="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

// ── Password strength meter ──────────────────────────────────────────────────

function PasswordMeter({ password }: { password: string }) {
  if (!password) return null;
  const score = strengthScore(password);
  const color = STRENGTH_COLORS[score];

  return (
    <div className="pw-meter" aria-live="polite">
      <div className="pw-bars">
        {RULES.map((_, i) => (
          <div
            key={i}
            className="pw-bar"
            style={{ background: i < score ? color : undefined }}
          />
        ))}
      </div>
      <span className="pw-label" style={{ color }}>
        {STRENGTH_LABELS[score]}
      </span>
      <ul className="pw-rules">
        {RULES.map((rule) => (
          <li key={rule.label} className={rule.test(password) ? "pass" : "fail"}>
            {rule.test(password) ? "✓" : "○"} {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function SignInPage() {
  const [tab, setTab]               = useState<"signin" | "signup">("signin");
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signUpPw, setSignUpPw]     = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [returnTo, setReturnTo]      = useState<string | null>(null);

  const pwId      = useId();
  const confirmId = useId();

  const pwsMatch    = signUpPw === confirmPw && confirmPw.length > 0;

  useEffect(() => {
    const requestedUrl = new URLSearchParams(window.location.search).get("callbackUrl");
    if (requestedUrl?.startsWith("/") && !requestedUrl.startsWith("//")) {
      setReturnTo(requestedUrl);
    }
  }, []);

  const isOwnerIntent = returnTo?.includes("owner") || returnTo?.includes("add-property");

  async function handleDemoQuickSignIn(email: string) {
    setIsSigningIn(true);
    setSignInError("");
    const result = await signIn("demo-credentials", {
      email,
      password: "password123",
      redirect: false,
      callbackUrl: returnTo ?? DEMO_ROLE_DESTINATIONS[email.toLowerCase()] ?? "/dashboard/owner#add-property",
    });

    if (result?.error) setSignInError("Could not sign in as demo owner.");
    else window.location.assign(result?.url ?? "/dashboard/owner#add-property");
    setIsSigningIn(false);
  }

  async function handleCredentialSignIn() {
    setIsSigningIn(true);
    setSignInError("");
    const result = await signIn("demo-credentials", {
      email: signInEmail,
      password: signInPassword,
      redirect: false,
      callbackUrl: returnTo ?? DEMO_ROLE_DESTINATIONS[signInEmail.toLowerCase()] ?? "/",
    });

    if (result?.error) setSignInError("Invalid development demo credentials.");
    else window.location.assign(result?.url ?? "/");
    setIsSigningIn(false);
  }

  return (
    <>
      <main className="sign-in-page">
        <Link href="/">← Back to Umutungo</Link>

        {isOwnerIntent && (
          <div className="auth-owner-banner">
            <span className="auth-owner-badge">🏠 Property Owner Portal</span>
              <h2>List your property on Umutungo</h2>
            <p>Sign in to add images, location, Google Maps coordinates, price, and rooms.</p>
            <button
              type="button"
              className="demo-owner-quick-btn"
              onClick={() => handleDemoQuickSignIn("owner@inzuhub.demo")}
              disabled={isSigningIn}
            >
              {isSigningIn ? "Signing in..." : "⚡ Continue as Property Owner (Demo) →"}
            </button>
          </div>
        )}

        <section>
          {/* ── Tab switcher ────────────────────────────────── */}
          <div className="auth-tabs" role="tablist">
            <button
              role="tab"
              type="button"
              aria-selected={tab === "signin"}
              className={tab === "signin" ? "active" : ""}
              onClick={() => setTab("signin")}
            >
              Sign in
            </button>
            <button
              role="tab"
              type="button"
              aria-selected={tab === "signup"}
              className={tab === "signup" ? "active" : ""}
              onClick={() => setTab("signup")}
            >
              Create account
            </button>
          </div>

          {/* ── SIGN IN ─────────────────────────────────────── */}
          {tab === "signin" && (
            <div role="tabpanel">
              <p>WELCOME BACK</p>
              <h1>Sign in to Umutungo</h1>

              <button
                className="google-signin-btn"
                type="button"
                onClick={() => signIn("google", { callbackUrl: returnTo ?? (isOwnerIntent ? "/dashboard/owner#add-property" : "/dashboard/commissioner") })}
              >
                <GoogleIcon />
                Continue with Google
              </button>

              {process.env.NODE_ENV !== "production" ? (
                <>
                  <div className="signin-divider"><span>or sign in with email</span></div>

                  <label htmlFor="si-email">
                    Email address
                    <input id="si-email" type="email" placeholder="you@example.com" autoComplete="email" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} />
                  </label>
                  <label htmlFor="si-password">
                    Password
                    <input id="si-password" type="password" placeholder="Your password" autoComplete="current-password" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} />
                  </label>

                  <button className="button" type="button" onClick={handleCredentialSignIn} disabled={isSigningIn}>
                    {isSigningIn ? "Signing in..." : "Sign in →"}
                  </button>
                  {signInError && <p role="alert">{signInError}</p>}
                  <small>Development demo accounts only. Google OAuth is used for production authentication.</small>
                </>
              ) : (
                <small>Google OAuth is required for production authentication.</small>
              )}

              <p className="auth-switch">
                No account?{" "}
                <button type="button" className="auth-link" onClick={() => setTab("signup")}>
                  Create one for free
                </button>
              </p>
            </div>
          )}

          {/* ── SIGN UP ─────────────────────────────────────── */}
          {tab === "signup" && (
            <div role="tabpanel">
              <p>GET STARTED FREE</p>
              <h1>Create your account</h1>

              <button
                className="google-signin-btn"
                type="button"
                onClick={() => signIn("google", { callbackUrl: returnTo ?? "/" })}
              >
                <GoogleIcon />
                Sign up with Google
              </button>

              <div className="signin-divider"><span>or sign up with email</span></div>

              <label htmlFor="su-name">
                Full name
                <input id="su-name" type="text" placeholder="Your name" autoComplete="name" />
              </label>
              <label htmlFor="su-email">
                Email address
                <input id="su-email" type="email" placeholder="you@example.com" autoComplete="email" />
              </label>

              {/* Password with show/hide toggle */}
              <label htmlFor={pwId}>
                Password
                <div className="pw-field">
                  <input
                    id={pwId}
                    type={showPw ? "text" : "password"}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    value={signUpPw}
                    onChange={(e) => setSignUpPw(e.target.value)}
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    aria-label={showPw ? "Hide password" : "Show password"}
                    onClick={() => setShowPw((v) => !v)}
                  >
                    {showPw ? "🙈" : "👁"}
                  </button>
                </div>
                <PasswordMeter password={signUpPw} />
              </label>

              {/* Confirm password */}
              <label htmlFor={confirmId}>
                Confirm password
                <div className="pw-field">
                  <input
                    id={confirmId}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? "🙈" : "👁"}
                  </button>
                </div>
                {confirmPw.length > 0 && (
                  <span className={`pw-match ${pwsMatch ? "match" : "no-match"}`}>
                    {pwsMatch ? "✓ Passwords match" : "✗ Passwords don't match"}
                  </span>
                )}
              </label>

              <button
                className="button"
                type="button"
                onClick={() => signIn("google", { callbackUrl: returnTo ?? "/" })}
              >
                Create account →
              </button>

              <p className="auth-switch">
                Already have an account?{" "}
                <button type="button" className="auth-link" onClick={() => setTab("signin")}>
                  Sign in
                </button>
              </p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
