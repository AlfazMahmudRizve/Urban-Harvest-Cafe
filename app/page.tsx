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
import { Coffee, GlassWater, Croissant, Pizza, Cake, Sparkles, User, Store, Tag } from "lucide-react";
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

        // Check if items is an array and has content
        if (Array.isArray(items) && items.length > 0) {
          console.log("Client: Using DB items", items.length);
          setMenuItems(items.filter((i: any) => i.available !== false));
        } else {
          // If DB returns empty (or failed silently), fallback to static data
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
    <main className="min-h-screen pb-32 md:pb-0 bg-warm-texture flex flex-col lg:flex-row">
      <Suspense fallback={null}><TableQRListener /></Suspense>
      <StoreStatusBanner />

      {/* ─── LEFT SIDEBAR (Desktop only) ─── */}
      <aside className="hidden lg:flex w-80 xl:w-96 flex-shrink-0 bg-white/90 backdrop-blur-md border-r border-latte/15 p-8 flex-col justify-between sticky top-0 h-screen overflow-y-auto no-scrollbar shadow-md z-30">
        <div className="space-y-8">
          {/* Logo & Brand */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-sage/10 text-sage p-2 rounded-xl border border-sage/20 shadow-sm">
                <Store size={22} />
              </div>
              <h1 className="font-heading font-bold text-2xl text-espresso tracking-tight">Urban Harvest</h1>
            </div>
            <p className="text-xs text-espresso/45 font-medium tracking-wide">Artisan Eats. Locally Sourced.</p>
          </div>

          {/* Active Category Navigation */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-espresso/40 uppercase tracking-widest pl-2">Menu Sections</p>
            <nav className="flex flex-col gap-1.5">
              {categories.filter(c => c !== "All").map((cat) => (
                <button
                  key={cat}
                  onClick={() => scrollToCategory(cat)}
                  className={`w-full px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all cursor-pointer font-sans ${activeCategory === cat
                    ? "bg-espresso text-cream shadow-glow-espresso scale-[1.02]"
                    : "text-espresso/70 hover:text-espresso hover:bg-cream-warm/40"
                    }`}
                >
                  <span className={`${activeCategory === cat ? "text-cream" : "text-sage"}`}>
                    {getCategoryIcon(cat)}
                  </span>
                  <span className="text-sm tracking-wide">{cat}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Student Promo Badge */}
          <div className="glass-card rounded-2xl border border-latte/15 p-4 relative overflow-hidden shadow-sm shadow-espresso/3">
            <div className="flex items-center gap-2 mb-2 text-sage">
              <Tag size={16} />
              <span className="text-xs font-black uppercase tracking-wider">Local Special</span>
            </div>
            <h3 className="font-heading font-black text-espresso text-lg leading-tight mb-1">15% Student Discount</h3>
            <p className="text-xs text-espresso/50 leading-relaxed font-medium">Flash your student ID during pickup or checkout to unlock savings!</p>
          </div>
        </div>

        {/* Footer shortcuts inside sidebar */}
        <div className="border-t border-latte/10 pt-6 mt-6 space-y-4">
          <div className="flex items-center gap-3">
            {storeStatus && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-[10px] border tracking-wider uppercase ${storeStatus.isOpen ? "bg-sage/10 text-sage border-sage/20" : "bg-red-50 text-red-600 border-red-200"}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${storeStatus.isOpen ? "bg-sage animate-pulse" : "bg-red-500"}`} />
                {storeStatus.isOpen ? "OPEN" : "CLOSED"}
              </div>
            )}
            <a href="/profile" className="flex-1 glass-card border border-latte/15 hover:bg-cream-warm/40 flex items-center justify-center gap-2 text-espresso/70 hover:text-espresso px-3 py-1.5 rounded-xl font-bold text-xs transition-colors duration-200 cursor-pointer">
              <User size={14} /> Profile
            </a>
          </div>
        </div>
      </aside>

      {/* ─── MOBILE CATEGORY HEADER (Visible only on mobile/tablet) ─── */}
      <div className="lg:hidden sticky top-0 z-40 glass-card border-b border-latte/15 py-4 px-4 overflow-x-auto no-scrollbar rounded-none shadow-sm">
        <div className="flex gap-4 min-w-max">
          {categories.filter(c => c !== "All").map((cat) => (
            <button
              key={cat}
              onClick={() => scrollToCategory(cat)}
              className={`px-5 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap font-sans cursor-pointer flex items-center gap-2 ${activeCategory === cat
                ? "bg-espresso text-cream shadow-glow-espresso"
                : "bg-cream-warm/80 text-espresso/70 hover:bg-latte-light/40"
                }`}
            >
              <span>{getCategoryIcon(cat)}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── RIGHT MAIN PANEL (Scrollable showcase) ─── */}
      <div className="flex-1 h-screen overflow-y-auto no-scrollbar flex flex-col justify-between">
        <div className="w-full">
          {/* Condensed Hero Showcase */}
          <HeroSection />

          {/* Loyalty Promo */}
          <LoyaltyBanner />

          {/* Menu Sections Grid */}
          <div id="menu-start" className="max-w-6xl mx-auto px-6 py-10 space-y-16 scroll-mt-6">
            {categories.filter(c => c !== "All").map((cat) => {
              const items = menuItems.filter(item => item.category === cat);
              if (items.length === 0) return null;

              return (
                <section key={cat} id={cat} className="scroll-mt-28">
                  <div className="divider-flourish mb-8">
                    <h2 className="font-heading font-bold text-3xl md:text-4xl text-espresso px-6 tracking-wide">
                      {cat}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
        </div>

        {/* Info & Footer Board */}
        <div>
          <InfoSection />
        </div>
      </div>

      <CartSheet />
    </main>
  );
}
