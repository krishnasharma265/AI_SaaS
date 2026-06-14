import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateMe } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { Logo, Avatar, Toast } from "../components/UI";

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  async function handleSave(e) {
    e.preventDefault();
    if (password && password !== confirm) {
      setToast({ type: "error", message: "Passwords don't match." });
      return;
    }
    setLoading(true);
    try {
      const payload = {};
      if (email !== user?.email) payload.email = email;
      if (password) payload.password = password;
      if (Object.keys(payload).length === 0) {
        setToast({ type: "info", message: "Nothing to update." });
        return;
      }
      await updateMe(payload);
      setUser({ ...user, ...payload });
      setPassword(""); setConfirm("");
      setToast({ type: "success", message: "Profile updated." });
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.detail || "Update failed." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <Logo />
        <button style={s.backBtn} onClick={() => navigate("/")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to chat
        </button>
      </div>

      <div style={s.content}>
        <div style={s.avatar}>
          <Avatar email={user?.email} size={64} />
          <div>
            <p style={s.avatarEmail}>{user?.email}</p>
            <p style={s.avatarPlan}>Free plan</p>
          </div>
        </div>

        <form onSubmit={handleSave} style={s.form}>
          <h2 style={s.sectionTitle}>Account</h2>
          
          <div style={s.field}>
            <label style={s.label}>Email address</label>
            <input
              style={s.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <h2 style={{ ...s.sectionTitle, marginTop: 32 }}>Change password</h2>
          <p style={s.sectionNote}>Leave blank to keep your current password.</p>

          <div style={s.field}>
            <label style={s.label}>New password</label>
            <input
              style={s.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Confirm new password</label>
            <input
              style={s.input}
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div style={s.actions}>
            <button style={s.btnPrimary} type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>

        <div style={s.danger}>
          <h2 style={s.dangerTitle}>Sign out</h2>
          <p style={s.sectionNote}>You'll need to sign in again on this device.</p>
          <button style={s.dangerBtn} onClick={() => { logout(); navigate("/login"); }}>
            Sign out of Lumina
          </button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "var(--bg-base)",
    padding: "0 24px 60px",
    fontFamily: "var(--font-body)",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 0",
    maxWidth: 560,
    margin: "0 auto",
    borderBottom: "1px solid var(--border)",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "var(--text-secondary)",
    fontSize: 13,
    fontFamily: "var(--font-body)",
  },
  content: {
    maxWidth: 480,
    margin: "40px auto 0",
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  avatar: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 36,
  },
  avatarEmail: {
    fontSize: 15,
    fontWeight: 500,
    color: "var(--text-primary)",
    marginBottom: 3,
  },
  avatarPlan: {
    fontSize: 12,
    color: "var(--indigo-light)",
    background: "var(--indigo-dim)",
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 10,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  sectionTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 16,
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: 6,
  },
  sectionNote: {
    fontSize: 12,
    color: "var(--text-muted)",
    marginBottom: 16,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--text-secondary)",
    letterSpacing: "0.3px",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "var(--radius-md)",
    background: "var(--bg-surface)",
    border: "1px solid var(--border-strong)",
    color: "var(--text-primary)",
    fontSize: 14,
  },
  actions: {
    marginTop: 8,
  },
  btnPrimary: {
    padding: "10px 24px",
    background: "var(--indigo)",
    border: "none",
    borderRadius: "var(--radius-md)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
  },
  danger: {
    marginTop: 48,
    paddingTop: 32,
    borderTop: "1px solid var(--border)",
  },
  dangerTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 16,
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: 6,
  },
  dangerBtn: {
    marginTop: 12,
    padding: "9px 18px",
    background: "none",
    border: "1px solid rgba(248,113,113,0.3)",
    borderRadius: "var(--radius-md)",
    color: "var(--red)",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
  },
};
