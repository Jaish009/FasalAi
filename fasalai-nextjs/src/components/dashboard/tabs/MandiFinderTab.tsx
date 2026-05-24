"use client";
// src/components/dashboard/tabs/MandiFinderTab.tsx

import { useState } from "react";
import type { Mandi } from "@/types";

interface Props { allMandis: Mandi[]; lang: "en" | "hi"; }

export default function MandiFinderTab({ allMandis, lang }: Props) {
  const t = (en: string, hi: string) => (lang === "hi" ? hi : en);
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");

  const displayMandis = allMandis.length > 0 ? allMandis : [
    { id: "m1", name: "Indore Mandi", nameHindi: "इंदौर मंडी", state: "Madhya Pradesh", district: "Indore", latitude: 22.72, longitude: 75.86, facilities: ["Cold Storage", "Weighing", "Parking", "Bank"], rating: 4.2, timings: "6:00 AM – 6:00 PM" },
    { id: "m2", name: "Ujjain Mandi", nameHindi: "उज्जैन मंडी", state: "Madhya Pradesh", district: "Ujjain", latitude: 23.18, longitude: 75.79, facilities: ["Weighing", "Parking"], rating: 3.9, timings: "6:00 AM – 5:00 PM" },
    { id: "m3", name: "Dewas Mandi", nameHindi: "देवास मंडी", state: "Madhya Pradesh", district: "Dewas", latitude: 22.96, longitude: 76.05, facilities: ["Weighing", "Parking"], rating: 3.7, timings: "7:00 AM – 5:00 PM" },
    { id: "m4", name: "Khargone Mandi", nameHindi: "खरगोन मंडी", state: "Madhya Pradesh", district: "Khargone", latitude: 21.82, longitude: 75.61, facilities: ["Cold Storage", "Weighing"], rating: 4.0, timings: "6:30 AM – 5:30 PM" },
    { id: "m5", name: "Bhopal Mandi", nameHindi: "भोपाल मंडी", state: "Madhya Pradesh", district: "Bhopal", latitude: 23.26, longitude: 77.41, facilities: ["Cold Storage", "Weighing", "Parking", "Bank", "Canteen"], rating: 4.5, timings: "6:00 AM – 7:00 PM" },
  ];

  const filtered = displayMandis.filter((m: any) =>
    (m.name.toLowerCase().includes(search.toLowerCase()) ||
     m.nameHindi.includes(search) ||
     m.district.toLowerCase().includes(search.toLowerCase())) &&
    (!state || m.state === state)
  );

  return (
    <div style={{ maxWidth: "900px" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.3rem", fontWeight: 800, color: "#1b2d1e", margin: "0 0 0.3rem" }}>
          🏪 {t("Mandi Finder", "मंडी खोजें")}
        </h2>
        <p style={{ fontSize: "0.82rem", color: "#4a6741", margin: 0 }}>
          {t("Find the best mandi near you", "अपने पास की बेहतरीन मंडी खोजें")}
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ display: "flex", gap: "0.8rem", marginBottom: "1.5rem" }}>
        <input
          type="text" placeholder={t("Search mandi or district...", "मंडी या जिला खोजें...")}
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: "0.7rem 1rem", borderRadius: "12px", border: "1px solid rgba(45,106,79,0.2)", fontSize: "0.9rem", outline: "none", color: "#1b2d1e" }}
        />
        <button
          onClick={() => navigator.geolocation?.getCurrentPosition(() => {})}
          style={{ padding: "0.7rem 1.2rem", borderRadius: "12px", border: "1px solid rgba(45,106,79,0.2)", background: "white", cursor: "pointer", fontSize: "0.85rem", color: "#2d6a4f", fontWeight: 600, whiteSpace: "nowrap" }}
        >
          📍 {t("Near Me", "मेरे पास")}
        </button>
      </div>

      {/* Mandi Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
        {filtered.map((mandi: any) => (
          <div key={mandi.id} style={{
            background: "white", borderRadius: "16px", padding: "1.3rem",
            boxShadow: "0 4px 16px rgba(45,106,79,0.08)",
            border: "1px solid rgba(45,106,79,0.07)", transition: "all 0.2s",
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(45,106,79,0.14)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(45,106,79,0.08)"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.8rem" }}>
              <div>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#1b2d1e" }}>
                  {t(mandi.name, mandi.nameHindi)}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#4a6741", marginTop: "0.2rem" }}>
                  📍 {mandi.district}, {mandi.state}
                </div>
              </div>
              <div style={{
                background: "rgba(45,106,79,0.1)", padding: "0.3rem 0.6rem",
                borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700, color: "#2d6a4f",
              }}>
                ⭐ {mandi.rating}
              </div>
            </div>

            <div style={{ fontSize: "0.78rem", color: "#4a6741", marginBottom: "0.8rem" }}>
              🕐 {mandi.timings}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
              {mandi.facilities.map((f: string) => (
                <span key={f} style={{ padding: "0.15rem 0.5rem", borderRadius: "100px", background: "rgba(45,106,79,0.07)", fontSize: "0.7rem", color: "#2d6a4f", fontWeight: 500 }}>
                  {f}
                </span>
              ))}
            </div>

            <button style={{
              width: "100%", marginTop: "1rem", padding: "0.55rem",
              borderRadius: "10px", border: "1px solid rgba(45,106,79,0.3)",
              background: "transparent", color: "#2d6a4f", fontSize: "0.82rem",
              fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#2d6a4f"; (e.currentTarget as HTMLElement).style.color = "white"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#2d6a4f"; }}
            >
              🗺 {t("Get Directions", "दिशा पाएं")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
