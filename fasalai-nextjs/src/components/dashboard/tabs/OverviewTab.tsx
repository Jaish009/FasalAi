"use client";
// src/components/dashboard/tabs/OverviewTab.tsx

import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import type { Tab } from "../DashboardClient";
import type { PriceRecord } from "@/types";

interface Props {
  user: any;
  latestPrices: PriceRecord[];
  lang: "en" | "hi";
  setActiveTab: (tab: Tab) => void;
}

const STAT_CARDS = [
  { icon: "🌾", labelEn: "Crops Tracked", labelHi: "फसलें ट्रैक", key: "crops", color: "#2d6a4f" },
  { icon: "🔔", labelEn: "Active Alerts", labelHi: "सक्रिय अलर्ट", key: "alerts", color: "#f4a261" },
  { icon: "📊", labelEn: "Prices Today", labelHi: "आज के भाव", key: "prices", color: "#40916c" },
  { icon: "🤖", labelEn: "AI Accuracy", labelHi: "AI सटीकता", key: "accuracy", color: "#52b788" },
];

// Generate mock chart data for 30 days
function generateChartData(basePrice: number) {
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const variation = (Math.random() - 0.4) * 80;
    return {
      date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      price: Math.round(basePrice + variation * (i / 10)),
      predicted: i >= 25 ? Math.round(basePrice + variation * 1.1) : null,
    };
  });
}

