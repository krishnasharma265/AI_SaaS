import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deleteSession } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { Logo, Avatar } from "./UI";

export default function Sidebar({ sessions, activeId, onSelect, onNew, onDeleted }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleDelete(e, id) {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteSession(id);
      onDeleted(id);
    } catch {/* handled */}
    finally { setDeletingId(null); }
  }

  function handleLogout() {
    setShowUserMenu(false);
    logout();
    navigate("/login");
  }

  const username = user?.email?.split("@")[0] || "User";

  return (
    <aside style={s.sidebar}>
      {/* Header */}
      <div style={s.header}>
        <Logo />
        <button style={s.newBtn} onClick={onNew} title="New chat">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Session list */}
      <nav style={s.nav}>
        {sessions.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIconWrap}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.6 }}>
              No chats yet.<br />Hit + to start one.
            </p>
          </div>
        ) : (
          sessions.map((sess) => (
            <button
              key={sess.id}
              style={{
                ...s.session,
                ...(sess.id === activeId ? s.sessionActive : {}),
                ...(hoveredId === sess.id && sess.id !== activeId ? s.sessionHover : {}),
              }}
              onClick={() => onSelect(sess)}
              onMouseEnter={() => setHoveredId(sess.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke={sess.id === activeId ? "var(--teal)" : "currentColor"}
                strokeWidth="2" style={{ flexShrink: 0, opacity: sess.id === activeId ? 1 : 0.45 }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span style={s.sessionTitle}>{sess.title}</span>
              {hoveredId === sess.id && (
                <button
                  style={s.deleteBtn}
                  onClick={(e) => handleDelete(e, sess.id)}
                  title="Delete chat"
                >
                  {deletingId === sess.id ? "…" : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  )}
                </button>
              )}
            </button>
          ))
        )}
      </nav>

      {/* Upgrade button */}
      <div style={s.upgradeWrap}>
        <button style={s.upgradeBtn} onClick={() => navigate("/plans")}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Upgrade plan
        </button>
      </div>

      {/* User footer with popover */}
      <div style={s.footer} ref={menuRef}>
        {/* User menu popover — pops UP */}
        {showUserMenu && (
          <div className="pop-in" style={s.userMenu}>
            <div style={s.userMenuHeader}>
              <Avatar email={user?.email} size={36} />
              <div style={{ minWidth: 0 }}>
                <p style={s.menuName}>{username}</p>
                <p style={s.menuEmail}>{user?.email}</p>
              </div>
            </div>
            <div style={s.menuDivider} />
            <button style={s.menuItem} onClick={() => { setShowUserMenu(false); navigate("/settings"); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
              </svg>
              Account settings
            </button>
            <button style={s.menuItem} onClick={() => { setShowUserMenu(false); navigate("/plans"); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Upgrade plan
            </button>
            <div style={s.menuDivider} />
            <button style={{ ...s.menuItem, color: "var(--red)" }} onClick={handleLogout}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>
        )}

        {/* Clickable user row */}
        <button
          style={{ ...s.userRow, ...(showUserMenu ? s.userRowActive : {}) }}
          onClick={() => setShowUserMenu((v) => !v)}
          title="Account menu"
        >
          <Avatar email={user?.email} size={30} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={s.userNameText}>{username}</p>
            <p style={s.userEmailText}>{user?.email}</p>
          </div>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="var(--text-muted)" strokeWidth="2"
            style={{ flexShrink: 0, transition: "transform 0.2s", transform: showUserMenu ? "rotate(180deg)" : "rotate(0)" }}
          >
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}

const s = {
  sidebar: {
    width: 256, minWidth: 256,
    height: "100vh",
    background: "var(--bg-surface)",
    borderRight: "1px solid var(--border)",
    display: "flex", flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    padding: "14px 14px 12px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    borderBottom: "1px solid var(--border)",
  },
  newBtn: {
    width: 30, height: 30,
    background: "var(--grad)",
    borderRadius: "var(--radius-sm)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 2px 6px rgba(13,148,136,0.28)",
    transition: "opacity 0.15s, transform 0.15s",
  },
  nav: {
    flex: 1, overflowY: "auto",
    padding: "8px 6px",
  },
  empty: {
    display: "flex", flexDirection: "column",
    alignItems: "center", padding: "40px 16px", gap: 12,
  },
  emptyIconWrap: {
    width: 44, height: 44,
    background: "var(--teal-dim)",
    borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  session: {
    width: "100%",
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 10px",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-secondary)",
    fontSize: 13,
    background: "none", border: "none",
    cursor: "pointer", marginBottom: 1,
    textAlign: "left",
    transition: "background 0.12s, color 0.12s",
  },
  sessionActive: {
    background: "var(--teal-dim)",
    color: "var(--teal)",
    fontWeight: 500,
  },
  sessionHover: {
    background: "var(--bg-raised)",
    color: "var(--text-primary)",
  },
  sessionTitle: {
    flex: 1, overflow: "hidden",
    textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  deleteBtn: {
    color: "var(--text-muted)",
    display: "flex", alignItems: "center",
    padding: 3, borderRadius: 4, flexShrink: 0,
  },
  upgradeWrap: {
    padding: "0 10px 10px",
  },
  upgradeBtn: {
    display: "flex", alignItems: "center", gap: 8,
    width: "100%",
    padding: "8px 12px",
    background: "var(--grad-soft, var(--teal-dim))",
    border: "1px solid var(--teal-dim-border)",
    borderRadius: "var(--radius-md)",
    color: "var(--teal)",
    fontSize: 12, fontWeight: 600,
    transition: "opacity 0.15s",
  },
  footer: {
    padding: "10px 10px 12px",
    borderTop: "1px solid var(--border)",
    position: "relative",
  },
  userMenu: {
    position: "absolute",
    bottom: "calc(100% + 6px)",
    left: 10, right: 10,
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "0 8px 32px rgba(13,148,136,0.13), 0 2px 8px rgba(0,0,0,0.08)",
    overflow: "hidden",
    zIndex: 50,
  },
  userMenuHeader: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "14px 14px 12px",
    background: "var(--grad-soft, var(--teal-dim))",
  },
  menuName: {
    fontSize: 13, fontWeight: 600,
    color: "var(--text-primary)",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  menuEmail: {
    fontSize: 11, color: "var(--text-muted)",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  menuDivider: {
    height: 1, background: "var(--border)", margin: "4px 0",
  },
  menuItem: {
    display: "flex", alignItems: "center", gap: 10,
    width: "100%",
    padding: "10px 14px",
    fontSize: 13, color: "var(--text-secondary)",
    background: "none", border: "none",
    textAlign: "left", cursor: "pointer",
    transition: "background 0.12s, color 0.12s",
  },
  userRow: {
    width: "100%",
    display: "flex", alignItems: "center", gap: 10,
    padding: "8px 10px",
    borderRadius: "var(--radius-md)",
    background: "none", border: "none",
    cursor: "pointer",
    transition: "background 0.12s",
    textAlign: "left",
  },
  userRowActive: {
    background: "var(--bg-raised)",
  },
  userNameText: {
    fontSize: 12, fontWeight: 600,
    color: "var(--text-primary)",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  userEmailText: {
    fontSize: 11, color: "var(--text-muted)",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
};
