import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, signup, getMe } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { Logo, Spinner } from "../components/UI";

export default function AuthPage({ mode: initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await signup(email, password);
        setSuccess("Account created — sign in to continue.");
        setMode("login");
        setPassword("");
      } else {
        const { data } = await login(email, password);
        localStorage.setItem("token", data.access_token);
        // fetch user then redirect
        const me = await getMe();
        setUser(me.data);
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.detail || (mode === "login" ? "Login failed." : "Signup failed."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      {/* Left panel — brand */}
      <div style={s.left}>
        <Logo size="lg" />
        <div style={s.tagline}>
          <h1 style={s.tagH}>Think faster.<br />Chat smarter.</h1>
          <p style={s.tagSub}>
            Lumina gives you a private AI workspace powered by LLaMA 3.3 — 
            persistent chat history, smart caching, and subscription tiers that 
            grow with you.
          </p>
        </div>
        <div style={s.features}>
          {[
            ["⚡", "LLaMA 3.3 70B", "State-of-the-art reasoning"],
            ["💾", "Chat history", "All conversations saved"],
            ["🚀", "Response cache", "Instant repeated answers"],
          ].map(([icon, title, desc]) => (
            <div key={title} style={s.featureRow}>
              <span style={s.featureIcon}>{icon}</span>
              <div>
                <p style={s.featureTitle}>{title}</p>
                <p style={s.featureDesc}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={s.right}>
        <div style={s.card}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={s.formTitle}>
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p style={s.formSub}>
              {mode === "login"
                ? "Sign in to pick up where you left off."
                : "Start chatting with AI in under a minute."}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            <label style={s.label}>Email address</label>
            <input
              style={s.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />

            <label style={{ ...s.label, marginTop: 14 }}>Password</label>
            <input
              style={s.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />

            {error && <p style={s.errorMsg}>{error}</p>}
            {success && <p style={s.successMsg}>{success}</p>}

            <button style={s.btnPrimary} type="submit" disabled={loading}>
              {loading ? <Spinner size={16} color="#fff" /> : null}
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p style={s.switchText}>
            {mode === "login" ? "No account yet? " : "Already have one? "}
            <button
              style={s.switchBtn}
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setSuccess(""); }}
            >
              {mode === "login" ? "Sign up free" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    display: "flex",
    minHeight: "100vh",
    background: "var(--bg-base)",
  },
  left: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "60px 64px",
    background: "var(--bg-surface)",
    borderRight: "1px solid var(--border)",
    "@media(max-width:768px)": { display: "none" },
  },
  tagline: { margin: "48px 0 40px" },
  tagH: {
    fontFamily: "var(--font-display)",
    fontSize: 42,
    fontWeight: 700,
    lineHeight: 1.15,
    color: "var(--text-primary)",
    letterSpacing: "-1px",
    marginBottom: 16,
  },
  tagSub: {
    fontSize: 15,
    color: "var(--text-secondary)",
    lineHeight: 1.7,
    maxWidth: 420,
  },
  features: { display: "flex", flexDirection: "column", gap: 20 },
  featureRow: { display: "flex", alignItems: "flex-start", gap: 16 },
  featureIcon: { fontSize: 20, marginTop: 1 },
  featureTitle: { fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 },
  featureDesc: { fontSize: 13, color: "var(--text-secondary)" },
  right: {
    width: 420,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 32px",
    flexShrink: 0,
  },
  card: { width: "100%", maxWidth: 360 },
  formTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 24,
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: 8,
    letterSpacing: "-0.3px",
  },
  formSub: { fontSize: 13, color: "var(--text-secondary)" },
  form: { display: "flex", flexDirection: "column" },
  label: { fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: "0.3px", textTransform: "uppercase" },
  input: {
    width: "100%",
    padding: "11px 14px",
    background: "var(--bg-surface)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    fontSize: 14,
  },
  errorMsg: { marginTop: 12, fontSize: 13, color: "var(--red)", padding: "8px 12px", background: "rgba(248,113,113,0.08)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(248,113,113,0.2)" },
  successMsg: { marginTop: 12, fontSize: 13, color: "var(--green)", padding: "8px 12px", background: "rgba(34,197,94,0.08)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(34,197,94,0.2)" },
  btnPrimary: {
    marginTop: 20,
    width: "100%",
    padding: "12px",
    background: "var(--indigo)",
    borderRadius: "var(--radius-md)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "opacity 0.15s",
  },
  switchText: { marginTop: 24, fontSize: 13, color: "var(--text-secondary)", textAlign: "center" },
  switchBtn: {
    color: "var(--indigo-light)",
    fontWeight: 600,
    fontSize: 13,
    background: "none",
    border: "none",
    cursor: "pointer",
  },
};
