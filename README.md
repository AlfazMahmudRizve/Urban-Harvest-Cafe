# Urban Harvest Cafe ☕🥯
<br />

> **The Ultimate Solo-Operator Kitchen System**

![Banner](https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop)

### 🎥 See It In Action (Real-Time Kitchen Sync)
(coming soon)

Urban Harvest Cafe is more than just a food ordering app; it is a purpose-built **independent restaurant system** designed from the ground up to empower a single solo-operator (chef/owner). 

The philosophy is simple: **One person cooks, the system handles the rest.** 

## 💡 The Vision: Solo Cafe Operations
Running a small, independent cafe shouldn't require a 5-person front-of-house staff. This system is built around a friction-free workflow:
1. Customers sit at a table, scan a QR code, and order from their phones (defaulting to Dine-In). Takeout and Home Delivery options are also seamlessly integrated.
2. The kitchen runs **completely hands-free**. When an order comes in, the dashboard's built-in Text-to-Speech engine literally speaks the order aloud to the chef so they never have to wipe flour off their hands to tap a screen. 
3. When the food is hot and ready, the chef hits "Completed" and simply shouts the customer's name and table number (e.g., *"John, your food is ready at Table 4!"*).

## 🚀 Key Features

-   **🗣️ Hands-Free Kitchen Notification:** Browser-native Text-to-Speech reads out the customer name, table number, and exact items requested (e.g., *"New order for Rizve, Table 4. 1x Avocado Sourdough Toast"*).
-   **🛡️ Dynamic Overload Protection:** A custom load-balancing engine. The chef defines their max capacity and limits in the settings dashboard. If the kitchen gets swamped, the storefront automatically displays an "Overwhelmed" pause screen to prevent angry customers and impossible wait times.
-   **⏱️ Real-Time Smart ETA:** The `/success` page actively calculates the customer's estimated wait time based on how many tickets the kitchen is currently processing, avoiding generic "Wait 20 minutes" placeholders.
-   **📱 Mobile-First Scanning:** Designed specifically round QR-code table scanning. The UI is heavily optimized for fast mobile scrolling, sticky cart interactions, and instant checkout.
-   **📈 Kanban Command Center:** The chef's dashboard uses an intuitive Drag/Action Kanban board (Pending -> Cooking -> Ready), alongside a Channel Breakdown to quickly view itemized lists by Dine-In, Takeout, or Delivery.
-   **📱 Installable PWA:** Configured as a Progressive Web Application. Customers can install the cafe app directly to their iOS/Android home screens without an App Store, increasing retention and re-orders.

## 🏗️ Architecture & Data Flow
*(For Technical Evaluators & Buyers)*

This application is built for high-performance and reliable state synchronization across devices:
- **Framework:** Next.js 14 (App Router) combined with TailwindCSS for the presentation layer.
- **State Management:** Zustand is used for client-side cart management and local persistence, ensuring that users don't lose their cart if they accidentally refresh or lose connection.
- **Backend Edge Network:** Supabase provides the PostgreSQL database and authenticates Admin/Kitchen operations.
- **Real-Time Data Sync:** 
  - The kitchen dashboard utilizes **Supabase Realtime subscriptions** to instantly push new incoming order payloads directly to the client browser.
  - To bypass strict browser constraints (e.g., extensions blocking WebSockets or React StrictMode teardowns), an automatic, resilient **5-second polling fallback layer** was custom-engineered to guarantee 100% order capture even on unstable cafe WiFi networks.
- **Data Security:** Row Level Security (RLS) policies are configured in Postgres. Customer connections use a public `anon` key to write new orders, while the Kitchen Dashboard is protected behind a cryptographic session layer.
- **Offline Reliability:** Service workers cache core static assets ensuring the storefront UI loads instantly for repeat customers on spotty mobile data.

## 🛠️ Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 👤 Author

Designed & Developed by **[Alfaz Mahmud Rizve](https://whoisalfaz.me)**.
[View Source on GitHub](https://github.com/AlfazMahmudRizve/Urban-Harvest-Cafe)

---
*Built with ❤️ for solo independent cafe operators.*
