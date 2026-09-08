"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Review = { id: string; rating: number; body: string; author: string; created_at: string };

export function PropertyReviews({ propertyId }: { propertyId: string }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const response = await fetch(`/api/properties/${encodeURIComponent(propertyId)}/reviews`, { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    setReviews(payload.reviews ?? []);
    setAverage(payload.average ?? 0);
  }, [propertyId]);

  useEffect(() => { void load(); }, [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch(`/api/properties/${encodeURIComponent(propertyId)}/reviews`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating, body }),
    });
    const payload = await response.json();
    setNotice(response.ok ? "Review published." : (payload.error ?? "Review could not be published."));
    if (response.ok) { setBody(""); await load(); }
  }

  return (
    <section className="viewing-section property-reviews" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading">Reviews {reviews.length > 0 && `· ${average.toFixed(1)}/5`}</h2>
      {reviews.length === 0 && <p>No published reviews yet.</p>}
      {reviews.map((review) => <article key={review.id}><strong>{"★".repeat(review.rating)}</strong><p>{review.body}</p><small>{review.author}</small></article>)}
      {session && <form className="viewing-form" onSubmit={submit}>
        <label>Rating<select value={rating} onChange={(event) => setRating(Number(event.target.value))}>{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select></label>
        <label>Your review<textarea required minLength={10} maxLength={2000} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Share your experience after a completed viewing or booking..." /></label>
        <button className="button" type="submit">Publish review</button>
        {notice && <p role="status">{notice}</p>}
      </form>}
    </section>
  );
}
