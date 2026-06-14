export function Logo({ size = "md" }) {
  const big = size === "lg";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: big ? 10 : 8 }}>
      <div style={{
        width: big ? 34 : 26, height: big ? 34 : 26,
        borderRadius: big ? 10 : 8,
        background: "var(--grad)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 2px 8px rgba(13,148,136,0.32)",
      }}>
        <svg width={big ? 18 : 14} height={big ? 18 : 14} viewBox="0 0 20 20" fill="none">
          <path d="M10 2C10 2 13.5 6.5 18 7.5C18 7.5 14.5 10.5 15.5 15C15.5 15 12 12.5 10 13.5C10 13.5 8 12.5 4.5 15C4.5 15 5.5 10.5 2 7.5C2 7.5 6.5 6.5 10 2Z" fill="white"/>
        </svg>
      </div>
      <span style={{
        fontFamily: "var(--font-display)",
        fontSize: big ? 26 : 18,
        fontWeight: 700,
        background: "var(--grad)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        letterSpacing: "-0.4px",
      }}>Lumina</span>
    </div>
  );
}

export function Spinner({ size = 18, color = "var(--teal)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ animation: "spin 0.75s linear infinite", flexShrink: 0 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.5"
        strokeDasharray="36 20" strokeLinecap="round"/>
    </svg>
  );
}

export function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "2px 0" }}>
      <span className="dot"/><span className="dot"/><span className="dot"/>
    </div>
  );
}

export function Avatar({ email, size = 32 }) {
  const letter = email?.[0]?.toUpperCase() || "U";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "var(--grad)",
      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
      boxShadow: "0 1px 4px rgba(13,148,136,0.3)",
      userSelect: "none",
    }}>{letter}</div>
  );
}

export function Toast({ message, type = "error", onClose }) {
  const c = type === "error" ? "var(--red)" : type === "success" ? "var(--teal)" : "var(--sky)";
  return (
    <div className="pop-in" style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 999,
      background: "var(--bg-surface)",
      border: `1px solid ${c}`,
      borderLeft: `3px solid ${c}`,
      borderRadius: "var(--radius-md)",
      padding: "12px 16px",
      color: "var(--text-primary)",
      fontSize: 13,
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
      maxWidth: 360,
    }}>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ color: "var(--text-muted)", fontSize: 18, lineHeight: 1 }}>×</button>
    </div>
  );
}
