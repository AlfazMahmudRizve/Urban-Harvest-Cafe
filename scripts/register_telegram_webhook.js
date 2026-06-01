const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const webhookUrlArg = process.argv[2];

if (!botToken || botToken === "your_telegram_bot_token") {
  console.error("❌ Error: TELEGRAM_BOT_TOKEN is not configured in .env.local");
  process.exit(1);
}

if (!webhookUrlArg) {
  console.error("❌ Error: Please provide your public webhook domain or tunnel URL.");
  console.log("Usage: node scripts/register_telegram_webhook.js https://your-domain.ngrok-free.app");
  process.exit(1);
}

// Clean url
let cleanUrl = webhookUrlArg.trim();
if (!cleanUrl.endsWith("/api/telegram-webhook")) {
  if (cleanUrl.endsWith("/")) {
    cleanUrl += "api/telegram-webhook";
  } else {
    cleanUrl += "/api/telegram-webhook";
  }
}

async function registerWebhook() {
  console.log(`📡 Registering Telegram Webhook to URL: ${cleanUrl}...`);
  
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${cleanUrl}`);
    const data = await res.json();
    
    if (data.ok) {
      console.log("✅ Webhook successfully registered on Telegram's servers!");
      console.log("Response:", data);
    } else {
      console.error("❌ Failed to register webhook.");
      console.error("Error Response:", data);
    }
  } catch (error) {
    console.error("❌ Connection error:", error.message);
  }
}

registerWebhook();
