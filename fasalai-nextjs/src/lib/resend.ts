// src/lib/resend.ts
// Resend Email Notification Service

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "alerts@fasalai.in";

// ── Send price alert email ──
export async function sendAlertEmail({
  to,
  userName,
  cropName,
  cropNameHindi,
  currentPrice,
  targetPrice,
  condition,
}: {
  to: string;
  userName: string;
  cropName: string;
  cropNameHindi: string;
  currentPrice: number;
  targetPrice: number;
  condition: string;
}): Promise<boolean> {
  try {
    await resend.emails.send({
      from: `FasalAI Alerts <${FROM}>`,
      to,
      subject: `🌾 Price Alert: ${cropName} reached ₹${currentPrice}/q`,
      html: getPriceAlertHTML({ userName, cropName, cropNameHindi, currentPrice, targetPrice, condition }),
    });
    return true;
  } catch (error) {
    console.error("Resend email error:", error);
    return false;
  }
}

// ── Send welcome email ──
export async function sendWelcomeEmail({
  to,
  userName,
}: {
  to: string;
  userName: string;
}): Promise<boolean> {
  try {
    await resend.emails.send({
      from: `FasalAI <${FROM}>`,
      to,
      subject: `🌾 Welcome to FasalAI, ${userName}!`,
      html: getWelcomeHTML(userName),
    });
    return true;
  } catch (error) {
    console.error("Resend welcome email error:", error);
    return false;
  }
}

// ── Send weekly price report email ──
export async function sendWeeklyReportEmail({
  to,
  userName,
  prices,
  weekRange,
}: {
  to: string;
  userName: string;
  prices: Array<{ crop: string; cropHindi: string; price: number; change: number; trend: string }>;
  weekRange: string;
}): Promise<boolean> {
  try {
    await resend.emails.send({
      from: `FasalAI Weekly <${FROM}>`,
      to,
      subject: `📊 Your Weekly Mandi Report — ${weekRange}`,
      html: getWeeklyReportHTML(userName, prices, weekRange),
    });
    return true;
  } catch (error) {
    console.error("Resend weekly report error:", error);
    return false;
  }
}

// ── HTML Templates ──

