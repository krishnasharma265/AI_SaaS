import { useState, useEffect, useRef } from "react";
import { getMessages, sendMessage } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { TypingDots } from "./UI";

function greeting(email) {
  const hour = new Date().getHours();
  const name = email?.split("@")[0] || "there";
  const name2 = name.charAt(0).toUpperCase() + name.slice(1);
  if (hour < 12) return `Good morning, ${name2} 🌿`;
  if (hour < 17) return `Good afternoon, ${name2} ☀️`;
  return `Good evening, ${name2} 🌙`;
}

const SUGGESTIONS = [
  "Explain quantum computing in simple terms",
  "Write a Python function to sort a list",
  "Give me tips for productive deep work",
  "Summarise the history of the internet",
];

function AiAvatar() {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "50%",
      background: "var(--grad)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
      boxShadow: "0 1px 4px rgba(13,148,136,0.28)",
    }}>
      <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
        <path d="M10 2C10 2 13.5 6.5 18 7.5C18 7.5 14.5 10.5 15.5 15C15.5 15 12 12.5 10 13.5C10 13.5 8 12.5 4.5 15C4.5 15 5.5 10.5 2 7.5C2 7.5 6.5 6.5 10 2Z" fill="white"/>
      </svg>
    </div>
  );
}

function Bubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className="fade-up" style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      alignItems: "flex-end", gap: 10,
    }}>
      {!isUser && <AiAvatar />}
      <div style={{
        maxWidth: "70%",
        padding: "11px 16px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        wordBreak: "break-word",
        fontSize: 14, lineHeight: 1.65,
        ...(isUser ? {
          background: "var(--grad)",
          color: "#fff",
          boxShadow: "0 2px 8px rgba(13,148,136,0.22)",
        } : {
          background: "var(--bg-surface)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }),
      }}>
        <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
        {msg.source === "cache" && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            marginTop: 6, fontSize: 10,
            color: "var(--teal)", background: "var(--teal-dim)",
            padding: "2px 8px", borderRadius: 10,
          }}>
            ⚡ cached
          </span>
        )}
      </div>
    </div>
  );
}

function InputBox({ value, onChange, onKeyDown, onSend, sending, placeholder, style = {} }) {
  const taRef = useRef(null);
  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = "auto";
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 160) + "px";
    }
  }, [value]);

  return (
    <div style={{
      display: "flex", alignItems: "flex-end", gap: 10,
      background: "var(--bg-surface)",
      border: "1.5px solid var(--border-strong)",
      borderRadius: 20,
      padding: "10px 10px 10px 18px",
      boxShadow: "0 4px 24px rgba(13,148,136,0.10)",
      transition: "border-color 0.18s, box-shadow 0.18s",
      ...style,
    }}
      onFocus={() => {}}
    >
      <textarea
        ref={taRef}
        style={{
          flex: 1, background: "none", border: "none",
          color: "var(--text-primary)", fontSize: 15,
          lineHeight: 1.5, resize: "none", outline: "none",
          maxHeight: 160, overflowY: "auto",
          fontFamily: "var(--font-body)",
        }}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={1}
      />
      <button
        style={{
          width: 38, height: 38, flexShrink: 0,
          background: "var(--grad)",
          border: "none", borderRadius: "50%",
          color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(13,148,136,0.3)",
          transition: "opacity 0.15s, transform 0.15s",
          opacity: value.trim() && !sending ? 1 : 0.35,
          transform: value.trim() && !sending ? "scale(1)" : "scale(0.92)",
        }}
        onClick={onSend}
        disabled={!value.trim() || sending}
        title="Send"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  );
}

