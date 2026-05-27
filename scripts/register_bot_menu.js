const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = "https://urbancafe.whoisalfaz.me";

if (!botToken || botToken === "your_telegram_bot_token") {
  console.error("❌ Error: TELEGRAM_BOT_TOKEN is not configured in .env.local");
  process.exit(1);
}

async function registerMenuButton() {
  console.log(`📡 Registering Telegram Bot Menu Button to Web App URL: ${webAppUrl}...`);
  
  try {
    const payload = {
      menu_button: {
        type: "web_app",
        text: "Order Food ☕",
        web_app: {
          url: webAppUrl
        }
      }
    };

    const res = await fetch(`https://api.telegram.org/bot${botToken}/setChatMenuButton`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    
    if (data.ok) {
      console.log("✅ Bot Menu Button successfully registered on Telegram!");
      console.log("Response:", data);
    } else {
      console.error("❌ Failed to register Menu Button.");
      console.error("Error Response:", data);
    }
  } catch (error) {
    console.error("❌ Connection error:", error.message);
  }
}

registerMenuButton();
