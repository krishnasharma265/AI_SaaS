import { useState, useRef, useEffect } from "react";
import { createSession, getSessions } from "../api/client";

export default function NewChatModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function handleCreate() {
    if (!title.trim()) return;
    setLoading(true);
    setError("");
    try {
      await createSession(title.trim());
      const { data } = await getSessions();
      const sessions = Array.isArray(data) ? data.reverse() : [];
      const newSession = sessions.find((s) => s.title === title.trim());
      onCreated(sessions, newSession);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create chat.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <h2 style={s.modalTitle}>New conversation</h2>
          <button style={s.closeBtn} onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <p style={s.modalSub}>Name your chat so you can find it later.</p>

        <input
          ref={inputRef}
          style={s.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") onClose(); }}
          placeholder="e.g. Research notes, Code review…"
          maxLength={80}
        />

        {error && <p style={s.error}>{error}</p>}

        <div style={s.actions}>
          <button style={s.btnSecondary} onClick={onClose}>Cancel</button>
          <button
            style={{ ...s.btnPrimary, opacity: title.trim() && !loading ? 1 : 0.5 }}
            onClick={handleCreate}
            disabled={!title.trim() || loading}
          >
            {loading ? "Creating…" : "Create chat"}
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 100,
    backdropFilter: "blur(2px)",
  },
  modal: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-xl)",
    padding: "28px 28px 24px",
    width: "100%",
    maxWidth: 420,
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  modalTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 18,
    fontWeight: 600,
    color: "var(--text-primary)",
  },
  closeBtn: {
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    padding: 4,
    borderRadius: 6,
  },
  modalSub: {
    fontSize: 13,
    color: "var(--text-secondary)",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    fontSize: 14,
    borderRadius: "var(--radius-md)",
  },
  error: {
    marginTop: 10,
    fontSize: 12,
    color: "var(--red)",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  btnSecondary: {
    padding: "9px 18px",
    background: "none",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-secondary)",
    fontSize: 13,
    fontWeight: 500,
  },
  btnPrimary: {
    padding: "9px 20px",
    background: "var(--indigo)",
    border: "none",
    borderRadius: "var(--radius-md)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    transition: "opacity 0.15s",
  },
};
