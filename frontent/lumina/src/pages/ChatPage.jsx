import { useState, useEffect } from "react";
import { getSessions } from "../api/client";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import NewChatModal from "../components/NewChatModal";

export default function ChatPage() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    getSessions()
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data.reverse() : [];
        setSessions(data);
      })
      .catch(() => setSessions([]));
  }, []);

  function handleDeleted(id) {
    setSessions((s) => s.filter((x) => x.id !== id));
    if (activeSession?.id === id) setActiveSession(null);
  }

  function handleCreated(updatedSessions, newSession) {
    setSessions(updatedSessions);
    setActiveSession(newSession || null);
    setShowNewChat(false);
  }

  return (
    <div style={s.layout}>
      {/* Sidebar */}
      <div style={{
        ...s.sidebarSlot,
        marginLeft: sidebarOpen ? 0 : -256,
        transition: "margin 0.22s ease",
      }}>
        <Sidebar
          sessions={sessions}
          activeId={activeSession?.id}
          onSelect={(sess) => setActiveSession(sess)}
          onNew={() => setShowNewChat(true)}
          onDeleted={handleDeleted}
        />
      </div>

      {/* Main */}
      <div style={s.main}>
        {/* Toggle sidebar btn */}
        <button
          style={{ ...s.toggleBtn, left: sidebarOpen ? 264 : 10 }}
          onClick={() => setSidebarOpen((v) => !v)}
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {sidebarOpen
              ? <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
          </svg>
        </button>

        <ChatWindow session={activeSession} />
      </div>

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

const s = {
  layout: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    background: "var(--bg-base)",
  },
  sidebarSlot: {
    flexShrink: 0,
    position: "relative",
    zIndex: 10,
  },
  main: {
    flex: 1,
    minWidth: 0,
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  toggleBtn: {
    position: "absolute",
    top: 13,
    zIndex: 20,
    width: 28,
    height: 28,
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "left 0.22s ease",
  },
};
