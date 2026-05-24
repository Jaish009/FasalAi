"use client";
// src/components/dashboard/DashboardClient.tsx

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import Sidebar from "./Sidebar";
import OverviewTab from "./tabs/OverviewTab";
import MyCropsTab from "./tabs/MyCropsTab";
import MandiFinderTab from "./tabs/MandiFinderTab";
import AlertsTab from "./tabs/AlertsTab";
import AIForecastTab from "./tabs/AIForecastTab";
import type { Crop, Mandi, PriceRecord, Alert } from "@/types";

export type Tab = "overview" | "my-crops" | "mandis" | "ai-forecast" | "alerts";

interface Props {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    language: string;
    crops: Array<{ crop: Crop; mandi?: Mandi }>;
    alerts: Alert[];
  };
  latestPrices: PriceRecord[];
  allCrops: Crop[];
  allMandis: Mandi[];
}

export default function DashboardClient({ user, latestPrices, allCrops, allMandis }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [lang, setLang] = useState<"en" | "hi">(user.language === "HINDI" ? "hi" : "en");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const t = (en: string, hi: string) => (lang === "hi" ? hi : en);

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header
          style={{
            background: "white",
            borderBottom: "1px solid rgba(45,106,79,0.1)",
            padding: "1rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                display: "none",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1.3rem",
                color: "var(--green, #2d6a4f)",
              }}
              className="mobile-menu-btn"
            >
              ☰
            </button>
            <div>
              <h1
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#1b2d1e",
                  margin: 0,
                }}
              >
                {t(`Good morning, ${user.name.split(" ")[0]} 👋`, `नमस्ते, ${user.name.split(" ")[0]} 👋`)}
              </h1>
              <p style={{ fontSize: "0.78rem", color: "#4a6741", margin: 0 }}>
                {t("Track prices, predict markets, sell smarter", "भाव ट्रैक करें, बाजार समझें, सही दाम पाएं")}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Language Toggle */}
            <div
              style={{
                display: "flex",
                background: "rgba(45,106,79,0.08)",
                borderRadius: "100px",
                padding: "3px",
              }}
            >
              {(["en", "hi"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    padding: "0.3rem 0.8rem",
                    borderRadius: "100px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    transition: "all 0.2s",
                    background: lang === l ? "#2d6a4f" : "transparent",
                    color: lang === l ? "white" : "#4a6741",
                  }}
                >
                  {l === "en" ? "EN" : "हि"}
                </button>
              ))}
            </div>

            {/* Notification Bell */}
            <button
              style={{
                position: "relative",
                background: "rgba(45,106,79,0.08)",
                border: "none",
                borderRadius: "50%",
                width: "38px",
                height: "38px",
                cursor: "pointer",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => setActiveTab("alerts")}
            >
              🔔
              {user.alerts.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    width: "8px",
                    height: "8px",
                    background: "#e63946",
                    borderRadius: "50%",
                    border: "2px solid white",
                  }}
                />
              )}
            </button>

            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Tab Content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {activeTab === "overview" && (
            <OverviewTab user={user} latestPrices={latestPrices} lang={lang} setActiveTab={setActiveTab} />
          )}
          {activeTab === "my-crops" && (
            <MyCropsTab user={user} allCrops={allCrops} allMandis={allMandis} lang={lang} />
          )}
          {activeTab === "mandis" && <MandiFinderTab allMandis={allMandis} lang={lang} />}
          {activeTab === "ai-forecast" && (
            <AIForecastTab userCrops={user.crops} lang={lang} />
          )}
          {activeTab === "alerts" && (
            <AlertsTab user={user} allCrops={allCrops} allMandis={allMandis} lang={lang} />
          )}
        </main>
      </div>
    </div>
  );
}