function getPriceAlertHTML(data: {
  userName: string;
  cropName: string;
  cropNameHindi: string;
  currentPrice: number;
  targetPrice: number;
  condition: string;
}): string {
  const isAbove = data.condition === "ABOVE";
  const emoji = isAbove ? "📈" : "📉";
  const msg = isAbove ? "risen above" : "fallen below";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="font-family: 'DM Sans', Arial, sans-serif; background: #fefae0; margin: 0; padding: 20px;">
  <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 32px rgba(45,106,79,0.1);">
    
    <!-- Header -->
    <div style="background: #556b2f; padding: 32px 32px 24px; text-align: center;">
      <div style="font-size: 2rem; margin-bottom: 8px;">🌾</div>
      <h1 style="color: white; font-size: 1.4rem; margin: 0; font-weight: 700;">FasalAI Price Alert</h1>
      <p style="color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 0.85rem;">मूल्य अलर्ट</p>
    </div>

    <!-- Body -->
    <div style="padding: 32px;">
      <p style="color: #2b2e1e; font-size: 1rem; margin: 0 0 24px;">
        नमस्ते <strong>${data.userName}</strong>,
      </p>
      <p style="color: #666b4f; margin: 0 0 24px; line-height: 1.6;">
        ${emoji} The price of <strong>${data.cropName} (${data.cropNameHindi})</strong> has ${msg} your target price.
      </p>

      <!-- Price Box -->
      <div style="background: #f8fdf9; border: 2px solid #d2e0b8; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <div style="font-size: 0.8rem; color: #666b4f; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Current Price</div>
        <div style="font-size: 2.8rem; font-weight: 800; color: #556b2f; margin: 8px 0;">₹${data.currentPrice}</div>
        <div style="font-size: 0.85rem; color: #666b4f;">per quintal</div>
        <hr style="border: none; border-top: 1px solid #d2e0b8; margin: 16px 0;" />
        <div style="font-size: 0.8rem; color: #666b4f;">Your Target: <strong>₹${data.targetPrice}/q</strong></div>
      </div>

      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
         style="display: block; background: #556b2f; color: white; text-align: center; padding: 14px; border-radius: 100px; text-decoration: none; font-weight: 600; font-size: 1rem;">
        View Dashboard →
      </a>
    </div>

    <!-- Footer -->
    <div style="background: #f8fdf9; padding: 20px 32px; text-align: center; border-top: 1px solid #e8f5e9;">
      <p style="color: #666b4f; font-size: 0.78rem; margin: 0;">
        🌾 FasalAI — Mandi Price Intelligence for Every Farmer<br/>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/alerts" style="color: #556b2f;">Manage your alerts</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function getWelcomeHTML(userName: string): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #fefae0; margin: 0; padding: 20px;">
  <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 32px rgba(45,106,79,0.1);">
    <div style="background: #556b2f; padding: 40px 32px; text-align: center;">
      <div style="font-size: 3rem; margin-bottom: 12px;">🌾</div>
      <h1 style="color: white; font-size: 1.6rem; margin: 0;">Welcome to FasalAI!</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">मंडी प्राइस ट्रैकर में आपका स्वागत है</p>
    </div>
    <div style="padding: 32px;">
      <p style="color: #2b2e1e; font-size: 1rem;">नमस्ते <strong>${userName}</strong>,</p>
      <p style="color: #666b4f; line-height: 1.7;">
        Welcome to FasalAI — your AI-powered mandi intelligence platform. 
        Track real-time prices for 180+ crops, get AI predictions, and never miss the right selling time.
      </p>
      <div style="background: #f8fdf9; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="color: #556b2f; font-weight: 700; margin: 0 0 12px;">Get started in 3 steps:</p>
        <p style="color: #666b4f; margin: 8px 0;">1. 🌾 Add your crops from the dashboard</p>
        <p style="color: #666b4f; margin: 8px 0;">2. 🏪 Select your nearest mandi</p>
        <p style="color: #666b4f; margin: 8px 0;">3. 🔔 Set price alerts to get notified</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
         style="display: block; background: #556b2f; color: white; text-align: center; padding: 14px; border-radius: 100px; text-decoration: none; font-weight: 600;">
        Go to Dashboard →
      </a>
    </div>
  </div>
</body>
</html>`;
}

function getWeeklyReportHTML(userName: string, prices: any[], weekRange: string): string {
  const rows = prices
    .map(
      (p) => `
    <tr>
      <td style="padding: 10px 8px; color: #2b2e1e;">${p.crop} <span style="color: #666b4f; font-size: 0.8rem;">${p.cropHindi}</span></td>
      <td style="padding: 10px 8px; font-weight: 700; color: #556b2f;">₹${p.price}/q</td>
      <td style="padding: 10px 8px; color: ${p.change >= 0 ? "#556b2f" : "#e63946"};">
        ${p.change >= 0 ? "▲" : "▼"} ${Math.abs(p.change).toFixed(1)}%
      </td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #fefae0; margin: 0; padding: 20px;">
  <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 32px rgba(45,106,79,0.1);">
    <div style="background: #556b2f; padding: 32px; text-align: center;">
      <div style="font-size: 2rem; margin-bottom: 8px;">📊</div>
      <h1 style="color: white; font-size: 1.3rem; margin: 0;">Weekly Mandi Report</h1>
      <p style="color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 0.85rem;">${weekRange}</p>
    </div>
    <div style="padding: 32px;">
      <p style="color: #2b2e1e;">नमस्ते <strong>${userName}</strong>,</p>
      <p style="color: #666b4f; margin-bottom: 24px;">Here's your crop price summary for this week:</p>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f8fdf9;">
            <th style="padding: 10px 8px; text-align: left; color: #666b4f; font-size: 0.78rem; text-transform: uppercase;">Crop</th>
            <th style="padding: 10px 8px; text-align: left; color: #666b4f; font-size: 0.78rem; text-transform: uppercase;">Price</th>
            <th style="padding: 10px 8px; text-align: left; color: #666b4f; font-size: 0.78rem; text-transform: uppercase;">Change</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
         style="display: block; background: #556b2f; color: white; text-align: center; padding: 14px; border-radius: 100px; text-decoration: none; font-weight: 600; margin-top: 24px;">
        View Full Dashboard →
      </a>
    </div>
  </div>
</body>
</html>`;
}
