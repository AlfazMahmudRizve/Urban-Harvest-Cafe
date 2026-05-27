"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import HeroSection from "@/components/home/HeroSection";
import LoyaltyBanner from "@/components/home/LoyaltyBanner";
import InfoSection from "@/components/home/InfoSection";
import MenuCard from "@/components/ui/MenuCard";
import CartSheet from "@/components/cart/CartSheet";
import StoreStatusBanner from "@/components/ui/StoreStatusBanner";
import TableQRListener from "@/components/cart/TableQRListener";
import menuData from "@/lib/data/menu.json";
import { getMenuItems } from "@/app/actions/menu";
import { Coffee, GlassWater, Croissant, Pizza, Cake, Sparkles } from "lucide-react";
import { getStoreStatus } from "@/app/actions/storeStatus";

// Typed Menu Item
type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  tags: string[];
};

const getCategoryIcon = (category: string) => {
  const name = category.toLowerCase();
  if (name.includes("coffee") || name.includes("tea") || name.includes("espresso") || name.includes("beverage") || name.includes("drink")) {
    return <Coffee size={16} />;
  }
  if (name.includes("juice") || name.includes("smoothie") || name.includes("glass") || name.includes("water")) {
    return <GlassWater size={16} />;
  }
  if (name.includes("bakery") || name.includes("bread") || name.includes("croissant") || name.includes("breakfast") || name.includes("eats")) {
    return <Croissant size={16} />;
  }
  if (name.includes("dessert") || name.includes("cake") || name.includes("sweet")) {
    return <Cake size={16} />;
  }
  if (name.includes("pizza") || name.includes("sandwich") || name.includes("burger") || name.includes("lunch") || name.includes("meal")) {
    return <Pizza size={16} />;
  }
  return <Sparkles size={16} />;
};

// High-quality category Unsplash headers
const getCategoryBanner = (category: string) => {
  const name = category.toLowerCase();
  if (name.includes("coffee") || name.includes("tea") || name.includes("espresso")) {
    return "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200&auto=format&fit=crop"; // Espresso shot
  }
  if (name.includes("bakery") || name.includes("bread") || name.includes("croissant") || name.includes("breakfast")) {
    return "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop"; // Bakery/Bread
  }
  if (name.includes("dessert") || name.includes("cake") || name.includes("sweet")) {
    return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&auto=format&fit=crop"; // Chocolate cake
  }
  if (name.includes("pizza") || name.includes("sandwich") || name.includes("burger") || name.includes("lunch") || name.includes("savory") || name.includes("meal")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop"; // Hot Pizza
  }
  if (name.includes("juice") || name.includes("smoothie") || name.includes("beverage") || name.includes("drink")) {
    return "https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=1200&auto=format&fit=crop"; // Drinks
  }
  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop"; // General food bowl
};

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeStatus, setStoreStatus] = useState<{ isOpen: boolean } | null>(null);

  useEffect(() => {
    getStoreStatus().then(setStoreStatus);
    
    async function fetchMenu() {
      try {
        const items: any = await getMenuItems();

        if (Array.isArray(items) && items.length > 0) {
          console.log("Client: Using DB items", items.length);
          setMenuItems(items.filter((i: any) => i.available !== false));
        } else {
          console.warn("Client: Database returned empty menu, falling back to static data.");
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

  const scrollToCategory = (cat: string) => {
    const element = document.getElementById(cat);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveCategory(cat);
    }
  };

  return (
    <main className="min-h-screen bg-warm-texture flex flex-col relative pb-16">
      <Suspense fallback={null}><TableQRListener /></Suspense>
      <StoreStatusBanner />

      {/* ─── 1. CINEMATIC FULL-SCREEN HERO COVER ─── */}
      <HeroSection />

      {/* ─── 2. UNIFIED STICKY CATEGORY NAV BAR ─── */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-latte/15 py-4 px-6 shadow-sm flex justify-center">
        <div className="flex gap-4 md:gap-6 max-w-7xl w-full justify-start md:justify-center overflow-x-auto no-scrollbar py-1">
          {categories.filter(c => c !== "All").map((cat) => (
            <button
              key={cat}
              onClick={() => scrollToCategory(cat)}
              className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap font-sans cursor-pointer flex items-center gap-2.5 hover-lift ${activeCategory === cat
                ? "bg-espresso text-cream shadow-glow-espresso scale-[1.03]"
                : "bg-cream-warm/80 text-espresso/70 hover:bg-latte-light/40 border border-latte/10"
                }`}
            >
              <span className={activeCategory === cat ? "text-cream" : "text-sage"}>
                {getCategoryIcon(cat)}
              </span>
              <span className="tracking-wide">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── 3. LOYALTY PROMOTION SHOWCASE ─── */}
      <LoyaltyBanner />

      {/* ─── 4. MENU GRID WITH PHOTOGRAPHIC HEADERS ─── */}
      <div id="menu-start" className="max-w-7xl mx-auto px-6 py-12 space-y-20 w-full scroll-mt-24">
        {categories.filter(c => c !== "All").map((cat) => {
          const items = menuItems.filter(item => item.category === cat);
          if (items.length === 0) return null;

          return (
            <section key={cat} id={cat} className="scroll-mt-24">
              {/* Cinematic Photographic Category Banner */}
              <div className="h-40 md:h-48 relative overflow-hidden mt-6 mb-10 rounded-3xl shadow-md border border-latte/10 group">
                <div className="absolute inset-0 z-0 transition-transform duration-700 ease-out group-hover:scale-105">
                  <img
                    src={getCategoryBanner(cat)}
                    alt={cat}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-espresso-deep/80 via-espresso/60 to-transparent" />
                </div>
                
                <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12">
                  <span className="text-latte font-black uppercase text-[10px] tracking-widest mb-1.5 animate-warm-pulse">
                    Crafted Section
                  </span>
                  <h2 className="font-heading font-bold text-3xl md:text-4xl text-cream tracking-wide">
                    {cat}
                  </h2>
                </div>
              </div>

              {/* Spacious Food Item Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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

      {/* ─── 5. INFO SECTION (Hours & Contact Details) ─── */}
      <InfoSection />

      <CartSheet />
    </main>
  );
}
