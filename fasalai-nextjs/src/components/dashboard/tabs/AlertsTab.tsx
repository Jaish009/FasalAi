"use client";
// src/components/dashboard/tabs/AlertsTab.tsx

import { useState } from "react";
import type { Crop, Mandi } from "@/types";

interface Props {
  user: any;
  allCrops: Crop[];
  allMandis: Mandi[];
  lang: "en" | "hi";
}

export default function AlertsTab({ user, allCrops, allMandis, lang }: Props) {
  const t = (en: string, hi: string) => (lang === "hi" ? hi : en);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    cropId: "", mandiId: "", targetPrice: "",
    condition: "ABOVE" as "ABOVE" | "BELOW",
    channels: ["SMS"] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Mock alerts if user has none
  const displayAlerts = user.alerts.length > 0 ? user.alerts : [
    {
      id: "alert-1",
      crop: { name: "Wheat", nameHindi: "गेहूं", category: "GRAIN" },
      targetPrice: 2200,
      condition: "ABOVE",
      channels: ["SMS", "WHATSAPP"],
      isActive: true,
      triggered: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "alert-2",
      crop: { name: "Onion", nameHindi: "प्याज", category: "VEGETABLE" },
      targetPrice: 1500,
      condition: "ABOVE",
      channels: ["EMAIL"],
      isActive: true,
      triggered: true,
      triggeredPrice: 1520,
      triggeredAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  const CHANNEL_ICONS: Record<string, string> = { SMS: "📱", WHATSAPP: "💬", EMAIL: "📧" };

  const handleSubmit = async () => {
    if (!form.cropId || !form.targetPrice) return;
    setLoading(true);
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropId: form.cropId,
          mandiId: form.mandiId || undefined,
          targetPrice: parseFloat(form.targetPrice),
          condition: form.condition,
          channels: form.channels,
        }),
      });
      setShowModal(false);
      setForm({ cropId: "", mandiId: "", targetPrice: "", condition: "ABOVE", channels: ["SMS"] });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    try {
      await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteId(null);
    }
  };

  const toggleChannel = (ch: string) => {
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(ch) ? f.channels.filter((c) => c !== ch) : [...f.channels, ch],
    }));
  };

  return (
    <div style={{ maxWidth: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.3rem", fontWeight: 800, color: "#2b2e1e", margin: 0 }}>
            🔔 {t("Price Alerts", "भाव अलर्ट")}
          </h2>
          <p style={{ fontSize: "0.82rem", color: "#666b4f", margin: "0.3rem 0 0" }}>
            {t("Get notified when your target price is hit", "लक्ष्य भाव पर तुरंत सूचना पाएं")}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: "#556b2f", color: "white",
            border: "none", borderRadius: "100px",
            padding: "0.6rem 1.3rem", cursor: "pointer",
            fontSize: "0.85rem", fontWeight: 600,
            boxShadow: "0 4px 16px rgba(45,106,79,0.3)",
          }}
        >
          + {t("New Alert", "नया अलर्ट")}
        </button>
      </div>

      {/* Info Banner */}
      <div style={{
        background: "rgba(45,106,79,0.06)", border: "1px solid rgba(45,106,79,0.15)",
        borderRadius: "12px", padding: "1rem 1.2rem",
        marginBottom: "1.5rem", fontSize: "0.82rem", color: "#556b2f",
        display: "flex", alignItems: "center", gap: "0.6rem",
      }}>
        💡 {t(
          "Set alerts and we'll notify you via SMS, WhatsApp, or Email when the market hits your price.",
          "अलर्ट सेट करें और जब बाजार आपके भाव पर पहुंचे तो SMS, WhatsApp या Email से सूचना पाएं।"
        )}
      </div>

      {/* Alerts List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {displayAlerts.map((alert: any) => (
          <div
            key={alert.id}
            className="premium-card"
            style={{
              padding: "1.3rem 1.5rem",
              border: alert.triggered ? "2px solid rgba(82,183,136,0.5)" : undefined,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {/* Status dot */}
              <div style={{
                width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0,
                background: alert.triggered ? "#8fbc8f" : alert.isActive ? "#f4a261" : "#ccc",
                boxShadow: alert.isActive && !alert.triggered ? "0 0 0 3px rgba(244,162,97,0.2)" : "none",
              }} />

              <div>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#2b2e1e", fontSize: "1rem" }}>
                  {t(alert.crop.name, alert.crop.nameHindi)}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#666b4f", marginTop: "0.2rem" }}>
                  {alert.condition === "ABOVE" ? "📈" : "📉"}{" "}
                  {t(
                    `Notify when price goes ${alert.condition.toLowerCase()} ₹${alert.targetPrice}/q`,
                    `जब भाव ₹${alert.targetPrice}/क्विंटल से ${alert.condition === "ABOVE" ? "ऊपर" : "नीचे"} जाए`
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.5rem" }}>
                  {alert.channels.map((ch: string) => (
                    <span key={ch} style={{
                      display: "inline-flex", alignItems: "center", gap: "0.2rem",
                      padding: "0.15rem 0.5rem", borderRadius: "100px",
                      background: "rgba(45,106,79,0.08)", fontSize: "0.7rem", color: "#556b2f", fontWeight: 600,
                    }}>
                      {CHANNEL_ICONS[ch]} {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {/* Target price */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#556b2f" }}>
                  ₹{alert.targetPrice.toLocaleString("en-IN")}
                </div>
                <div style={{ fontSize: "0.7rem", color: "#666b4f" }}>
                  {alert.triggered
                    ? `✅ ${t("Triggered", "ट्रिगर हो गया")}`
                    : `⏳ ${t("Watching", "निगरानी में")}`}
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDelete(alert.id)}
                disabled={deleteId === alert.id}
                style={{
                  background: "rgba(230,57,70,0.08)", border: "none", borderRadius: "10px",
                  padding: "0.5rem 0.7rem", cursor: "pointer", color: "#e63946", fontSize: "0.85rem",
                  transition: "all 0.2s",
                }}
              >
                {deleteId === alert.id ? "..." : "🗑"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Alert Modal */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div style={{ background: "white", borderRadius: "20px", padding: "2rem", width: "100%", maxWidth: "460px", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, color: "#2b2e1e", margin: 0 }}>
                🔔 {t("Create Price Alert", "भाव अलर्ट बनाएं")}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "#666b4f" }}>✕</button>
            </div>

            {/* Crop */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>{t("Crop", "फसल")} *</label>
              <select value={form.cropId} onChange={(e) => setForm((f) => ({ ...f, cropId: e.target.value }))} style={selectStyle}>
                <option value="">{t("Select crop", "फसल चुनें")}</option>
                {allCrops.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.nameHindi})</option>)}
              </select>
            </div>

            {/* Mandi */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>{t("Mandi (optional)", "मंडी (वैकल्पिक)")}</label>
              <select value={form.mandiId} onChange={(e) => setForm((f) => ({ ...f, mandiId: e.target.value }))} style={selectStyle}>
                <option value="">{t("Any mandi", "कोई भी मंडी")}</option>
                {allMandis.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            {/* Condition + Price */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "1rem" }}>
              <div>
                <label style={labelStyle}>{t("Condition", "शर्त")} *</label>
                <select value={form.condition} onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value as any }))} style={selectStyle}>
                  <option value="ABOVE">📈 {t("Price goes above", "भाव ऊपर जाए")}</option>
                  <option value="BELOW">📉 {t("Price falls below", "भाव नीचे जाए")}</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{t("Target Price (₹/q)", "लक्ष्य भाव (₹/क्विंटल)")} *</label>
                <input
                  type="number" placeholder="e.g. 2200" value={form.targetPrice}
                  onChange={(e) => setForm((f) => ({ ...f, targetPrice: e.target.value }))}
                  style={{ ...selectStyle, fontFamily: "Syne, sans-serif", fontWeight: 700 }}
                />
              </div>
            </div>

            {/* Channels */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>{t("Notify via", "सूचना कैसे पाएं")} *</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {["SMS", "WHATSAPP", "EMAIL"].map((ch) => (
                  <button
                    key={ch}
                    onClick={() => toggleChannel(ch)}
                    style={{
                      flex: 1, padding: "0.6rem", borderRadius: "10px", cursor: "pointer",
                      border: form.channels.includes(ch) ? "2px solid #556b2f" : "1px solid rgba(45,106,79,0.2)",
                      background: form.channels.includes(ch) ? "rgba(45,106,79,0.08)" : "transparent",
                      color: form.channels.includes(ch) ? "#556b2f" : "#666b4f",
                      fontSize: "0.75rem", fontWeight: 600, transition: "all 0.15s",
                    }}
                  >
                    {CHANNEL_ICONS[ch]}<br />{ch}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!form.cropId || !form.targetPrice || form.channels.length === 0 || loading}
              style={{
                width: "100%", padding: "0.85rem", borderRadius: "100px",
                border: "none", cursor: "pointer", fontSize: "1rem", fontWeight: 600,
                background: !form.cropId || !form.targetPrice ? "#ccc" : "#556b2f",
                color: "white", transition: "all 0.2s",
              }}
            >
              {loading ? "..." : t("Create Alert", "अलर्ट बनाएं")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.78rem", fontWeight: 600,
  color: "#666b4f", marginBottom: "0.4rem",
};

const selectStyle: React.CSSProperties = {
  width: "100%", padding: "0.65rem 0.9rem",
  borderRadius: "10px", border: "1px solid rgba(45,106,79,0.2)",
  fontSize: "0.88rem", color: "#2b2e1e", outline: "none",
  background: "white",
};
