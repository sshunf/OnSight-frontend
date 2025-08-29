import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/Sidebar.css";

export default function Sidebar({
  isOpen,
  onClose,
  onLogout,
  displayName,
  email,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const initials = (displayName || email || "U")
    .trim()
    .split(/\s+/)
    .map((s) => s[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  const navItems = [
    { to: "/dashboard", label: "Dashboard", emoji: "🏠" },
    { to: "/analytics", label: "Analytics", emoji: "📈" },
    { to: "/chatbot", label: "Chatbot", emoji: "💬" },
  ];

  // Close on Esc
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <>
      <div className={`sidebar ${isOpen ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Sidebar">
        <div className="sidebar-header">
          <div className="profile">
            <div className="avatar" aria-hidden="true">{initials || "U"}</div>
            <div>
              <div className="name">{displayName || "User"}</div>
              <div className="email" title={email || ""}>{email || ""}</div>
            </div>
          </div>
          <button className="close-btn" aria-label="Close sidebar" onClick={onClose}>×</button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <button
                key={item.to}
                className={active ? "active" : ""}
                onClick={() => {
                  navigate(item.to);
                  onClose();
                }}
              >
                <span style={{ marginRight: 10 }}>{item.emoji}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="signout-btn" onClick={onLogout}>🚪 Sign Out</button>
        </div>
      </div>

      {/* Dim background */}
      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
    </>
  );
}