export default function ChatWindow({ session }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!session) return;
    setMessages([]); setError(""); setLoadingMsgs(true);
    getMessages(session.id)
      .then((r) => setMessages(Array.isArray(r.data) ? r.data : []))
      .catch(() => setMessages([]))
      .finally(() => setLoadingMsgs(false));
  }, [session?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function handleSend() {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput(""); setError("");
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", content }]);
    setSending(true);
    try {
      const { data } = await sendMessage(session.id, content);
      setMessages((m) => [...m, {
        id: `a-${Date.now()}`, role: "assistant",
        content: data.response, source: data.source,
      }]);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong.");
      setMessages((m) => m.slice(0, -1));
    } finally { setSending(false); }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  // ── No session selected ──
  if (!session) {
    return (
      <div style={s.noSession}>
        <div style={s.noSessionInner}>
          <div style={s.gradIcon}>
            <svg width="26" height="26" viewBox="0 0 20 20" fill="none">
              <path d="M10 2C10 2 13.5 6.5 18 7.5C18 7.5 14.5 10.5 15.5 15C15.5 15 12 12.5 10 13.5C10 13.5 8 12.5 4.5 15C4.5 15 5.5 10.5 2 7.5C2 7.5 6.5 6.5 10 2Z" fill="white"/>
            </svg>
          </div>
          <p style={s.noSessionHint}>Select a chat or start a new one</p>
        </div>
      </div>
    );
  }

  const hasMessages = messages.length > 0 || sending;

  // ── Empty chat → centered greeting + input ──
  if (!hasMessages && !loadingMsgs) {
    return (
      <div style={s.centeredWrap}>
        <div className="fade-up" style={s.greetingBlock}>
          <div style={s.greetingIcon}>
            <svg width="32" height="32" viewBox="0 0 20 20" fill="none">
              <path d="M10 2C10 2 13.5 6.5 18 7.5C18 7.5 14.5 10.5 15.5 15C15.5 15 12 12.5 10 13.5C10 13.5 8 12.5 4.5 15C4.5 15 5.5 10.5 2 7.5C2 7.5 6.5 6.5 10 2Z" fill="white"/>
            </svg>
          </div>
          <h1 style={s.greetingText}>{greeting(user?.email)}</h1>
          <p style={s.greetingSubtext}>How can I help you today?</p>
        </div>

        <div className="fade-up" style={{ ...s.centeredInputWrap, animationDelay: "0.08s" }}>
          <InputBox
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            onSend={handleSend}
            sending={sending}
            placeholder="Ask me anything…"
          />
          <div style={s.suggestions}>
            {SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                style={s.suggestBtn}
                onClick={() => { setInput(sug); }}
              >
                {sug}
              </button>
            ))}
          </div>
          <p style={s.hint}>Powered by LLaMA 3.3 70B · Responses may be inaccurate</p>
        </div>
      </div>
    );
  }

  // ── Active chat → messages + bottom input ──
  return (
    <div style={s.window}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerDot} />
        <span style={s.headerTitle}>{session.title}</span>
      </div>

      {/* Messages */}
      <div style={s.messages}>
        {loadingMsgs && (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <TypingDots />
          </div>
        )}
        {messages.map((m, i) => <Bubble key={m.id || i} msg={m} />)}
        {sending && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
            <AiAvatar />
            <div style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: "18px 18px 18px 4px",
              padding: "12px 16px",
            }}>
              <TypingDots />
            </div>
          </div>
        )}
        {error && (
          <div style={s.errorBanner}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Bottom input */}
      <div style={s.inputWrap}>
        <InputBox
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          onSend={handleSend}
          sending={sending}
          placeholder="Ask anything… (Enter to send)"
        />
        <p style={s.hint}>Powered by LLaMA 3.3 70B · Responses may be inaccurate</p>
      </div>
    </div>
  );
}

const s = {
  /* No session */
  noSession: {
    flex: 1, display: "flex",
    alignItems: "center", justifyContent: "center",
    background: "var(--bg-base)",
  },
  noSessionInner: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 12,
  },
  gradIcon: {
    width: 56, height: 56, borderRadius: "50%",
    background: "var(--grad)",
    display: "flex", alignItems: "center", justifyContent: "center",
    opacity: 0.25,
    boxShadow: "0 4px 16px rgba(13,148,136,0.3)",
  },
  noSessionHint: { fontSize: 14, color: "var(--text-muted)" },

  /* Centered greeting state */
  centeredWrap: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "40px 24px",
    background: "var(--bg-base)",
    gap: 36,
  },
  greetingBlock: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 12, textAlign: "center",
  },
  greetingIcon: {
    width: 64, height: 64, borderRadius: "50%",
    background: "var(--grad)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 6px 24px rgba(13,148,136,0.30)",
    marginBottom: 4,
  },
  greetingText: {
    fontFamily: "var(--font-display)",
    fontSize: 32, fontWeight: 700,
    background: "var(--grad)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.5px",
  },
  greetingSubtext: {
    fontSize: 15, color: "var(--text-secondary)",
  },
  centeredInputWrap: {
    width: "100%", maxWidth: 660,
    display: "flex", flexDirection: "column", gap: 12,
  },
  suggestions: {
    display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center",
  },
  suggestBtn: {
    padding: "7px 14px",
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    fontSize: 12, color: "var(--text-secondary)",
    cursor: "pointer",
    transition: "background 0.12s, border-color 0.12s, color 0.12s",
    whiteSpace: "nowrap",
  },

  /* Active chat */
  window: {
    display: "flex", flexDirection: "column",
    height: "100vh", flex: 1, minWidth: 0,
    background: "var(--bg-base)",
  },
  header: {
    padding: "13px 24px",
    borderBottom: "1px solid var(--border)",
    background: "var(--bg-surface)",
    display: "flex", alignItems: "center", gap: 10,
    flexShrink: 0,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  headerDot: {
    width: 8, height: 8, borderRadius: "50%",
    background: "var(--grad)",
  },
  headerTitle: {
    fontSize: 14, fontWeight: 600,
    color: "var(--text-primary)",
  },
  messages: {
    flex: 1, overflowY: "auto",
    padding: "28px 28px",
    display: "flex", flexDirection: "column", gap: 18,
  },
  errorBanner: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 14px",
    background: "rgba(248,113,113,0.07)",
    border: "1px solid rgba(248,113,113,0.18)",
    borderRadius: "var(--radius-md)",
    color: "var(--red)", fontSize: 13,
  },
  inputWrap: {
    padding: "12px 24px 18px",
    borderTop: "1px solid var(--border)",
    background: "var(--bg-surface)",
    flexShrink: 0,
  },
  hint: {
    marginTop: 8, fontSize: 11,
    color: "var(--text-muted)", textAlign: "center",
  },
};
