"use client";

import { FormEvent, useEffect, useState } from "react";

type Account = {
  profile?: {
    display_name: string;
    email: string;
    phone?: string;
    bio?: string;
    verification_status: string;
  };
  kyc_status?: string | null;
};

export function AccountOverview() {
  const [account, setAccount] = useState<Account | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [upgradeRole, setUpgradeRole] = useState<"OWNER" | "AGENT" | "">("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/account", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json() as Account & { error?: string };
        if (!response.ok) throw new Error(data.error || "Could not load your account.");
        setAccount(data);
        setDisplayName(data.profile?.display_name ?? "");
        setBio(data.profile?.bio ?? "");
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName, bio }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not save your profile.");
      setMessage("Profile saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  async function requestUpgrade(role: "OWNER" | "AGENT") {
    setUpgradeRole(role);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/account/role-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requested_role: role }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not submit upgrade request.");
      setMessage("Upgrade request submitted for review.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not submit upgrade request.");
    } finally {
      setUpgradeRole("");
    }
  }

  if (error && !account) return <p className="account-notice account-notice--error" role="alert">{error}</p>;
  if (!account) return <p className="account-notice">Loading account...</p>;

  return (
    <section className="account-overview" aria-labelledby="account-heading">
      <div className="account-overview-head">
        <div>
          <p className="eyebrow">MY ACCOUNT</p>
          <h2 id="account-heading">Profile and verification</h2>
        </div>
        <span className={`account-status account-status--${account.profile?.verification_status.toLowerCase()}`}>
          {account.profile?.verification_status ?? "UNVERIFIED"}
        </span>
      </div>

      <form className="account-profile-form" onSubmit={saveProfile}>
        <label>
          Name
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required maxLength={160} />
        </label>
        <label>
          Email
          <input value={account.profile?.email ?? ""} readOnly />
        </label>
        <label>
          Bio
          <textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={2000} rows={4} placeholder="Tell people a little about you" />
        </label>
        <button className="button small" type="submit" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
      </form>

      <div className="account-upgrade" id="upgrade">
        <h3>Want to publish a property?</h3>
        <p>Request a role upgrade. KYC information is reviewed before your first listing can be published.</p>
        <div className="actions">
          <button className="button small" type="button" disabled={Boolean(upgradeRole)} onClick={() => requestUpgrade("OWNER")}>
            {upgradeRole === "OWNER" ? "Requesting..." : "Become a property owner"}
          </button>
          <button className="button small" type="button" disabled={Boolean(upgradeRole)} onClick={() => requestUpgrade("AGENT")}>
            {upgradeRole === "AGENT" ? "Requesting..." : "Become a Komisiyoneri"}
          </button>
        </div>
      </div>

      {account.kyc_status && <p className="account-notice">Latest KYC submission: {account.kyc_status}</p>}
      {message && <p className="account-notice" role="status">{message}</p>}
      {error && <p className="account-notice account-notice--error" role="alert">{error}</p>}
    </section>
  );
}
