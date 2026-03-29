"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useCartStore } from "@/lib/store/cartStore";

export default function TableQRListener() {
    const searchParams = useSearchParams();
    const setScannedTableNumber = useCartStore((s) => s.setScannedTableNumber);

    useEffect(() => {
        const table = searchParams.get("table");
        if (table) {
            setScannedTableNumber(table);
            console.log(`📱 QR Scanned — Table ${table} locked`);
        }
    }, [searchParams, setScannedTableNumber]);

    return null; // Invisible component
}
