"use client";

import { FormEvent, useEffect, useState } from "react";

type Conversation = { id: string; property_title: string; other_user_name: string; last_message: string; unread_count: number };
type Message = { id: string; sender_id: string; sender_name: string; body: string; created_at: string };

export function MessageCenter() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/conversations", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Messages unavailable");
        setConversations(payload.conversations ?? []);
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetch(`/api/conversations/${encodeURIComponent(selected)}/messages`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Conversation unavailable");
        setMessages(payload.messages ?? []);
      })
      .catch((reason: Error) => setError(reason.message));
  }, [selected]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !body.trim()) return;
    const response = await fetch(`/api/conversations/${encodeURIComponent(selected)}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: body.trim() }),
    });
    if (!response.ok) { setError("Message could not be sent."); return; }
    setBody("");
    const refreshed = await fetch(`/api/conversations/${encodeURIComponent(selected)}/messages`, { cache: "no-store" });
    const payload = await refreshed.json();
    setMessages(payload.messages ?? []);
  }

  return (
    <section className="message-center" aria-label="Messages">
      <div className="message-center-list">
        <h2>Messages</h2>
        {error && <p role="alert">{error}</p>}
        {!error && conversations.length === 0 && <p>No conversations yet.</p>}
        {conversations.map((conversation) => (
          <button type="button" className={`message-conversation${selected === conversation.id ? " is-selected" : ""}`} key={conversation.id} onClick={() => setSelected(conversation.id)}>
            <strong>{conversation.other_user_name}</strong>
            <small>{conversation.property_title || "Property conversation"}</small>
            <span>{conversation.last_message || "No messages yet"}</span>
            {conversation.unread_count > 0 && <b>{conversation.unread_count}</b>}
          </button>
        ))}
      </div>
      <div className="message-center-thread">
        {!selected && <p>Select a conversation to read messages.</p>}
        {selected && <>
          <div className="message-thread-list">
            {messages.map((message) => <p key={message.id}><strong>{message.sender_name}</strong><span>{message.body}</span></p>)}
          </div>
          <form onSubmit={send} className="message-compose">
            <label className="sr-only" htmlFor="message-body">Write a message</label>
            <textarea id="message-body" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a message..." maxLength={4000} required />
            <button className="button" type="submit">Send</button>
          </form>
        </>}
      </div>
    </section>
  );
}
