"use client";
// src/components/dashboard/Sidebar.tsx

import type { Tab } from "./DashboardClient";

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  lang: "en" | "hi";
  open: boolean;
  onClose: () => void;
}

const navItems: { id: Tab; icon: string; en: string; hi: string }[] = [
  { id: "overview",    icon: "📊", en: "Dashboard",   hi: "डैशबोर्ड" },
  { id: "my-crops",   icon: "🌾", en: "My Crops",     hi: "मेरी फसल" },
  { id: "mandis",     icon: "🏪", en: "Mandi Finder", hi: "मंडी खोजें" },
  { id: "ai-forecast",icon: "🤖", en: "AI Forecast",  hi: "AI भविष्यवाणी" },
  { id: "alerts",     icon: "🔔", en: "Alerts",       hi: "अलर्ट" },
];

export default function Sidebar({ activeTab, setActiveTab, lang, open, onClose }: Props) {
  const t = (en: string, hi: string) => (lang === "hi" ? hi : en);

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            zIndex: 49, display: "block",
          }}
        />
      )}

      <aside
        style={{
          width: "220px",
          background: "rgba(255, 255, 255, 0.65)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.8)",
          boxShadow: "4px 0 24px rgba(45, 106, 79, 0.03)",
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem 1rem",
          flexShrink: 0,
          zIndex: 50,
          transition: "transform 0.3s",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "1.4rem",
            fontWeight: 800,
            color: "#2d6a4f",
            marginBottom: "2rem",
            paddingLeft: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          🌾 Fasal<span style={{ color: "#f4a261" }}>AI</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          <p
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#4a6741",
              padding: "0 0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            {t("Menu", "मेनू")}
          </p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); onClose(); }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "0.7rem",
                padding: "0.65rem 0.8rem",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontSize: "0.88rem",
                fontWeight: 500,
                marginBottom: "0.2rem",
                transition: "all 0.2s",
                textAlign: "left",
                background: activeTab === item.id ? "#2d6a4f" : "transparent",
                color: activeTab === item.id ? "white" : "#4a6741",
              }}
            >
              <span>{item.icon}</span>
              <span>{t(item.en, item.hi)}</span>
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div
          style={{
            borderTop: "1px solid rgba(45,106,79,0.1)",
            paddingTop: "1rem",
            fontSize: "0.75rem",
            color: "#4a6741",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "1.2rem", marginBottom: "0.3rem" }}>🌾</div>
          <div style={{ fontWeight: 600 }}>FasalAI v1.0</div>
          <div style={{ fontSize: "0.7rem", marginTop: "0.2rem", color: "#4a6741" }}>
            {t("Mandi Intelligence", "मंडी बुद्धिमत्ता")}
          </div>
        </div>
      </aside>
    </>
  );
}
