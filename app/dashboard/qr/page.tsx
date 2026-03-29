"use client";

import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, Plus, Minus, QrCode, Download } from "lucide-react";

export default function QRGeneratorPage() {
    const [tableCount, setTableCount] = useState(10);
    const [baseUrl, setBaseUrl] = useState("https://urbanharvest.cafe");
    const printRef = useRef<HTMLDivElement>(null);

    const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Controls — hidden when printing */}
            <div className="print:hidden mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <QrCode className="text-orange-600" size={28} />
                    <h1 className="text-2xl font-bold font-heading text-espresso">Table QR Generator</h1>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-espresso mb-2">Base URL</label>
                        <input
                            type="url"
                            value={baseUrl}
                            onChange={(e) => setBaseUrl(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-espresso focus:border-transparent outline-none bg-gray-50 font-mono text-sm"
                            placeholder="https://your-domain.com"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Each QR code will link to <span className="font-mono">{baseUrl}/?table=N</span>
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-espresso mb-2">Number of Tables</label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setTableCount(Math.max(1, tableCount - 1))}
                                className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                <Minus size={16} />
                            </button>
                            <input
                                type="number"
                                value={tableCount}
                                onChange={(e) => setTableCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                                className="w-20 text-center p-2 border border-gray-200 rounded-xl font-bold text-lg"
                                min={1}
                                max={50}
                            />
                            <button
                                onClick={() => setTableCount(Math.min(50, tableCount + 1))}
                                className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-3 bg-espresso text-cream rounded-xl font-bold hover:bg-espresso/90 transition-colors shadow-lg"
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
                    const url = `${baseUrl}/?table=${tableNum}`;
                    return (
                        <div
                            key={tableNum}
                            className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center gap-4 shadow-sm print:shadow-none print:border print:rounded-lg print:p-4 break-inside-avoid"
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
                            <p className="text-xs text-gray-400 font-mono truncate max-w-full print:text-[10px]">
                                {url}
                            </p>
                            <p className="text-xs text-gray-500 font-bold print:text-[10px]">
                                Scan to order from Table {tableNum}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
