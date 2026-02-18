"use client";

import { useState } from "react";
import HeroSection from "@/components/home/HeroSection";
import LoyaltyBanner from "@/components/home/LoyaltyBanner";
import InfoSection from "@/components/home/InfoSection";
import MenuCard from "@/components/ui/MenuCard";
import CartSheet from "@/components/cart/CartSheet";
import StoreStatusBanner from "@/components/ui/StoreStatusBanner";
import menuData from "@/lib/data/menu.json";
import { getMenuItems } from "@/app/actions/menu";
import { useEffect } from "react";

// Typed Menu Item
type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  tags: string[];
};

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const items: any = await getMenuItems();

        // Check if items is an array and has content
        if (Array.isArray(items) && items.length > 0) {
          console.log("Client: Using DB items", items.length);
          setMenuItems(items.filter((i: any) => i.available !== false));
        } else {
          // If DB returns empty (or failed silently), fallback to static data
          console.warn("Client: Database returned empty menu, falling back to static data.");
          console.log("Client: Static Data", menuData);
          setMenuItems(menuData as any);
        }
      } catch (e) {
        console.error("Failed to fetch menu", e);
        setMenuItems(menuData as any);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  const categories = ["All", ...Array.from(new Set(menuItems.map((item) => item.category)))];

  const filteredMenu = activeCategory === "All"
    ? menuItems
    : menuItems.filter((item) => item.category === activeCategory);

  const scrollToCategory = (cat: string) => {
    const element = document.getElementById(cat);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveCategory(cat);
    }
  };

  return (
    <main className="min-h-screen pb-32 md:pb-0">
      <StoreStatusBanner />
      <HeroSection />

      {/* Loyalty Banner - Unique Positioning */}
      <LoyaltyBanner />

      <div id="menu-start" className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-latte/20 py-4 px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 md:justify-center min-w-max">
          {categories.filter(c => c !== "All").map((cat) => (
            <button
              key={cat}
              onClick={() => scrollToCategory(cat)}
              className={`px-6 py-2 rounded-full font-bold transition-all whitespace-nowrap font-sans ${activeCategory === cat
                ? "bg-espresso text-cream shadow-md"
                : "bg-cream text-espresso/70 hover:bg-latte/20 hover:text-espresso"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-12 bg-cream">
        {/* Render sections based on categories */}
        {categories.filter(c => c !== "All").map((cat) => {
          const items = menuItems.filter(item => item.category === cat);
          if (items.length === 0) return null;

          return (
            <section key={cat} id={cat} className="scroll-mt-24">
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6 flex items-center gap-2 text-espresso">
                {cat}
                <div className="h-px bg-latte flex-1 ml-4 opacity-50" />
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <MenuCard
                    key={item.id}
                    {...(item as MenuItem)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Info Section - Hours & Services (Moved Below Menu) */}
      <InfoSection />


      <CartSheet />
    </main>
  );
}
