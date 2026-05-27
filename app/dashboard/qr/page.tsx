"use client";

import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, Plus, Minus, QrCode, Download } from "lucide-react";

export default function QRGeneratorPage() {
    const [tableCount, setTableCount] = useState(10);
    const [baseUrl, setBaseUrl] = useState("https://urbanharvest.cafe");
    const [qrTarget, setQrTarget] = useState<'browser' | 'telegram'>('browser');
    const printRef = useRef<HTMLDivElement>(null);

    const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-300">
            {/* Controls — hidden when printing */}
            <div className="print:hidden mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-orange-50 p-2 rounded-xl border border-orange-100/50 text-orange-600 shadow-sm">
                        <QrCode size={28} />
                    </div>
                    <h1 className="text-2xl font-bold font-heading text-espresso">Table QR Generator</h1>
                </div>

                <div className="glass-card rounded-2xl border border-latte/15 p-6 shadow-md space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-espresso mb-2">Base URL</label>
                        <input
                            type="url"
                            value={baseUrl}
                            onChange={(e) => setBaseUrl(e.target.value)}
                            className="w-full p-3 border border-latte/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent outline-none bg-white text-espresso font-mono text-sm transition-shadow duration-200"
                            placeholder="https://your-domain.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-espresso mb-2">QR Code Destination</label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setQrTarget('browser')}
                                className={`flex-1 p-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                                    qrTarget === 'browser'
                                        ? "bg-espresso text-cream border-espresso shadow-md"
                                        : "bg-cream-warm/50 text-espresso/70 border-latte/15 hover:bg-latte-light/40"
                                }`}
                            >
                                🌐 Open Web Browser
                            </button>
                            <button
                                type="button"
                                onClick={() => setQrTarget('telegram')}
                                className={`flex-1 p-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                                    qrTarget === 'telegram'
                                        ? "bg-espresso text-cream border-espresso shadow-md"
                                        : "bg-cream-warm/50 text-espresso/70 border-latte/15 hover:bg-latte-light/40"
                                }`}
                            >
                                💬 Open Telegram Bot
                            </button>
                        </div>
                        <p className="text-xs text-espresso/45 mt-2 font-medium">
                            {qrTarget === 'telegram' ? (
                                <span>Each QR code will trigger a deep link: <span className="font-mono text-sage">https://t.me/Urban_cafe_bot?start=table_N</span></span>
                            ) : (
                                <span>Each QR code will open the storefront: <span className="font-mono">{baseUrl}/?table=N</span></span>
                            )}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-espresso mb-2">Number of Tables</label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setTableCount(Math.max(1, tableCount - 1))}
                                className="w-10 h-10 flex items-center justify-center bg-cream-warm hover:bg-latte-light text-espresso border border-latte/15 rounded-xl transition-all cursor-pointer"
                            >
                                <Minus size={16} />
                            </button>
                            <input
                                type="number"
                                value={tableCount}
                                onChange={(e) => setTableCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                                className="w-20 text-center p-2 border border-latte/15 bg-white text-espresso rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-shadow duration-200"
                                min={1}
                                max={50}
                            />
                            <button
                                onClick={() => setTableCount(Math.min(50, tableCount + 1))}
                                className="w-10 h-10 flex items-center justify-center bg-cream-warm hover:bg-latte-light text-espresso border border-latte/15 rounded-xl transition-all cursor-pointer"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handlePrint}
                        className="btn-glow flex items-center gap-2 px-6 py-3.5 bg-sage text-cream rounded-xl font-bold hover:bg-sage/90 transition-all shadow-glow-sage cursor-pointer active:scale-95"
                    >
                        <Printer size={18} />
                        Print All QR Codes
                    </button>
                </div>
            </div>

            {/* QR Code Grid — print-friendly */}
            <div
                ref={printRef}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:grid-cols-3 print:gap-4"
            >
                {tables.map((tableNum) => {
                    const url = qrTarget === 'telegram'
                        ? `https://t.me/Urban_cafe_bot?start=table_${tableNum}`
                        : `${baseUrl}/?table=${tableNum}`;
                    return (
                        <div
                            key={tableNum}
                            className="bg-white rounded-2xl border border-latte/15 p-6 flex flex-col items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-300 print:shadow-none print:border print:rounded-lg print:p-4 break-inside-avoid"
                        >
                            <div className="bg-espresso text-cream px-4 py-1.5 rounded-full text-sm font-bold print:bg-black print:text-white">
                                Table {tableNum}
                            </div>
                            <QRCodeSVG
                                value={url}
                                size={160}
                                level="H"
                                includeMargin
                                bgColor="#FFFFFF"
                                fgColor="#2C1810"
                            />
                            <p className="text-xs text-espresso/40 font-mono truncate max-w-full print:text-[10px]">
                                {url}
                            </p>
                            <p className="text-xs text-espresso/60 font-bold print:text-[10px]">
                                {qrTarget === 'telegram' ? `Scan to order via Telegram Bot` : `Scan to order from Table ${tableNum}`}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
