"use client";
// src/components/dashboard/tabs/MyCropsTab.tsx

import { useState } from "react";
import type { Crop, Mandi } from "@/types";

interface Props {
  user: any;
  allCrops: Crop[];
  allMandis: Mandi[];
  lang: "en" | "hi";
}

const CATEGORY_ICONS: Record<string, string> = {
  GRAIN: "🌾", OILSEED: "🌱", VEGETABLE: "🥬", FRUIT: "🍎",
  FIBER: "🌿", SPICE: "🧄", PULSE: "🫘", OTHER: "🌸",
};

export default function MyCropsTab({ user, allCrops, allMandis, lang }: Props) {
  const t = (en: string, hi: string) => (lang === "hi" ? hi : en);
  const [showModal, setShowModal] = useState(false);
  const [selectedCropId, setSelectedCropId] = useState("");
  const [selectedMandiId, setSelectedMandiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Mock prices for display
  const mockPrices: Record<string, { price: number; change: number }> = {
    "crop-wheat":    { price: 2185, change: 2.3 },
    "crop-soybean":  { price: 4320, change: 0.6 },
    "crop-onion":    { price: 1240, change: -3.2 },
    "crop-cotton":   { price: 6800, change: 1.8 },
    "crop-maize":    { price: 1890, change: -0.8 },
    "crop-paddy":    { price: 2040, change: 1.1 },
    "crop-tomato":   { price: 850,  change: 5.4 },
    "crop-garlic":   { price: 3100, change: 4.1 },
  };

  // Default crops if user has none
  const displayCrops = user.crops.length > 0
    ? user.crops
    : [
        { crop: { id: "crop-wheat", name: "Wheat", nameHindi: "गेहूं", category: "GRAIN" }, mandi: { name: "Indore Mandi", nameHindi: "इंदौर मंडी" } },
        { crop: { id: "crop-soybean", name: "Soybean", nameHindi: "सोयाबीन", category: "OILSEED" }, mandi: { name: "Ujjain Mandi", nameHindi: "उज्जैन मंडी" } },
        { crop: { id: "crop-onion", name: "Onion", nameHindi: "प्याज", category: "VEGETABLE" }, mandi: { name: "Dewas Mandi", nameHindi: "देवास मंडी" } },
      ];

  const handleAddCrop = async () => {
    if (!selectedCropId) return;
    setLoading(true);
    try {
      await fetch("/api/crops/my", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropId: selectedCropId, mandiId: selectedMandiId }),
      });
      setShowModal(false);
      setSelectedCropId("");
      setSelectedMandiId("");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredCrops = allCrops.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nameHindi.includes(search)
  );

  return (
    <div style={{ maxWidth: "900px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.3rem", fontWeight: 800, color: "#1b2d1e", margin: 0 }}>
            🌾 {t("My Crops", "मेरी फसलें")}
          </h2>
          <p style={{ fontSize: "0.82rem", color: "#4a6741", margin: "0.3rem 0 0" }}>
            {t("Track prices for your crops", "अपनी फसलों के भाव ट्रैक करें")}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: "#2d6a4f", color: "white",
            border: "none", borderRadius: "100px",
            padding: "0.6rem 1.3rem", cursor: "pointer",
            fontSize: "0.85rem", fontWeight: 600,
            display: "flex", alignItems: "center", gap: "0.4rem",
            boxShadow: "0 4px 16px rgba(45,106,79,0.3)",
            transition: "all 0.2s",
          }}
        >
          + {t("Add Crop", "फसल जोड़ें")}
        </button>
      </div>

      {/* Crops Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {displayCrops.map((uc: any, i: number) => {
          const priceData = mockPrices[uc.crop.id] || { price: 2000, change: 0 };
          return (
            <div
              key={i}
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "1.3rem",
                boxShadow: "0 4px 16px rgba(45,106,79,0.08)",
                border: "1px solid rgba(45,106,79,0.07)",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(45,106,79,0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(45,106,79,0.08)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.8rem" }}>
                <div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#4a6741" }}>
                    {CATEGORY_ICONS[uc.crop.category]} {uc.crop.category}
                  </div>
                  <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#1b2d1e", marginTop: "0.2rem" }}>
                    {t(uc.crop.name, uc.crop.nameHindi)}
                  </div>
                </div>
                <button
                  style={{ background: "rgba(230,57,70,0.08)", border: "none", borderRadius: "8px", padding: "0.3rem 0.5rem", cursor: "pointer", fontSize: "0.75rem", color: "#e63946" }}
                  title="Remove crop"
                >✕</button>
              </div>

              <div style={{ fontSize: "0.78rem", color: "#4a6741", marginBottom: "0.8rem" }}>
                📍 {uc.mandi ? t(uc.mandi.name, uc.mandi.nameHindi) : t("Select mandi", "मंडी चुनें")}
              </div>

              <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.7rem", fontWeight: 800, color: "#2d6a4f" }}>
                ₹{priceData.price.toLocaleString("en-IN")}
                <span style={{ fontSize: "0.7rem", fontWeight: 400, color: "#4a6741" }}>/q</span>
              </div>

              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.3rem",
                marginTop: "0.4rem", fontSize: "0.78rem", fontWeight: 600,
                color: priceData.change >= 0 ? "#2d6a4f" : "#e63946",
              }}>
                {priceData.change >= 0 ? "▲" : "▼"} {Math.abs(priceData.change)}% {t("today", "आज")}
              </div>

              {/* Mini chart placeholder */}
              <svg width="100%" height="32" viewBox="0 0 120 32" style={{ marginTop: "0.8rem" }}>
                <polyline
                  points={`0,${28 - i * 2} 20,${24 - i} 40,${20 + i} 60,${16 - i * 2} 80,${12 + i} 100,${10 - i} 120,${priceData.change >= 0 ? 6 : 20}`}
                  fill="none"
                  stroke={priceData.change >= 0 ? "#2d6a4f" : "#e63946"}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          );
        })}

        {/* Add New Card */}
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: "rgba(45,106,79,0.04)",
            border: "2px dashed rgba(45,106,79,0.2)",
            borderRadius: "16px",
            padding: "1.3rem",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            color: "#4a6741",
            transition: "all 0.2s",
            minHeight: "180px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2d6a4f")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(45,106,79,0.2)")}
        >
          <div style={{ fontSize: "2rem" }}>+</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{t("Add Crop", "फसल जोड़ें")}</div>
        </button>
      </div>

      {/* Add Crop Modal */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div style={{ background: "white", borderRadius: "20px", padding: "2rem", width: "100%", maxWidth: "480px", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, color: "#1b2d1e", margin: 0, fontSize: "1.2rem" }}>
                🌾 {t("Add a Crop", "फसल जोड़ें")}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "#4a6741" }}>✕</button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder={t("Search crops...", "फसल खोजें...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "0.7rem 1rem",
                borderRadius: "10px", border: "1px solid rgba(45,106,79,0.2)",
                fontSize: "0.9rem", marginBottom: "1rem",
                outline: "none", color: "#1b2d1e",
              }}
            />

            {/* Crop List */}
            <div style={{ maxHeight: "220px", overflowY: "auto", marginBottom: "1rem" }}>
              {filteredCrops.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => setSelectedCropId(crop.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "0.8rem",
                    padding: "0.7rem", borderRadius: "10px",
                    border: selectedCropId === crop.id ? "2px solid #2d6a4f" : "1px solid rgba(45,106,79,0.1)",
                    background: selectedCropId === crop.id ? "rgba(45,106,79,0.06)" : "transparent",
                    cursor: "pointer", marginBottom: "0.3rem", textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>{CATEGORY_ICONS[crop.category]}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: "#1b2d1e", fontSize: "0.9rem" }}>{crop.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "#4a6741" }}>{crop.nameHindi} · {crop.category}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Mandi selector */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#4a6741", display: "block", marginBottom: "0.4rem" }}>
                {t("Select Mandi (optional)", "मंडी चुनें (वैकल्पिक)")}
              </label>
              <select
                value={selectedMandiId}
                onChange={(e) => setSelectedMandiId(e.target.value)}
                style={{ width: "100%", padding: "0.7rem 1rem", borderRadius: "10px", border: "1px solid rgba(45,106,79,0.2)", fontSize: "0.9rem", color: "#1b2d1e" }}
              >
                <option value="">{t("Any nearest mandi", "कोई भी नजदीकी मंडी")}</option>
                {allMandis.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} — {m.district}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAddCrop}
              disabled={!selectedCropId || loading}
              style={{
                width: "100%", background: !selectedCropId ? "#ccc" : "#2d6a4f",
                color: "white", border: "none", borderRadius: "100px",
                padding: "0.85rem", fontSize: "1rem", fontWeight: 600,
                cursor: !selectedCropId ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              {loading ? "..." : t("Add to My Crops", "मेरी फसलों में जोड़ें")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