export default function OverviewTab({ user, latestPrices, lang, setActiveTab }: Props) {
  const t = (en: string, hi: string) => (lang === "hi" ? hi : en);
  const [selectedCrop, setSelectedCrop] = useState<string>("Wheat");
  const [chartData, setChartData] = useState(() => generateChartData(2185));

  useEffect(() => {
    const prices: Record<string, number> = {
      Wheat: 2185, Soybean: 4320, Onion: 1240,
      Cotton: 6800, Maize: 1890, Paddy: 2040,
    };
    setChartData(generateChartData(prices[selectedCrop] || 2000));
  }, [selectedCrop]);

  const stats = {
    crops: user.crops.length || 4,
    alerts: user.alerts.length || 2,
    prices: latestPrices.length || 18,
    accuracy: "94%",
  };

  const topPrices = [
    { crop: "Wheat", cropHi: "गेहूं", mandi: "Indore", price: 2185, change: 2.3, trend: "up" },
    { crop: "Soybean", cropHi: "सोयाबीन", mandi: "Ujjain", price: 4320, change: 0.6, trend: "up" },
    { crop: "Onion", cropHi: "प्याज", mandi: "Dewas", price: 1240, change: -3.2, trend: "down" },
    { crop: "Cotton", cropHi: "कपास", mandi: "Khargone", price: 6800, change: 1.8, trend: "up" },
    { crop: "Maize", cropHi: "मक्का", mandi: "Bhopal", price: 1890, change: -0.8, trend: "down" },
  ];

  return (
    <div style={{ maxWidth: "100%" }}>
      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {STAT_CARDS.map((card) => (
          <div
            key={card.key}
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "1.2rem",
              boxShadow: "0 4px 16px rgba(45,106,79,0.08)",
              border: "1px solid rgba(45,106,79,0.07)",
            }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{card.icon}</div>
            <div
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: "1.8rem",
                fontWeight: 800,
                color: card.color,
              }}
            >
              {stats[card.key as keyof typeof stats]}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#4a6741", marginTop: "0.2rem", fontWeight: 500 }}>
              {t(card.labelEn, card.labelHi)}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "1.5rem",
          boxShadow: "0 4px 16px rgba(45,106,79,0.08)",
          border: "1px solid rgba(45,106,79,0.07)",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1rem", fontWeight: 700, color: "#1b2d1e", margin: 0 }}>
            📈 {t("Price Trend — Last 30 Days", "मूल्य प्रवृत्ति — पिछले 30 दिन")}
          </h2>
          {/* Crop selector */}
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: "8px",
              border: "1px solid rgba(45,106,79,0.2)",
              background: "white",
              color: "#2d6a4f",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {["Wheat", "Soybean", "Onion", "Cotton", "Maize", "Paddy"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,106,79,0.08)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#4a6741" }} tickLine={false} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: "#4a6741" }} tickLine={false} axisLine={false}
              tickFormatter={(v) => `₹${v}`} />
            <Tooltip
              contentStyle={{ borderRadius: "10px", border: "1px solid rgba(45,106,79,0.2)", fontSize: "0.82rem" }}
              formatter={(v: number) => [`₹${v}/q`, t("Price", "भाव")]}
            />
            <Area type="monotone" dataKey="price" stroke="#2d6a4f" strokeWidth={2.5}
              fill="url(#priceGrad)" dot={false} activeDot={{ r: 5, fill: "#2d6a4f" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Price Table */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "1.5rem",
          boxShadow: "0 4px 16px rgba(45,106,79,0.08)",
          border: "1px solid rgba(45,106,79,0.07)",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1rem", fontWeight: 700, color: "#1b2d1e", margin: 0 }}>
            🏪 {t("Top Mandi Prices Today", "आज के शीर्ष मंडी भाव")}
          </h2>
          <span style={{ fontSize: "0.75rem", color: "#4a6741" }}>
            🟢 {t("Live", "लाइव")}
          </span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr>
              {[t("Crop", "फसल"), t("Mandi", "मंडी"), t("Price", "भाव"), t("Change", "बदलाव"), t("Forecast (7d)", "अनुमान (7दिन)")].map((h) => (
                <th key={h} style={{
                  textAlign: "left", padding: "0.5rem 0.8rem",
                  fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.05em", color: "#4a6741",
                  borderBottom: "1px solid rgba(45,106,79,0.1)",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topPrices.map((row) => (
              <tr key={row.crop} style={{ borderBottom: "1px solid rgba(45,106,79,0.05)", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(45,106,79,0.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "0.7rem 0.8rem", color: "#1b2d1e", fontWeight: 500 }}>
                  {t(row.crop, row.cropHi)}
                </td>
                <td style={{ padding: "0.7rem 0.8rem", color: "#4a6741" }}>{row.mandi}</td>
                <td style={{ padding: "0.7rem 0.8rem", fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#2d6a4f" }}>
                  ₹{row.price.toLocaleString("en-IN")}/q
                </td>
                <td style={{ padding: "0.7rem 0.8rem" }}>
                  <span style={{
                    display: "inline-block", padding: "0.2rem 0.6rem",
                    borderRadius: "100px", fontSize: "0.72rem", fontWeight: 600,
                    background: row.trend === "up" ? "rgba(45,106,79,0.1)" : "rgba(230,57,70,0.1)",
                    color: row.trend === "up" ? "#2d6a4f" : "#e63946",
                  }}>
                    {row.trend === "up" ? "▲" : "▼"} {Math.abs(row.change)}%
                  </span>
                </td>
                <td style={{ padding: "0.7rem 0.8rem", color: "#4a6741", fontSize: "0.82rem" }}>
                  ₹{Math.round(row.price * (row.trend === "up" ? 1.025 : 0.975)).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {[
          { icon: "🌾", titleEn: "Add a Crop", titleHi: "फसल जोड़ें", descEn: "Track prices for a new crop", descHi: "नई फसल के भाव ट्रैक करें", tab: "my-crops" as Tab, color: "#2d6a4f" },
          { icon: "🔔", titleEn: "Set Price Alert", titleHi: "भाव अलर्ट लगाएं", descEn: "Get notified when price is right", descHi: "सही दाम पर सूचना पाएं", tab: "alerts" as Tab, color: "#f4a261" },
        ].map((action) => (
          <button
            key={action.tab}
            onClick={() => setActiveTab(action.tab)}
            style={{
              background: "white",
              border: `2px solid ${action.color}20`,
              borderRadius: "16px",
              padding: "1.3rem",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
              boxShadow: "0 4px 16px rgba(45,106,79,0.06)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = action.color;
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = `${action.color}20`;
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            <div style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>{action.icon}</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#1b2d1e", marginBottom: "0.3rem" }}>
              {t(action.titleEn, action.titleHi)}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#4a6741" }}>
              {t(action.descEn, action.descHi)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
