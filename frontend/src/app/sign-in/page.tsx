"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

function GoogleIcon() {
  return <svg className="google-icon" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>;
}

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "register">("sign-in");
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("TENANT");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [returnTo, setReturnTo] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedUrl = params.get("callbackUrl");
    if (requestedUrl?.startsWith("/") && !requestedUrl.startsWith("//")) setReturnTo(requestedUrl);
    if (params.get("error")) setError("Sign-in could not complete. Please check your details and try again.");
  }, []);

  const destination = () => returnTo ?? "/";

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (mode === "register" && password !== confirmPassword) { setError("Passwords do not match."); return; }
    setIsSigningIn(true);
    try {
      if (mode === "register") {
        const response = await fetch("/api/auth/password/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password, role }) });
        const payload = await response.json() as { error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Could not create account.");
      }
      const result = await signIn("email-password", { email, password, redirect: false });
      if (result?.error) throw new Error("Invalid email or password.");
      router.push(destination()); router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not sign in."); }
    finally { setIsSigningIn(false); }
  }

  async function requestOtp() {
    setIsSigningIn(true); setError("");
    try {
      const response = await fetch("/api/auth/otp/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, purpose: mode === "register" ? "REGISTER" : "LOGIN", name, email, role }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not send OTP.");
      setOtpSent(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not send OTP."); }
    finally { setIsSigningIn(false); }
  }

  async function handlePhoneSignIn() {
    setIsSigningIn(true); setError("");
    const result = await signIn("phone-otp", { phone, code, purpose: mode === "register" ? "REGISTER" : "LOGIN", redirect: false });
    if (result?.error) { setError("Enter the valid code sent to your number."); setIsSigningIn(false); return; }
    router.push(destination()); router.refresh();
  }

  function switchMode() {
    setMode(mode === "register" ? "sign-in" : "register"); setOtpSent(false); setCode(""); setPassword(""); setConfirmPassword(""); setError("");
  }

  return (
    <main className="sign-in-page">
      <Link href="/">← Back to Umutungo</Link>
      <section>
        <p>{mode === "register" ? "WELCOME TO UMUTUNGO" : "WELCOME BACK"}</p>
        <h1>{mode === "register" ? "Create your Umutungo account" : "Sign in to Umutungo"}</h1>
        <button className="google-signin-btn" type="button" onClick={() => signIn("google", { callbackUrl: destination() })}><GoogleIcon /> Continue with Google</button>
        <div className="signin-divider"><span>or continue with</span></div>
        <div className="auth-tabs" role="tablist" aria-label="Sign-in method">
          <button type="button" className={method === "email" ? "active" : ""} onClick={() => { setMethod("email"); setError(""); }} role="tab" aria-selected={method === "email"}>Email &amp; password</button>
          <button type="button" className={method === "phone" ? "active" : ""} onClick={() => { setMethod("phone"); setError(""); }} role="tab" aria-selected={method === "phone"}>Phone</button>
        </div>
        {method === "email" ? (
          <form onSubmit={handleEmailSubmit} role="tabpanel">
            {mode === "register" && <><label htmlFor="register-name">Full name<input id="register-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /></label><label htmlFor="register-role">I want to use Umutungo as<select id="register-role" value={role} onChange={(event) => setRole(event.target.value)}><option value="TENANT">Client</option><option value="AGENT">Komisiyoneri / Agent</option><option value="OWNER">Property Owner</option></select></label></>}
            <label htmlFor="email">Email address<input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
            <label htmlFor="password">Password<input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "register" ? "new-password" : "current-password"} minLength={8} required /></label>
            {mode === "register" && <label htmlFor="confirm-password">Confirm password<input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={8} required /></label>}
            <button className="button" type="submit" disabled={isSigningIn}>{isSigningIn ? "Please wait..." : mode === "register" ? "Create account →" : "Sign in →"}</button>
          </form>
        ) : (
          <div role="tabpanel">
            {mode === "register" && <><label htmlFor="phone-register-name">Full name<input id="phone-register-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /></label><label htmlFor="phone-register-email">Email address<input id="phone-register-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><label htmlFor="register-role-phone">I want to use Umutungo as<select id="register-role-phone" value={role} onChange={(event) => setRole(event.target.value)}><option value="TENANT">Client</option><option value="AGENT">Komisiyoneri / Agent</option><option value="OWNER">Property Owner</option></select></label></>}
            <label htmlFor="sign-in-phone">Rwanda phone number<input id="sign-in-phone" type="tel" placeholder="+250 78 000 0000" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required /></label>
            {!otpSent ? <button className="button" type="button" onClick={requestOtp} disabled={isSigningIn || !phone.trim()}>{isSigningIn ? "Requesting code..." : "Continue with phone →"}</button> : <><label htmlFor="sign-in-code">Enter one-time code<input id="sign-in-code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} /></label><button className="button" type="button" onClick={handlePhoneSignIn} disabled={isSigningIn || code.trim().length !== 6}>{isSigningIn ? "Signing in..." : "Verify and sign in →"}</button></>}
          </div>
        )}
        <button type="button" className="link auth-switch" onClick={switchMode}>{mode === "register" ? "Already have an account? Sign in" : "New to Umutungo? Create an account"}</button>
        {error && <p role="alert" className="auth-error">{error}</p>}
      </section>
    </main>
  );
}

