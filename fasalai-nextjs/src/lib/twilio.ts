// src/lib/twilio.ts
// Twilio SMS & WhatsApp Notification Service

import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM_PHONE = process.env.TWILIO_PHONE_NUMBER!;
const FROM_WHATSAPP = process.env.TWILIO_WHATSAPP_NUMBER!;

// ── Send SMS ──
export async function sendAlertSMS(to: string, message: string): Promise<boolean> {
  try {
    const isWhatsApp = to.startsWith("whatsapp:");
    await client.messages.create({
      body: message,
      from: isWhatsApp ? FROM_WHATSAPP : FROM_PHONE,
      to,
    });
    return true;
  } catch (error) {
    console.error("Twilio SMS error:", error);
    return false;
  }
}

// ── Send price alert SMS ──
export async function sendPriceAlertSMS({
  phone,
  cropName,
  cropNameHindi,
  currentPrice,
  targetPrice,
  mandiName,
  condition,
}: {
  phone: string;
  cropName: string;
  cropNameHindi: string;
  currentPrice: number;
  targetPrice: number;
  mandiName: string;
  condition: "ABOVE" | "BELOW";
}): Promise<boolean> {
  const arrow = condition === "ABOVE" ? "▲" : "▼";
  const message =
    `🌾 FasalAI Alert!\n` +
    `${cropName} (${cropNameHindi}) - ${mandiName}\n` +
    `Current: ₹${currentPrice}/q ${arrow}\n` +
    `Your Target: ₹${targetPrice}/q\n` +
    `Now is a good time to sell!\n` +
    `Track more at fasalai.in`;

  return sendAlertSMS(phone, message);
}

// ── Send WhatsApp alert ──
export async function sendWhatsAppAlert({
  phone,
  cropName,
  cropNameHindi,
  currentPrice,
  targetPrice,
  mandiName,
}: {
  phone: string;
  cropName: string;
  cropNameHindi: string;
  currentPrice: number;
  targetPrice: number;
  mandiName: string;
}): Promise<boolean> {
  const message =
    `🌾 *FasalAI मूल्य अलर्ट*\n\n` +
    `*${cropName} (${cropNameHindi})*\n` +
    `📍 ${mandiName}\n` +
    `💰 वर्तमान भाव: *₹${currentPrice}/क्विंटल*\n` +
    `🎯 आपका लक्ष्य: ₹${targetPrice}/क्विंटल\n\n` +
    `✅ अभी बेचने का सही समय!\n` +
    `fasalai.in पर और जानकारी देखें`;

  return sendAlertSMS(`whatsapp:${phone}`, message);
}

// ── Send weekly summary WhatsApp ──
export async function sendWeeklySummary({
  phone,
  userName,
  prices,
}: {
  phone: string;
  userName: string;
  prices: Array<{ crop: string; price: number; change: number }>;
}): Promise<boolean> {
  const priceLines = prices
    .map((p) => {
      const arrow = p.change >= 0 ? "▲" : "▼";
      return `• ${p.crop}: ₹${p.price}/q ${arrow} ${Math.abs(p.change).toFixed(1)}%`;
    })
    .join("\n");

  const message =
    `🌾 *FasalAI साप्ताहिक रिपोर्ट*\n` +
    `नमस्ते ${userName}!\n\n` +
    `इस सप्ताह के भाव:\n${priceLines}\n\n` +
    `विस्तृत जानकारी के लिए fasalai.in देखें`;

  return sendAlertSMS(`whatsapp:${phone}`, message);
}
