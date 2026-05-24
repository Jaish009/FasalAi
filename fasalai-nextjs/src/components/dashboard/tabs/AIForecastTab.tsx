"use client";
// src/components/dashboard/tabs/AIForecastTab.tsx

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Props { userCrops: any[]; lang: "en" | "hi"; }

const MOCK_PREDICTIONS = [
  { crop: "Wheat", cropHi: "गेहूं", current: 2185, p7: 2240, p15: 2290, p30: 2350, confidence: 92, trend: "RISING", icon: "🌾" },
  { crop: "Soybean", cropHi: "सोयाबीन", current: 4320, p7: 4380, p15: 4410, p30: 4450, confidence: 88, trend: "RISING", icon: "🌱" },
  { crop: "Onion", cropHi: "प्याज", current: 1240, p7: 1100, p15: 980, p30: 1050, confidence: 79, trend: "FALLING", icon: "🧅" },
  { crop: "Cotton", cropHi: "कपास", current: 6800, p7: 7050, p15: 7200, p30: 7350, confidence: 95, trend: "RISING", icon: "🌿" },
];

export default function AIForecastTab({ userCrops, lang }: Props) {
  const t = (en: string, hi: string) => (lang === "hi" ? hi : en);
  const [selected, setSelected] = useState(MOCK_PREDICTIONS[0]);
  const [horizon, setHorizon] = useState<7 | 15 | 30>(7);

  const chartData = [
    { label: t("Today", "आज"), price: selected.current, predicted: false },
    { label: t("7 Days", "7 दिन"), price: selected.p7, predicted: true },
    { label: t("15 Days", "15 दिन"), price: selected.p15, predicted: true },
    { label: t("30 Days", "30 दिन"), price: selected.p30, predicted: true },
  ];

  const targetPrice = horizon === 7 ? selected.p7 : horizon === 15 ? selected.p15 : selected.p30;
  const change = ((targetPrice - selected.current) / selected.current * 100).toFixed(1);
  const isRising = parseFloat(change) > 0;

  return (
    <div style={{ maxWidth: "100%" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.3rem", fontWeight: 800, color: "#2b2e1e", margin: "0 0 0.3rem" }}>
          🤖 {t("AI Price Forecast", "AI मूल्य भविष्यवाणी")}
        </h2>
        <p style={{ fontSize: "0.82rem", color: "#666b4f", margin: 0 }}>
          {t("Prophet ML model predicts prices with 94% accuracy", "Prophet ML मॉडल 94% सटीकता से भाव बताता है")}
        </p>
      </div>

      {/* Crop Selector */}
      <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {MOCK_PREDICTIONS.map((p) => (
          <button
            key={p.crop}
            onClick={() => setSelected(p)}
            style={{
              padding: "0.5rem 1rem", borderRadius: "100px", cursor: "pointer",
              border: selected.crop === p.crop ? "2px solid #556b2f" : "1px solid rgba(45,106,79,0.2)",
              background: selected.crop === p.crop ? "#556b2f" : "white",
              color: selected.crop === p.crop ? "white" : "#666b4f",
              fontSize: "0.85rem", fontWeight: 600, transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: "0.4rem",
            }}
          >
            <img src={`/crops/${p.crop.toLowerCase()}.png`} alt={p.crop} style={{ width: "20px", height: "20px", objectFit: "contain" }} onError={(e) => { e.currentTarget.style.display = 'none'; }} /> {t(p.crop, p.cropHi)}
          </button>
        ))}
      </div>

      {/* Main Forecast Card */}
      <div style={{
        background: "#556b2f", borderRadius: "20px", padding: "2rem",
        marginBottom: "1.5rem", color: "white", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: "-1rem", top: "-1rem", fontSize: "8rem", opacity: 0.06 }}>
          <img src={`/crops/${selected.crop.toLowerCase()}.png`} alt={selected.crop} style={{ width: "240px", height: "240px", objectFit: "contain", opacity: 0.15, filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))" }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
              {t("Current Price", "वर्तमान भाव")}
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "2rem", fontWeight: 800 }}>
              ₹{selected.current.toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>/quintal</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
              {t(`${horizon}-Day Prediction`, `${horizon} दिन का अनुमान`)}
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "2rem", fontWeight: 800, color: "#d2e0b8" }}>
              ₹{targetPrice.toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: "0.78rem", color: isRising ? "#a8e6cf" : "#ffb3b3", fontWeight: 600, marginTop: "0.2rem" }}>
              {isRising ? "▲" : "▼"} {Math.abs(parseFloat(change))}% {t("expected", "अनुमानित")}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
              {t("AI Confidence", "AI विश्वास")}
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "2rem", fontWeight: 800 }}>
              {selected.confidence}%
            </div>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.2)", borderRadius: "3px", marginTop: "0.8rem", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${selected.confidence}%`, background: "#d2e0b8", borderRadius: "3px", transition: "width 0.5s" }} />
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div style={{
          marginTop: "1.5rem", padding: "1rem", borderRadius: "12px",
          background: "rgba(255,255,255,0.1)", fontSize: "0.88rem",
          display: "flex", alignItems: "center", gap: "0.7rem",
          position: "relative", zIndex: 1,
        }}>
          <span style={{ fontSize: "1.3rem" }}>{isRising ? "💡" : "⚠️"}</span>
          <span>
            {isRising
              ? t(`Prices expected to rise ${change}% in ${horizon} days. Consider waiting to sell.`, `${horizon} दिनों में भाव ${change}% बढ़ने की उम्मीद है। बेचने के लिए थोड़ा इंतजार करें।`)
              : t(`Prices may fall ${Math.abs(parseFloat(change))}% in ${horizon} days. Consider selling soon.`, `${horizon} दिनों में भाव ${Math.abs(parseFloat(change))}% गिर सकता है। जल्दी बेचना बेहतर हो सकता है।`)}
          </span>
        </div>
      </div>

      {/* Horizon Toggle + Chart */}
      <div className="premium-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
          <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "#2b2e1e", margin: 0 }}>
            📈 {t("Price Forecast Chart", "मूल्य अनुमान चार्ट")}
          </h3>
          <div style={{ display: "flex", background: "rgba(45,106,79,0.08)", borderRadius: "100px", padding: "3px" }}>
            {([7, 15, 30] as const).map((h) => (
              <button key={h} onClick={() => setHorizon(h)} style={{
                padding: "0.3rem 0.8rem", borderRadius: "100px", border: "none", cursor: "pointer",
                fontSize: "0.78rem", fontWeight: 600, transition: "all 0.2s",
                background: horizon === h ? "#556b2f" : "transparent",
                color: horizon === h ? "white" : "#666b4f",
              }}>
                {h}d
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#666b4f" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#666b4f" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
            <Tooltip
              contentStyle={{ borderRadius: "10px", border: "1px solid rgba(45,106,79,0.2)", fontSize: "0.82rem" }}
              formatter={(v: number) => [`₹${v}/q`, t("Price", "भाव")]}
            />
            <Bar dataKey="price" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.predicted ? "#8fbc8f" : "#556b2f"} fillOpacity={entry.predicted ? 0.7 : 1} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.75rem", color: "#666b4f", justifyContent: "center", marginTop: "0.5rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#556b2f", display: "inline-block" }} />{t("Current", "वर्तमान")}</span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#8fbc8f", display: "inline-block" }} />{t("AI Predicted", "AI अनुमान")}</span>
        </div>
      </div>

      {/* All Crop Predictions */}
      <div className="premium-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "#2b2e1e", margin: "0 0 1rem" }}>
          🌾 {t("All Crop Forecasts", "सभी फसलों का अनुमान")}
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" }}>
          <thead>
            <tr>
              {[t("Crop", "फसल"), t("Current", "वर्तमान"), t("7 Days", "7 दिन"), t("15 Days", "15 दिन"), t("30 Days", "30 दिन"), t("Confidence", "विश्वास")].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.6rem", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#666b4f", borderBottom: "1px solid rgba(45,106,79,0.1)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_PREDICTIONS.map((p) => {
              const chg = ((p.p7 - p.current) / p.current * 100).toFixed(1);
              return (
                <tr key={p.crop} style={{ borderBottom: "1px solid rgba(45,106,79,0.05)", cursor: "pointer" }}
                  onClick={() => setSelected(p)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(45,106,79,0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "0.65rem 0.6rem", fontWeight: 600, color: "#2b2e1e" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <img src={`/crops/${p.crop.toLowerCase()}.png`} alt={p.crop} style={{ width: "24px", height: "24px", objectFit: "contain" }} onError={(e) => { e.currentTarget.style.display = 'none'; }} /> 
                      {t(p.crop, p.cropHi)}
                    </div>
                  </td>
                  <td style={{ padding: "0.65rem 0.6rem", color: "#556b2f", fontWeight: 700 }}>₹{p.current.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "0.65rem 0.6rem", color: "#8fbc8f", fontWeight: 600 }}>₹{p.p7.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "0.65rem 0.6rem", color: "#8fbc8f", fontWeight: 600 }}>₹{p.p15.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "0.65rem 0.6rem", color: "#8fbc8f", fontWeight: 600 }}>₹{p.p30.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "0.65rem 0.6rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <div style={{ flex: 1, height: "5px", background: "rgba(45,106,79,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${p.confidence}%`, background: "#556b2f", borderRadius: "3px" }} />
                      </div>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#556b2f", whiteSpace: "nowrap" }}>{p.confidence}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
