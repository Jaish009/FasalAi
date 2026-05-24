"use client";
// src/components/dashboard/tabs/MyCropsTab.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Crop, Mandi } from "@/types";

interface Props {
  user: any;
  allCrops: Crop[];
  allMandis: Mandi[];
  lang: "en" | "hi";
}

export default function MyCropsTab({ user, allCrops, allMandis, lang }: Props) {
  const t = (en: string, hi: string) => (lang === "hi" ? hi : en);
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [detailsCrop, setDetailsCrop] = useState<any>(null);
  const [selectedCropId, setSelectedCropId] = useState("");
  const [selectedMandiId, setSelectedMandiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Crops");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Mock Field Data for the new UI aesthetic
  const MOCK_FIELD_DATA: Record<string, any> = {
    "crop-wheat": { location: "Wheat - Sharbati", area: "42 Ha", planted: "Nov 15, 2023", harvest: "Mar 25, 2024", progress: 85, statusText: "85% to harvest" },
    "crop-soybean": { location: "Field A, Punjab", area: "42 Ha", planted: "Nov 15, 2023", harvest: "Mar 25, 2024", progress: 85, statusText: "85% to harvest" },
    "crop-cotton": { location: "Field B, Blooming", area: "42 Ha", planted: "Mar 25, 2024", harvest: "Healthy, active", progress: 85, statusText: "85% to harvest", isGreenStatus: true },
    "crop-maize": { location: "Field A, Punjab", area: "42 Ha", planted: "Mar 25, 2024", harvest: "Healthy, active", progress: 85, statusText: "85% to harvest", isGreenStatus: true },
    "crop-onion": { location: "Sector 4, Nashik", area: "12 Ha", planted: "Jan 10, 2024", harvest: "May 20, 2024", progress: 40, statusText: "40% to harvest" },
  };

  const displayCrops = user.crops.length > 0
    ? user.crops
    : [
        { crop: { id: "crop-wheat", name: "Wheat", nameHindi: "गेहूं", category: "GRAIN", season: ["RABI"] } },
        { crop: { id: "crop-soybean", name: "Soybean", nameHindi: "सोयाबीन", category: "OILSEED", season: ["KHARIF"] } },
        { crop: { id: "crop-cotton", name: "Cotton", nameHindi: "कपास", category: "FIBER", season: ["KHARIF"] } },
        { crop: { id: "crop-maize", name: "Maize", nameHindi: "मक्का", category: "GRAIN", season: ["KHARIF", "RABI"] } },
      ];

  const handleAddCrop = async () => {
    if (!selectedCropId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/crops/my", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropId: selectedCropId, mandiId: selectedMandiId }),
      });
      if (!res.ok) {
        alert("Failed to add crop. Error: " + await res.text());
        return;
      }
      setShowModal(false);
      setSelectedCropId("");
      setSelectedMandiId("");
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCrop = async (userCropId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/crops/my?id=${userCropId}`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCropsList = allCrops.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nameHindi.includes(search)
  );

  const renderCropCard = (uc: any, key: React.Key) => {
    const fieldData = MOCK_FIELD_DATA[uc.crop.id] || { 
      location: `Field C (${t(uc.crop.name, uc.crop.nameHindi)})`,
      area: "10 Ha", planted: "Recent", harvest: "Upcoming", progress: 10, statusText: "Just planted" 
    };

    return (
      <div
        key={key}
        style={{ 
          background: "#fdfbf7", border: "1px solid rgba(85,107,47,0.1)", borderRadius: "20px", 
          padding: "1.5rem", boxShadow: "0 8px 32px rgba(85,107,47,0.06)",
          display: "flex", flexDirection: "column", gap: "1.5rem",
          transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.6rem", fontWeight: 700, color: "#1b2d1e" }}>
            {t(uc.crop.name, uc.crop.nameHindi)}
          </div>
          <div style={{ position: "relative" }}>
            <button 
              onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === (uc.id || uc.crop.id) ? null : (uc.id || uc.crop.id)); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#666b4f", fontSize: "1.2rem", padding: "0.2rem" }}
            >
              •••
            </button>
            {menuOpenId === (uc.id || uc.crop.id) && (
              <>
                <div 
                  style={{ position: "fixed", inset: 0, zIndex: 9 }} 
                  onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); }} 
                />
                <div style={{ position: "absolute", top: "100%", right: 0, background: "white", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", padding: "0.5rem", zIndex: 10, minWidth: "120px" }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); setDetailsCrop({ ...uc, fieldData }); }}
                    style={{ width: "100%", textAlign: "left", padding: "0.5rem 1rem", border: "none", background: "none", cursor: "pointer", fontSize: "0.85rem", color: "#2b2e1e", borderRadius: "4px" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f0f0f0"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                  >
                    {t("View Details", "विवरण देखें")}
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setMenuOpenId(null);
                      if (uc.id) {
                        if (confirm(t("Are you sure you want to remove this crop?", "क्या आप वाकई इस फसल को हटाना चाहते हैं?"))) {
                          handleRemoveCrop(uc.id, e);
                        }
                      } else {
                        alert(t("This is a default crop and cannot be removed.", "यह एक डिफ़ॉल्ट फसल है और इसे हटाया नहीं जा सकता।"));
                      }
                    }}
                    style={{ width: "100%", textAlign: "left", padding: "0.5rem 1rem", border: "none", background: "none", cursor: "pointer", fontSize: "0.85rem", color: "#e63946", borderRadius: "4px" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#fdf0f0"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                  >
                    {t("Remove Crop", "फसल हटाएं")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <img 
              src={`/crops/${uc.crop.name.toLowerCase()}.png`} alt={uc.crop.name} 
              style={{ width: "100%", maxWidth: "140px", objectFit: "contain", filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.15))" }} 
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", fontSize: "0.8rem", color: "#2b2e1e" }}>
            <div><div style={{ color: "#666b4f", marginBottom: "0.1rem" }}>Crop Name</div><div style={{ fontWeight: 600 }}>{fieldData.location}</div></div>
            <div><div style={{ color: "#666b4f", marginBottom: "0.1rem" }}>Area</div><div style={{ fontWeight: 600 }}>{fieldData.area}</div></div>
            <div><div style={{ color: "#666b4f", marginBottom: "0.1rem" }}>Planting Date</div><div style={{ fontWeight: 600 }}>{fieldData.planted}</div></div>
            <div><div style={{ color: "#666b4f", marginBottom: "0.1rem" }}>Harvest Date</div><div style={{ fontWeight: 600, color: fieldData.isGreenStatus ? "#556b2f" : "#2b2e1e" }}>{fieldData.harvest}</div></div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ flex: 1, paddingRight: "2rem" }}>
            <div style={{ fontSize: "0.8rem", color: "#2b2e1e", marginBottom: "0.4rem" }}>
              Status <br/><span style={{ fontWeight: 600 }}>{fieldData.statusText}</span>
            </div>
            <div style={{ height: "6px", background: "rgba(85,107,47,0.15)", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${fieldData.progress}%`, background: "#6b8e23", borderRadius: "10px" }} />
            </div>
          </div>
          <button 
            onClick={() => setDetailsCrop({ ...uc, fieldData })}
            style={{ background: "#6b8e23", color: "white", border: "none", borderRadius: "100px", padding: "0.6rem 1.2rem", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(107,142,35,0.3)" }}
          >
            View Details
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "100%", fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "#1b2d1e", margin: 0 }}>
          {t("My Crops Overview", "मेरी फसलें सिंहावलोकन")}
        </h2>
        <div style={{ fontSize: "0.85rem", color: "#4a6741", marginTop: "0.5rem", fontWeight: 500, display: "flex", gap: "1rem" }}>
          <span>{t("Total Crops: ", "कुल फसलें: ")}<strong style={{ color: "#1b2d1e" }}>{displayCrops.length}</strong></span>
          <span style={{ color: "#d2e0b8" }}>|</span>
          <span>{t("Active Fields: ", "सक्रिय खेत: ")}<strong style={{ color: "#1b2d1e" }}>12</strong></span>
          <span style={{ color: "#d2e0b8" }}>|</span>
          <span>{t("Area: ", "क्षेत्र: ")}<strong style={{ color: "#1b2d1e" }}>145 Hectares</strong></span>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {["All Crops", "Fields", "Seasons"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "0.45rem 1.2rem", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                background: filter === f ? "#6b8e23" : "transparent",
                color: filter === f ? "white" : "#4a6741",
                border: filter === f ? "1px solid #6b8e23" : "1px solid rgba(45,106,79,0.2)",
              }}
            >
              {f}
            </button>
          ))}
        </div>
        
        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#6b8e23" }}>🔍</span>
            <input
              type="text"
              placeholder={t("Search", "खोजें")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "0.5rem 1rem 0.5rem 2.2rem", borderRadius: "8px", border: "1px solid rgba(45,106,79,0.2)",
                outline: "none", fontSize: "0.85rem", background: "white", minWidth: "220px"
              }}
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: "#556b2f", color: "white", border: "none", borderRadius: "8px",
              padding: "0.55rem 1.2rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "0.4rem", boxShadow: "0 4px 12px rgba(85,107,47,0.2)", transition: "all 0.2s",
            }}
          >
            + {t("Add", "जोड़ें")}
          </button>
        </div>
      </div>

      {/* Dynamic Content based on Filter */}
      <div style={{ marginBottom: "2rem" }}>
        {filter === "All Crops" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
            {displayCrops.map((uc: any, i: number) => renderCropCard(uc, i))}
          </div>
        )}

        {filter === "Fields" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {Object.entries(
              displayCrops.reduce((acc: Record<string, any[]>, uc: any) => {
                const fieldData = MOCK_FIELD_DATA[uc.crop.id] || { location: `Field - ${t(uc.crop.name, uc.crop.nameHindi)}` };
                const loc = fieldData.location;
                if (!acc[loc]) acc[loc] = [];
                acc[loc].push(uc);
                return acc;
              }, {})
            ).map(([location, crops]: [string, any]) => (
              <div key={location}>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.2rem", color: "#666b4f", marginBottom: "1rem", borderBottom: "1px solid rgba(85,107,47,0.1)", paddingBottom: "0.5rem" }}>
                  📍 {location}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
                  {crops.map((uc: any, i: number) => renderCropCard(uc, `${location}-${i}`))}
                </div>
              </div>
            ))}
          </div>
        )}

        {filter === "Seasons" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {["KHARIF", "RABI", "ZAID"].map((season) => {
              const seasonCrops = displayCrops.filter((uc: any) => uc.crop.season?.includes(season));
              if (seasonCrops.length === 0) return null;
              
              const seasonTitles: any = {
                "KHARIF": "Kharif Season (Monsoon)",
                "RABI": "Rabi Season (Winter)",
                "ZAID": "Zaid Season (Summer)",
              };

              return (
                <div key={season}>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.2rem", color: "#666b4f", marginBottom: "1rem", borderBottom: "1px solid rgba(85,107,47,0.1)", paddingBottom: "0.5rem" }}>
                    🌦️ {seasonTitles[season]}
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
                    {seasonCrops.map((uc: any, i: number) => renderCropCard(uc, `${season}-${i}`))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Crop Modal */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div style={{ background: "white", borderRadius: "20px", padding: "2rem", width: "100%", maxWidth: "480px", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, color: "#2b2e1e", margin: 0, fontSize: "1.2rem" }}>
                🌾 {t("Add a Crop", "फसल जोड़ें")}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "#666b4f" }}>✕</button>
            </div>

            <input
              type="text"
              placeholder={t("Search crops...", "फसल खोजें...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "0.7rem 1rem", borderRadius: "10px", border: "1px solid rgba(45,106,79,0.2)", fontSize: "0.9rem", marginBottom: "1rem", outline: "none", color: "#2b2e1e" }}
            />

            <div style={{ maxHeight: "220px", overflowY: "auto", marginBottom: "1rem" }}>
              {filteredCropsList.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => setSelectedCropId(crop.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.7rem", borderRadius: "10px",
                    border: selectedCropId === crop.id ? "2px solid #556b2f" : "1px solid rgba(45,106,79,0.1)",
                    background: selectedCropId === crop.id ? "rgba(85,107,47,0.06)" : "transparent",
                    cursor: "pointer", marginBottom: "0.3rem", textAlign: "left", transition: "all 0.15s",
                  }}
                >
                  <img src={`/crops/${crop.name.toLowerCase()}.png`} style={{ width: "32px", height: "32px", objectFit: "contain" }} onError={(e) => e.currentTarget.style.display = 'none'} />
                  <div>
                    <div style={{ fontWeight: 600, color: "#2b2e1e", fontSize: "0.9rem" }}>{crop.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "#666b4f" }}>{crop.nameHindi} · {crop.category}</div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#666b4f", display: "block", marginBottom: "0.4rem" }}>
                {t("Select Mandi (optional)", "मंडी चुनें (वैकल्पिक)")}
              </label>
              <select
                value={selectedMandiId}
                onChange={(e) => setSelectedMandiId(e.target.value)}
                style={{ width: "100%", padding: "0.7rem 1rem", borderRadius: "10px", border: "1px solid rgba(45,106,79,0.2)", fontSize: "0.9rem", color: "#2b2e1e" }}
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
                width: "100%", background: !selectedCropId ? "#ccc" : "#556b2f",
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

      {/* Crop Details Modal */}
      {detailsCrop && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={(e) => e.target === e.currentTarget && setDetailsCrop(null)}
        >
          <div style={{ background: "#fdfbf7", borderRadius: "24px", width: "100%", maxWidth: "600px", boxShadow: "0 32px 84px rgba(0,0,0,0.3)", overflow: "hidden" }}>
            {/* Modal Header/Hero */}
            <div style={{ background: "linear-gradient(135deg, rgba(139,168,74,0.2) 0%, rgba(85,107,47,0.05) 100%)", padding: "2.5rem 2rem", position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "#556b2f", fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.5rem", letterSpacing: "1px", textTransform: "uppercase" }}>{detailsCrop.fieldData.location}</div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "2.5rem", fontWeight: 800, color: "#1b2d1e", margin: 0 }}>
                  {t(detailsCrop.crop.name, detailsCrop.crop.nameHindi)}
                </h2>
              </div>
              <img 
                src={`/crops/${detailsCrop.crop.name.toLowerCase()}.png`} 
                alt={detailsCrop.crop.name} 
                style={{ width: "120px", height: "120px", objectFit: "contain", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.2))", transform: "scale(1.2) rotate(-5deg)" }} 
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <button onClick={() => setDetailsCrop(null)} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "white", border: "none", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", fontSize: "1.2rem", color: "#666b4f", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>✕</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "2rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
                <div style={{ background: "white", padding: "1.2rem", borderRadius: "16px", border: "1px solid rgba(85,107,47,0.1)" }}>
                  <div style={{ fontSize: "0.85rem", color: "#666b4f", marginBottom: "0.3rem" }}>💧 Soil Moisture</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1b2d1e" }}>42% (Optimal)</div>
                </div>
                <div style={{ background: "white", padding: "1.2rem", borderRadius: "16px", border: "1px solid rgba(85,107,47,0.1)" }}>
                  <div style={{ fontSize: "0.85rem", color: "#666b4f", marginBottom: "0.3rem" }}>🌡️ Temperature</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1b2d1e" }}>28°C</div>
                </div>
                <div style={{ background: "white", padding: "1.2rem", borderRadius: "16px", border: "1px solid rgba(85,107,47,0.1)" }}>
                  <div style={{ fontSize: "0.85rem", color: "#666b4f", marginBottom: "0.3rem" }}>🦠 Disease Risk</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#2b2e1e" }}>Low (5%)</div>
                </div>
                <div style={{ background: "white", padding: "1.2rem", borderRadius: "16px", border: "1px solid rgba(85,107,47,0.1)" }}>
                  <div style={{ fontSize: "0.85rem", color: "#666b4f", marginBottom: "0.3rem" }}>📅 Next Irrigation</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1b2d1e" }}>In 3 Days</div>
                </div>
              </div>

              <button style={{ width: "100%", background: "#1b2d1e", color: "white", border: "none", borderRadius: "12px", padding: "1rem", fontSize: "1rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                Generate AI Insights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
