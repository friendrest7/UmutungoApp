"use client";

import { FormEvent, useState } from "react";
import type { AiMessage } from "@/services/ai/inzu-ai";

const prompts = ["Find a two-bedroom home", "Search by budget", "Ask about reviews"];

export function UmutungoAiChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const send = async (event: FormEvent) => { event.preventDefault(); const text = input.trim(); if (!text || loading) return; const next = [...messages, { role: "user" as const, text }]; setMessages(next); setInput(""); setLoading(true); try { const response = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) }); const data = await response.json() as { text?: string; error?: string }; setMessages((current) => [...current, { role: "model", text: data.text || data.error || "Please try again." }]); } catch { setMessages((current) => [...current, { role: "model", text: "We could not reach Umutungo AI. Please try again." }]); } finally { setLoading(false); } };
  return <div className={`ai-widget ${open ? "is-open" : ""}`}><div className="ai-chat-panel" role="dialog" aria-label="Umutungo AI assistant" aria-hidden={!open}><div className="ai-chat-head"><span className="ai-spark">✦</span><div><strong>Umutungo AI</strong><small>Property concierge</small></div><button type="button" aria-label="Close AI assistant" onClick={() => setOpen(false)}>×</button></div><div className="ai-chat-body">{messages.length === 0 && <div className="ai-welcome"><b>What kind of property are you looking for?</b><p>Ask naturally in English or Kinyarwanda.</p><div>{prompts.map((prompt) => <button type="button" key={prompt} onClick={() => setInput(prompt)}>{prompt}</button>)}</div></div>}{messages.map((message, index) => <p className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>{message.text}</p>)}{loading && <p className="chat-message model"><i className="spinner"/> Checking Umutungo context…</p>}</div><form className="ai-chat-form" onSubmit={send}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Describe your ideal property…" aria-label="Message Umutungo AI"/><button type="submit" aria-label="Send message" disabled={!input.trim() || loading}>↑</button></form><small className="ai-disclaimer">AI uses available Umutungo data and may not know live availability.</small></div><button className="ai-launcher" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close Umutungo AI" : "Open Umutungo AI"}><span>✦</span><b>{open ? "Close" : "Ask AI"}</b></button></div>;
}
