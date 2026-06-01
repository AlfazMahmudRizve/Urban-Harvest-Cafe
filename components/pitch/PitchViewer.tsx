"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowRight, ArrowLeft, Coffee, Smartphone, Bell, Tv, 
    CheckCircle, MessageSquare, Lock, QrCode, Volume2, 
    Database, Sparkles, Cpu, DollarSign, ExternalLink, Eye, EyeOff,
    RefreshCw, Play, Pause, Target, Shield, Zap, Clock, ArrowUpRight
} from "lucide-react";

type Slide = {
    title: string;
    subtitle: string;
    presenterNotes: string[];
};

// Sub-component for smooth fluid numbers count-up using requestAnimationFrame
function CountUp({ to, duration = 1200, suffix = "", prefix = "" }: { to: number; duration?: number; suffix?: string; prefix?: string }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTimestamp: number | null = null;
        let animationFrameId: number;

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(Math.floor(progress * to));
            if (progress < 1) {
                animationFrameId = window.requestAnimationFrame(step);
            }
        };

        animationFrameId = window.requestAnimationFrame(step);
        return () => window.cancelAnimationFrame(animationFrameId);
    }, [to, duration]);

    return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

export default function PitchViewer() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showNotes, setShowNotes] = useState(true);
    
    // Interactive Feature 1: Autoplay Mode
    const [autoplay, setAutoplay] = useState(false);
    const [progress, setProgress] = useState(0);
    const autoplayDuration = 8000; // 8 seconds transition interval

    // Interactive Feature 2: Mouse Laser Pointer Mode
    const [laserActive, setLaserActive] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Interactive Feature 3: Iframe Simulator Loader
    const [simulatorActive, setSimulatorActive] = useState(true);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Interactive Feature 4: Audio Ripple Animation state
    const [isChiming, setIsChiming] = useState(false);

    // Interactive Feature 5: Slide 5 Kitchen Console Visualizer State
    const [kitchenOrders, setKitchenOrders] = useState([
        { id: "1042", customer: "Sarah K.", items: "1x Double Espresso", type: "Dine-In (Table 3)", status: "pending", time: "2m ago" },
        { id: "1043", customer: "Alex M.", items: "2x Butter Croissant, 1x Latte", type: "Takeout", status: "cooking", time: "5m ago" },
        { id: "1044", customer: "David L.", items: "1x Avocado Toast", type: "Dine-In (Table 1)", status: "ready", time: "8m ago" }
    ]);
    const [notifiedAlert, setNotifiedAlert] = useState<string | null>(null);

    // STORYTELLING-DRIVEN SLIDES - HUMAN INTERPRETATION & ENGAGEMENT
    const slides: Slide[] = [
        {
            title: "The Barista's Worst Nightmare: The 8:00 AM Rush",
            subtitle: "The Solo Operator's Nightmare",
            presenterNotes: [
                "Meet Marcus. He brews the best pour-overs in the neighborhood, but he runs his boutique cafe completely alone.",
                "It is 8:00 AM. A sudden line of 15 tired, impatient commuters forms at his counter.",
                "Marcus is trapped in a manual cycle. Every time he leaves the espresso bar to swipe a card or write down an order, the kitchen freezes. Milk steam dies, coffee shots over-extract, and he is losing $200 an hour simply because he only has two hands."
            ]
        },
        {
            title: "Introducing the Invisible Co-Pilot",
            subtitle: "A cloud-native helper built for solo shops",
            presenterNotes: [
                "Marcus doesn't need to hire expensive cashiers or waiters—he doesn't have the margins for it.",
                "He deploys Urban Harvest Cafe. A serverless co-pilot that turns his customer's phones into visual self-checkout terminals.",
                "While Marcus focuses 100% of his energy on pulling perfect espresso shots, background code manages order taking, Stripe payment routing, location verification, and instant kitchen alerts."
            ]
        },
        {
            title: "Frictionless Scan-to-Order & Tamper Protection",
            subtitle: "Browse, customize, pay, and sit down in 15 seconds",
            presenterNotes: [
                "A customer sits down at Table 3 and scans a table QR code. In less than 15 seconds, they browse the menu, customize their oat milk, and checkout with Stripe. No app installs, no friction.",
                "But what if someone tries to cheat the system and order Dine-In from home?",
                "Marcus's system checks the scanned signature coordinates. If it doesn't match a physical table, Dine-In is instantly locked out, protecting his seats from fraud. Try interacting with this live widescreen store simulator on the right!"
            ]
        },
        {
            title: "Keeping Guests Connected: Solving the Isolation Problem",
            subtitle: "Multi-channel off-browser alert system using Web Push & Telegram",
            presenterNotes: [
                "Once checked out, customers immediately close their browser tabs to check email. Under normal systems, communication dies.",
                "Urban Harvest solves this by pairing the guest's checkout page to Marcus's custom Telegram Bot and Web Push service workers.",
                "The second they tap 'Start' in Telegram, our Supabase Realtime channel captures the Postgres update and instantly syncs their screen. They can now lock their screens and wait."
            ]
        },
        {
            title: "Operation Silent Kitchen: The Barista's Dashboard",
            subtitle: "A dark-themed locked-viewport Kanban console with sound indicators",
            presenterNotes: [
                "Behind the counter, Marcus operates a locked-viewport dark Kanban board. No paper ticket mess, no confusion.",
                "As orders arrive, a high-pitch acoustic chime alerts Marcus. He accepts, prepares the drink, and taps Mark Ready.",
                "Try playing with the simulator! Tapping accepting/cooking triggers a physical Cafe Chime, automatically pings the customer's phone via Telegram, and alerts them in silence."
            ]
        },
        {
            title: "The Ultimate Solo-Operator SaaS: A High-Margin Business",
            subtitle: "High-value SaaS architecture, zero platform fees, ready for launch",
            presenterNotes: [
                "Urban Harvest is the ultimate high-margin template for micro-retailers. It charges 0% in platform fees because payments route directly through Marcus's Stripe.",
                "Built completely serverless on Next.js, Supabase, and Vercel, the monthly running cost is literally $0.",
                "If you are an investor, cafe owner, or looking to deploy white-labeled cafe platforms worldwide, let's close this deal today!"
            ]
        }
    ];

    // Slide navigation listeners
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            
            if (e.key === "ArrowRight" || e.key === " ") {
                e.preventDefault();
                setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1));
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                setCurrentSlide((prev) => Math.max(0, prev - 1));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [slides.length]);

    // Autoplay Timer Logic
    useEffect(() => {
        if (!autoplay) {
            setProgress(0);
            return;
        }

        const intervalTime = 100;
        const totalSteps = autoplayDuration / intervalTime;
        let stepCount = 0;

        const timer = setInterval(() => {
            stepCount++;
            setProgress((stepCount / totalSteps) * 100);

            if (stepCount >= totalSteps) {
                stepCount = 0;
                setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
            }
        }, intervalTime);

        return () => clearInterval(timer);
    }, [autoplay, currentSlide, slides.length]);

    // Laser Pointer Cursor tracker
    useEffect(() => {
        if (!laserActive) return;

        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [laserActive]);

    const nextSlide = () => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1));
    const prevSlide = () => setCurrentSlide((prev) => Math.max(0, prev - 1));

    // Synthesize premium double-tone Cafe Bell using Web Audio API on the fly
    const playCafeChime = () => {
        setIsChiming(true);
        setTimeout(() => setIsChiming(false), 800);

        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            const now = ctx.currentTime;

            // Tone 1 (Base): A5 (880.00 Hz) - Warm, rich sustain
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = "sine";
            osc1.frequency.setValueAtTime(880.00, now);
            gain1.gain.setValueAtTime(0.15, now);
            gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);

            // Tone 2 (Sparkle Chime): E6 (1318.51 Hz) - Pure glass sound
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(1318.51, now);
            gain2.gain.setValueAtTime(0.20, now);
            gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);

            osc1.start(now);
            osc1.stop(now + 0.85);
            osc2.start(now);
            osc2.stop(now + 0.55);
        } catch (e) {
            console.error("Audio Context initialization failed or is blocked by browser policy.", e);
        }
    };

    const reloadIframe = () => {
        if (iframeRef.current) {
            iframeRef.current.src = "/";
        }
    };

    // Transition mock kitchen order statuses
    const handleMoveOrder = (orderId: string, nextStatus: string, customerName: string) => {
        playCafeChime();

        if (nextStatus === "cooking") {
            setNotifiedAlert(`🍳 Marcus started preparing the double espresso for ${customerName}!`);
            setTimeout(() => setNotifiedAlert(null), 3500);
        } else if (nextStatus === "ready") {
            setNotifiedAlert(`📲 Sarah K. was pinged with a custom Telegram order alert!`);
            setTimeout(() => setNotifiedAlert(null), 3500);
        } else if (nextStatus === "archived") {
            setNotifiedAlert(`📦 Ticket completed! Kitchen is silent and focused.`);
            setTimeout(() => setNotifiedAlert(null), 3500);
        }

        setKitchenOrders((prev) =>
            prev.map((order) =>
                order.id === orderId ? { ...order, status: nextStatus } : order
            )
        );
    };

    const resetKitchenDemo = () => {
        playCafeChime();
        setKitchenOrders([
            { id: "1042", customer: "Sarah K.", items: "1x Double Espresso", type: "Dine-In (Table 3)", status: "pending", time: "2m ago" },
            { id: "1043", customer: "Alex M.", items: "2x Butter Croissant, 1x Latte", type: "Takeout", status: "cooking", time: "5m ago" },
            { id: "1044", customer: "David L.", items: "1x Avocado Toast", type: "Dine-In (Table 1)", status: "ready", time: "8m ago" }
        ]);
        setNotifiedAlert("🔄 Kitchen console queue has been reset!");
        setTimeout(() => setNotifiedAlert(null), 3000);
    };

    return (
        <div className="flex flex-col h-screen select-none relative overflow-hidden bg-gradient-to-br from-[#120B09] via-[#0E0705] to-[#050302] font-jakarta">
            {/* Custom Presenter Laser Pointer Overlay */}
            {laserActive && (
                <div 
                    className="fixed pointer-events-none z-[9999] w-6 h-6 rounded-full bg-red-500/85 blur-[2px] shadow-[0_0_16px_8px_rgba(239,68,68,0.75)] transition-all duration-75 ease-out"
                    style={{
                        left: mousePos.x - 12,
                        top: mousePos.y - 12,
                    }}
                >
                    <div className="absolute top-[6px] left-[6px] w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,1)]" />
                </div>
            )}

            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-sage/8 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-latte/4 blur-[120px] pointer-events-none" />
            <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-full bg-[#3E2723]/15 blur-[100px] pointer-events-none" />

            {/* Top Navigation Bar - Enlarged */}
            <header className="px-12 py-6 border-b border-latte/5 flex justify-between items-center z-10 bg-black/35 backdrop-blur-md relative">
                {/* Autoplay Visual Countdown Progress Line */}
                {autoplay && (
                    <div 
                        className="absolute bottom-0 left-0 h-[2px] bg-sage transition-all duration-100 ease-linear shadow-[0_0_8px_#6B9080]" 
                        style={{ width: `${progress}%` }}
                    />
                )}

                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-sage/15 border border-sage/20 flex items-center justify-center text-sage">
                        <Coffee size={22} />
                    </div>
                    <div>
                        <span className="font-outfit font-extrabold text-xl text-cream tracking-wide block">URBAN HARVEST</span>
                        <span className="text-[10px] text-latte/40 block font-mono tracking-wider">ONE-MAN SAAS SHOWCASE</span>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="hidden md:flex items-center gap-2.5">
                    {slides.map((_, i) => (
                        <div
                            key={i}
                            onClick={() => setCurrentSlide(i)}
                            className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                                i === currentSlide 
                                    ? "w-12 bg-sage shadow-[0_0_12px_rgba(107,144,128,0.6)]" 
                                    : i < currentSlide 
                                        ? "w-5 bg-sage/40" 
                                        : "w-5 bg-latte/15 hover:bg-latte/25"
                            }`}
                        />
                    ))}
                </div>

                {/* Control Actions Toggles */}
                <div className="flex items-center gap-3">
                    {/* Laser Pointer Switch */}
                    <button
                        onClick={() => setLaserActive(!laserActive)}
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold font-outfit border transition-all ${
                            laserActive 
                                ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" 
                                : "bg-white/5 text-latte/60 border-latte/10 hover:bg-white/10"
                        }`}
                        title="Presenter Laser Pointer Pointer"
                    >
                        <Target size={14} className={laserActive ? "animate-pulse" : ""} />
                        <span className="hidden lg:inline">Laser Pointer</span>
                    </button>

                    {/* Autoplay Toggle */}
                    <button
                        onClick={() => setAutoplay(!autoplay)}
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold font-outfit border transition-all ${
                            autoplay 
                                ? "bg-sage/10 text-sage border-sage/20 hover:bg-sage/20" 
                                : "bg-white/5 text-latte/60 border-latte/10 hover:bg-white/10"
                        }`}
                        title="Autoplay Presentation Loop (8s)"
                    >
                        {autoplay ? <Pause size={14} /> : <Play size={14} />}
                        <span className="hidden lg:inline">{autoplay ? "Pause Autoplay" : "Autoplay"}</span>
                    </button>

                    {/* Presenter Notes switch */}
                    <button
                        onClick={() => setShowNotes(!showNotes)}
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold font-outfit border transition-all ${
                            showNotes 
                                ? "bg-sage/10 text-sage border-sage/20 hover:bg-sage/20" 
                                : "bg-white/5 text-latte/60 border-latte/10 hover:bg-white/10"
                        }`}
                        title="Toggle Presenter Script"
                    >
                        {showNotes ? <Eye size={14} /> : <EyeOff size={14} />}
                        <span className="hidden sm:inline">Notes</span>
                    </button>
                    <span className="text-xs font-bold font-mono px-3.5 py-2 rounded-xl bg-white/5 border border-latte/10 text-latte/50">
                        {currentSlide + 1} / {slides.length}
                    </span>
                </div>
            </header>

            {/* Slide Area - Grandiose Screen Sizing */}
            <div className="flex-1 p-8 md:p-12 flex items-center justify-center overflow-hidden z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 50, scale: 0.99 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -50, scale: 0.99 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-full max-w-[94vw] h-full max-h-[76vh] bg-[#241E1A]/95 backdrop-blur-xl border border-latte/15 p-10 md:p-16 flex flex-col md:flex-row gap-12 justify-between items-center rounded-[40px] shadow-2xl relative overflow-hidden"
                    >
                        {/* Diagonal Accent Light Shimmer */}
                        <div className="absolute top-0 right-0 w-[500px] h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

                        {/* Slide Left: Typography - Scaled & Bigger */}
                        <div className="flex-1 flex flex-col justify-center h-full text-left space-y-6">
                            <span className="text-sage font-bold font-outfit tracking-widest text-xs uppercase bg-sage/15 border border-sage/20 px-4 py-1.5 rounded-full w-max">
                                {slides[currentSlide].subtitle}
                            </span>
                            <h2 className="text-4xl md:text-6xl font-outfit font-black text-[#FCFAF6] leading-[1.1] tracking-tight drop-shadow-md">
                                {slides[currentSlide].title}
                            </h2>
                            <div className="w-20 h-1 bg-gradient-to-r from-sage to-transparent rounded-full" />
                            
                            {/* STORYTELLING DESCRIPTION NARRATIVE */}
                            <p className="text-base md:text-lg text-latte/70 max-w-xl leading-relaxed font-jakarta font-medium">
                                {currentSlide === 0 && "Brewing specialty pour-overs, steaming milk, managing active orders, and swiping credit cards concurrently creates massive operational gridlock for solo operators. Marcus is losing revenue because he only has two hands."}
                                {currentSlide === 1 && "Instead of hiring expensive waiters, Marcus deploys an automated second set of hands: a serverless ordering co-pilot. All payment routing, database syncing, and customer notifications run silently in the background."}
                                {currentSlide === 2 && "Sarah sits down at Table 3 and scans a table QR. In less than 15 seconds, she customizes her espresso and checks out via Stripe without installing a thing. Dine-in fraud is securely blocked by table-scan coordinate checks."}
                                {currentSlide === 3 && "Once checked out, Sarah locks her screen and closes the tab. Traditional web apps lose touch, but Urban Harvest bridges the gap. By binding her order to service workers and Telegram webhooks, we ensure she stays connected off-browser."}
                                {currentSlide === 4 && "Behind the counter, Marcus operates in total peace. Incoming orders trigger a warm cafe bell chime on his locked dark console. A single tap on his screen advances the order and immediately pings the customer's Telegram bot."}
                                {currentSlide === 5 && "Bypassing typical food aggregator commissions yields direct-to-Stripe profitability. Built completely serverless, the running cost is literally $0, creating the ultimate high-value white-label SaaS template for micro-retail."}
                            </p>
                        </div>

                        {/* Slide Right: Visual Concept Displays - Conditionally remove padding to stretch simulator */}
                        <div className={`flex-1 w-full h-full flex items-center justify-center relative min-h-[320px] md:min-h-0 bg-black/40 border border-latte/5 rounded-[32px] overflow-hidden ${
                            (currentSlide === 2 && simulatorActive) || currentSlide === 4 ? "p-0" : "p-8"
                        }`}>
                            
                            {/* Slide 1 Visual: Solo Bottleneck illustration */}
                            {currentSlide === 0 && (
                                <div className="space-y-5 w-full max-w-md">
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-center gap-5 animate-pulse">
                                        <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-outfit font-extrabold text-lg">1</div>
                                        <div className="text-left"><p className="font-outfit font-bold text-cream text-base">Espresso Machine Halts</p><p className="text-xs md:text-sm text-latte/50">Marcus is away swiping a register card</p></div>
                                    </div>
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-center gap-5 opacity-75">
                                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-outfit font-extrabold text-lg">2</div>
                                        <div className="text-left"><p className="font-outfit font-bold text-cream text-base">commuters Impatient</p><p className="text-xs md:text-sm text-latte/50">Table menus dirty, orders piling up</p></div>
                                    </div>
                                    <div className="bg-gray-500/10 border border-latte/8 rounded-2xl p-5 flex items-center gap-5 opacity-50">
                                        <div className="w-12 h-12 rounded-xl bg-gray-500/20 text-latte/60 flex items-center justify-center font-outfit font-extrabold text-lg">3</div>
                                        <div className="text-left"><p className="font-outfit font-bold text-cream text-base">Shouting Names in Noise</p><p className="text-xs md:text-sm text-latte/50">Commuter closed the storefront browser tab</p></div>
                                    </div>
                                </div>
                            )}

                            {/* Slide 2 Visual: Co-Pilot Grid */}
                            {currentSlide === 1 && (
                                <div className="grid grid-cols-2 gap-5 w-full max-w-md">
                                    <div className="bg-black/30 border border-latte/5 p-5 rounded-2xl flex flex-col justify-between min-h-[110px] hover:border-sage/20 transition-all cursor-default">
                                        <Smartphone className="text-sage mb-2" size={28} />
                                        <p className="text-base font-outfit font-bold text-cream text-left">Customer App</p>
                                    </div>
                                    <div className="bg-black/30 border border-latte/5 p-5 rounded-2xl flex flex-col justify-between min-h-[110px] hover:border-sage/20 transition-all cursor-default">
                                        <Tv className="text-sage mb-2" size={28} />
                                        <p className="text-base font-outfit font-bold text-cream text-left">Kitchen Monitor</p>
                                    </div>
                                    <div className="bg-black/30 border border-latte/5 p-5 rounded-2xl flex flex-col justify-between min-h-[110px] hover:border-sage/20 transition-all cursor-default">
                                        <Database className="text-sage mb-2" size={28} />
                                        <p className="text-base font-outfit font-bold text-cream text-left">Supabase Realtime</p>
                                    </div>
                                    <div className="bg-black/30 border border-latte/5 p-5 rounded-2xl flex flex-col justify-between min-h-[110px] hover:border-sage/20 transition-all cursor-default">
                                        <DollarSign className="text-sage mb-2" size={28} />
                                        <p className="text-base font-outfit font-bold text-cream text-left">Stripe Split Payments</p>
                                    </div>
                                </div>
                            )}

                            {/* Slide 3 Visual: Widescreen Mockup Simulator - Occupies 100% space conditionally */}
                            {currentSlide === 2 && (
                                <div className="w-full h-full flex flex-col relative">
                                    {!simulatorActive && (
                                        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 px-3 py-2 bg-black/45 backdrop-blur-md rounded-xl border border-latte/5 text-xs font-outfit">
                                            <span className="text-latte/60 font-medium">Interactive Widescreen Demo Store</span>
                                            <button 
                                                onClick={() => setSimulatorActive(true)}
                                                className="px-2.5 py-1 bg-sage/20 text-sage hover:bg-sage/30 rounded-lg font-bold text-[10px]"
                                            >
                                                Show Simulator
                                            </button>
                                        </div>
                                    )}

                                    {simulatorActive ? (
                                        <div className="w-full h-full bg-[#1A1412] flex flex-col transition-all duration-300">
                                            <div className="h-12 bg-[#3E2723]/40 border-b border-latte/8 px-4 flex items-center justify-between gap-4 flex-shrink-0">
                                                <div className="flex gap-1.5 flex-shrink-0">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/80" />
                                                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80" />
                                                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/80" />
                                                </div>
                                                <div className="flex-1 bg-black/40 border border-latte/5 rounded-lg text-center text-xs text-latte/45 font-mono py-1.5 max-w-xs mx-auto flex items-center justify-center gap-1.5">
                                                    <Lock size={10} className="text-sage" />
                                                    urbancafe.whoisalfaz.me
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0 font-outfit">
                                                    <button 
                                                        onClick={reloadIframe}
                                                        className="p-1 text-sage hover:text-sage-light hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                                                        title="Reload Storefront Simulator"
                                                    >
                                                        <RefreshCw size={12} />
                                                    </button>
                                                    <button 
                                                        onClick={() => setSimulatorActive(false)}
                                                        className="px-2 py-0.5 bg-sage/20 text-sage hover:bg-sage/30 rounded-md font-bold text-[10px] cursor-pointer"
                                                    >
                                                        Show Rules
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex-1 w-full bg-[#FCFAF6] overflow-hidden relative">
                                                <iframe 
                                                    ref={iframeRef}
                                                    src="/" 
                                                    className="w-full h-full border-none select-text"
                                                    title="Live Widescreen Storefront Preview"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 w-full max-w-sm mt-16 mx-auto">
                                            <div className="bg-sage/10 border border-sage/20 rounded-2xl p-5 flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-left">
                                                    <QrCode className="text-sage" size={24} />
                                                    <div><p className="font-outfit font-bold text-cream text-base">Dine-in Order (Table 4)</p><p className="text-xs text-sage">Locked & Tamper-proof</p></div>
                                                </div>
                                                <CheckCircle className="text-sage" size={20} />
                                            </div>
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-center justify-between opacity-80">
                                                <div className="flex items-center gap-4 text-left">
                                                    <Lock className="text-red-400" size={24} />
                                                    <div><p className="font-outfit font-bold text-cream text-base line-through">Dine-in (Direct Visit)</p><p className="text-xs text-red-400">Locked Out: Forced Takeout</p></div>
                                                </div>
                                                <div className="text-red-400 text-xs font-bold border border-red-500/20 px-2 py-1 rounded-md font-outfit">BLOCKED</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Slide 4 Visual: Real-time Pub-Sub diagram */}
                            {currentSlide === 3 && (
                                <div className="flex flex-col gap-5 w-full max-w-md">
                                    <div className="flex justify-between items-center gap-3">
                                        <div className="flex-1 bg-white/5 border border-latte/10 p-4 rounded-xl text-center">
                                            <p className="text-xs md:text-sm font-outfit font-bold text-cream">{"Marcus's Success Page"}</p>
                                            <span className="text-[10px] text-latte/50 font-mono">Listening...</span>
                                        </div>
                                        <div className="w-16 h-0.5 bg-dashed border-t border-latte/20" />
                                        <div className="flex-1 bg-sage/15 border border-sage/30 p-4 rounded-xl text-center shadow-glow-sage animate-pulse">
                                            <p className="text-xs md:text-sm font-outfit font-bold text-sage">{"Sarah's Telegram bot"}</p>
                                            <span className="text-[10px] text-sage font-mono">Start Clicked</span>
                                        </div>
                                    </div>
                                    <div className="bg-black/30 border border-latte/5 p-5 rounded-xl text-left">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <CheckCircle className="text-sage" size={18} />
                                            <p className="text-xs md:text-sm font-outfit font-bold text-cream">Supabase Real-time Pub-Sub</p>
                                        </div>
                                        <p className="text-xs text-latte/50 font-mono leading-relaxed">{"Sarah opens Telegram -> clicks Start -> Server hooks update customers table -> Pub-Sub instantly pings Marcus's page."}</p>
                                    </div>
                                </div>
                            )}

                            {/* Slide 5 Visual: PREMIUM LIVE INTERACTIVE KITCHEN KANBAN VISUALIZER */}
                            {currentSlide === 4 && (
                                <div className="w-full h-full bg-[#1A1412] flex flex-col transition-all duration-300 relative select-none">
                                    {/* Mock Sync Status Header */}
                                    <div className="h-12 bg-[#3E2723]/40 border-b border-latte/8 px-5 flex items-center justify-between flex-shrink-0 text-xs font-outfit">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-sage rounded-full animate-ping" />
                                            <span className="w-2 h-2 bg-sage rounded-full absolute" />
                                            <span className="text-cream font-bold tracking-wider uppercase text-[10px]">{"Marcus's Console"}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="bg-white/5 border border-latte/10 text-latte/65 px-2.5 py-0.5 rounded font-mono text-[9px]">Peak Wait: 4m</span>
                                            <button 
                                                onClick={resetKitchenDemo}
                                                className="px-2.5 py-0.5 border border-sage/35 text-sage bg-sage/10 hover:bg-sage/20 rounded font-bold text-[9px] transition-all cursor-pointer"
                                                title="Reset Simulator Tickets"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </div>

                                    {/* Live Simulated Columns */}
                                    <div className="flex-1 w-full grid grid-cols-3 gap-2.5 p-3.5 overflow-hidden">
                                        {/* Column 1: Pending */}
                                        <div className="flex flex-col bg-black/35 rounded-xl border border-latte/5 overflow-hidden">
                                            <div className="px-3 py-2 bg-red-500/10 border-b border-red-500/15 flex items-center justify-between flex-shrink-0">
                                                <span className="text-[10px] font-outfit font-black text-red-400 uppercase tracking-wider">Pending</span>
                                                <span className="bg-red-500/20 text-red-300 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                                    {kitchenOrders.filter(o => o.status === "pending").length}
                                                </span>
                                            </div>
                                            <div className="flex-grow p-2 space-y-2 overflow-y-auto no-scrollbar">
                                                {kitchenOrders.filter(o => o.status === "pending").map(order => (
                                                    <motion.div 
                                                        key={order.id} 
                                                        layoutId={order.id}
                                                        className="bg-[#241E1A] border border-red-500/25 p-2.5 rounded-lg text-left relative overflow-hidden animate-pulse-border"
                                                    >
                                                        <div className="flex justify-between items-start mb-1 text-[10px]">
                                                            <span className="font-bold text-cream">{order.customer}</span>
                                                            <span className="text-latte/40 font-mono">{order.time}</span>
                                                        </div>
                                                        <p className="text-[11px] text-latte/80 font-medium mb-2">{order.items}</p>
                                                        <button 
                                                            onClick={() => handleMoveOrder(order.id, "cooking", order.customer)}
                                                            className="w-full py-1 text-center bg-red-500 text-white font-outfit font-extrabold text-[9px] rounded hover:bg-red-600 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                                        >
                                                            <Volume2 size={8} className="animate-bounce" />
                                                            Accept & Cook
                                                        </button>
                                                    </motion.div>
                                                ))}
                                                {kitchenOrders.filter(o => o.status === "pending").length === 0 && (
                                                    <div className="text-center text-[10px] text-latte/30 py-8 italic font-medium">Empty Queue</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Column 2: Cooking */}
                                        <div className="flex flex-col bg-black/35 rounded-xl border border-latte/5 overflow-hidden">
                                            <div className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/15 flex items-center justify-between flex-shrink-0">
                                                <span className="text-[10px] font-outfit font-black text-amber-400 uppercase tracking-wider">Cooking</span>
                                                <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                                    {kitchenOrders.filter(o => o.status === "cooking").length}
                                                </span>
                                            </div>
                                            <div className="flex-grow p-2 space-y-2 overflow-y-auto no-scrollbar">
                                                {kitchenOrders.filter(o => o.status === "cooking").map(order => (
                                                    <motion.div 
                                                        key={order.id} 
                                                        layoutId={order.id}
                                                        className="bg-[#241E1A] border border-amber-500/15 p-2.5 rounded-lg text-left"
                                                    >
                                                        <div className="flex justify-between items-start mb-1 text-[10px]">
                                                            <span className="font-bold text-cream">{order.customer}</span>
                                                            <span className="text-latte/40 font-mono">{order.time}</span>
                                                        </div>
                                                        <p className="text-[11px] text-latte/80 font-medium mb-2">{order.items}</p>
                                                        <button 
                                                            onClick={() => handleMoveOrder(order.id, "ready", order.customer)}
                                                            className="w-full py-1 text-center bg-amber-500 text-black font-outfit font-extrabold text-[9px] rounded hover:bg-amber-600 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                                        >
                                                            <Bell size={8} />
                                                            Mark Ready
                                                        </button>
                                                    </motion.div>
                                                ))}
                                                {kitchenOrders.filter(o => o.status === "cooking").length === 0 && (
                                                    <div className="text-center text-[10px] text-latte/30 py-8 italic font-medium">Cooking Clean</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Column 3: Ready */}
                                        <div className="flex flex-col bg-sage/5 rounded-xl border border-sage/15 overflow-hidden">
                                            <div className="px-3 py-2 bg-sage/10 border-b border-sage/20 flex items-center justify-between flex-shrink-0">
                                                <span className="text-[10px] font-outfit font-black text-sage uppercase tracking-wider">Ready (Alert)</span>
                                                <span className="bg-sage/20 text-sage-light text-[9px] font-bold px-1.5 py-0.2 rounded">
                                                    {kitchenOrders.filter(o => o.status === "ready").length}
                                                </span>
                                            </div>
                                            <div className="flex-grow p-2 space-y-2 overflow-y-auto no-scrollbar">
                                                {kitchenOrders.filter(o => o.status === "ready").map(order => (
                                                    <motion.div 
                                                        key={order.id} 
                                                        layoutId={order.id}
                                                        className="bg-[#241E1A] border border-sage/25 p-2.5 rounded-lg text-left relative overflow-hidden"
                                                    >
                                                        <div className="absolute top-0 right-0 w-12 h-12 bg-sage/5 blur-sm rounded-full animate-pulse-glow" />
                                                        
                                                        <div className="flex justify-between items-start mb-1 text-[10px]">
                                                            <span className="font-bold text-cream">{order.customer}</span>
                                                            <span className="text-sage font-mono flex items-center gap-1">
                                                                <CheckCircle size={8} /> Alerted
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-latte/80 font-medium mb-2">{order.items}</p>
                                                        <button 
                                                            onClick={() => handleMoveOrder(order.id, "archived", order.customer)}
                                                            className="w-full py-1 text-center bg-sage text-cream font-outfit font-extrabold text-[9px] rounded hover:bg-sage-deep transition-all flex items-center justify-center gap-1 cursor-pointer"
                                                        >
                                                            Complete
                                                        </button>
                                                    </motion.div>
                                                ))}
                                                {kitchenOrders.filter(o => o.status === "ready").length === 0 && (
                                                    <div className="text-center text-[10px] text-latte/30 py-8 italic font-medium">Clear Station</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Active Slideway Telegram / Web-Push Alerts Banner overlay */}
                                    <AnimatePresence>
                                        {notifiedAlert && (
                                            <motion.div 
                                                initial={{ y: 30, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: 30, opacity: 0 }}
                                                className="absolute bottom-3 left-4 right-4 bg-sage text-cream border border-sage-light py-2 px-3 rounded-lg shadow-lg flex items-center gap-2.5 z-30 justify-center text-xs font-outfit font-bold"
                                            >
                                                <Zap size={12} className="animate-bounce" />
                                                <span>{notifiedAlert}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Slide 6 Visual: Count-Up metrics & Acquisition proposal - LARGER NUMBERS */}
                            {currentSlide === 5 && (
                                <div className="w-full h-full flex flex-col justify-between space-y-5 text-left p-1">
                                    {/* Interactive Metrics Grid with HUGE animated numbers count-up */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-black/30 border border-latte/5 rounded-2xl p-4 flex flex-col justify-center min-h-[90px]">
                                            <span className="text-[10px] font-outfit font-bold text-latte/40 uppercase tracking-wider">Server Cost</span>
                                            <div className="text-3xl md:text-5xl font-outfit font-black text-[#FCFAF6] mt-1">
                                                <CountUp to={0} prefix="$" suffix="/mo" />
                                            </div>
                                        </div>
                                        <div className="bg-black/30 border border-latte/5 rounded-2xl p-4 flex flex-col justify-center min-h-[90px]">
                                            <span className="text-[10px] font-outfit font-bold text-latte/40 uppercase tracking-wider">Direct Routing</span>
                                            <div className="text-3xl md:text-5xl font-outfit font-black text-sage mt-1">
                                                <CountUp to={100} suffix="%" />
                                            </div>
                                        </div>
                                        <div className="bg-black/30 border border-latte/5 rounded-2xl p-4 flex flex-col justify-center min-h-[90px]">
                                            <span className="text-[10px] font-outfit font-bold text-latte/40 uppercase tracking-wider">Setup Ready</span>
                                            <div className="text-3xl md:text-5xl font-outfit font-black text-[#FCFAF6] mt-1">
                                                <CountUp to={15} suffix="m" />
                                            </div>
                                        </div>
                                        <div className="bg-black/30 border border-[#3E2723]/35 rounded-2xl p-4 flex flex-col justify-center min-h-[90px]">
                                            <span className="text-[10px] font-outfit font-bold text-latte/40 uppercase tracking-wider">Operator Yield</span>
                                            <div className="text-3xl md:text-5xl font-outfit font-black text-sage mt-1">
                                                <CountUp to={3} suffix="x" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Interactive contact developer action card - Larger */}
                                    <div className="bg-[#241E1A]/80 border-2 border-sage/30 rounded-2xl p-5 shadow-[0_8px_32px_-4px_rgba(107,144,128,0.15)] flex flex-col space-y-3.5">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] font-outfit font-bold text-sage uppercase tracking-wider">Acquisition Offer</p>
                                                <h4 className="font-outfit font-extrabold text-cream text-base">Acquire Whitelabel Codebase</h4>
                                            </div>
                                            <Sparkles className="text-sage" size={18} />
                                        </div>
                                        <p className="text-xs md:text-sm text-latte/65 leading-relaxed font-jakarta">
                                            Get full serverless Cafe POS blueprint, Stripe webhooks and Telegram alerts ready for commercial scaling.
                                        </p>
                                        <a 
                                            href="/profile"
                                            className="btn-glow w-full flex items-center justify-center gap-2 py-3 bg-sage text-cream font-outfit font-bold text-xs rounded-xl shadow-md hover:bg-sage/90 transition-all cursor-pointer text-center"
                                        >
                                            Contact Developer
                                            <ExternalLink size={12} />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Slide Navigation Bottom Bar - Enlarged */}
            <div className="px-12 py-6 flex flex-col sm:flex-row gap-4 justify-between items-center z-10 bg-black/40 border-t border-latte/5 font-outfit">
                <div className="flex items-center gap-4">
                    <button
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                        className="w-14 h-14 flex items-center justify-center rounded-xl bg-white/5 border border-latte/10 text-cream hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <button
                        onClick={nextSlide}
                        disabled={currentSlide === slides.length - 1}
                        className="btn-glow px-8 h-14 flex items-center gap-2 bg-sage text-cream font-bold rounded-xl shadow-glow-sage hover:bg-sage/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer animate-pulse-glow"
                    >
                        Next Slide
                        <ArrowRight size={20} />
                    </button>
                </div>

                <div className="text-xs md:text-sm text-latte/40 text-center sm:text-right font-medium">
                    Use <kbd className="px-2 py-1 rounded bg-white/5 border border-latte/15 font-mono text-xs">Left / Right Arrows</kbd> or <kbd className="px-2 py-1 rounded bg-white/5 border border-latte/15 font-mono text-xs">Spacebar</kbd> to control slideshow.
                </div>
            </div>

            {/* Slide Left Column: Presenter Notes Teleprompter Panel - Larger */}
            <AnimatePresence>
                {showNotes && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="px-12 py-5 bg-[#140E0C] border-t border-sage/20 text-left z-15 min-h-[16vh] flex items-center"
                    >
                        <div className="max-w-[94vw] mx-auto w-full flex items-start gap-5">
                            <div className="hidden sm:flex w-12 h-12 rounded-lg bg-sage/10 text-sage items-center justify-center flex-shrink-0 font-outfit font-bold text-sm uppercase border border-sage/10">
                                Cue
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-outfit font-bold text-sage uppercase tracking-widest">Presenter Teleprompter Script:</p>
                                <ul className="list-disc pl-5 space-y-1.5 text-sm md:text-base text-latte/80 leading-relaxed font-jakarta font-medium">
                                    {slides[currentSlide].presenterNotes.map((note, index) => (
                                        <li key={index}>{note}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
