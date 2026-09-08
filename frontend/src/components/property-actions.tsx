"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function PropertyActions({ propertyId }: { propertyId: string }) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [likes, setLikes] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!session) return;
    fetch(`/api/properties/${encodeURIComponent(propertyId)}/interactions`, { cache: "no-store" })
      .then(async (response) => { if (!response.ok) return; const payload = await response.json(); setLiked(Boolean(payload.liked)); setFavorite(Boolean(payload.favorite)); setLikes(payload.likes ?? 0); })
      .catch(() => undefined);
  }, [propertyId, session]);

  async function toggle(kind: "LIKE" | "FAVORITE", active: boolean) {
    if (!session) { setNotice("Sign in to save or like this listing."); return; }
    const response = await fetch(`/api/properties/${encodeURIComponent(propertyId)}/interactions/${kind}`, { method: active ? "DELETE" : "POST" });
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.error ?? "Could not update listing."); return; }
    if (kind === "LIKE") { setLiked(!active); setLikes(payload.count ?? likes); }
    else setFavorite(!active);
  }

  return <div className="property-actions" aria-label="Listing actions">
    <button type="button" className={`button ${liked ? "is-active" : ""}`} onClick={() => toggle("LIKE", liked)}>♥ {likes}</button>
    <button type="button" className={`button ${favorite ? "is-active" : ""}`} onClick={() => toggle("FAVORITE", favorite)}>{favorite ? "Saved" : "Save listing"}</button>
    {notice && <p role="status">{notice}</p>}
  </div>;
}
