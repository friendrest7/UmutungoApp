"use client";

import { FormEvent, useState } from "react";

export function HeaderHomeSearch() {
  const [query, setQuery] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    window.location.assign(value ? `/?q=${encodeURIComponent(value)}#homes` : "/#homes");
  }

  return (
    <form className="header-home-search" onSubmit={submit} role="search">
      <span aria-hidden="true">⌕</span>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search homes"
        aria-label="Search homes"
      />
      <button type="submit" aria-label="Search homes">↵</button>
    </form>
  );
}
