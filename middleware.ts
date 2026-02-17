import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/middleware-utils";

export async function middleware(request: NextRequest) {
    // 1. Update Session (refresh content if needed)
    // We'll separate this logic if it gets complex, for now simple check

    const path = request.nextUrl.pathname;

    // ADMIN PROTECTION
    if (path.startsWith("/dashboard")) {
        // Allow access to login page
        if (path === "/dashboard/login") {
            return NextResponse.next();
        }

        // Check for admin cookie
        const adminSession = request.cookies.get("admin_session")?.value;

        // If no session, redirect to login
        if (!adminSession) {
            return NextResponse.redirect(new URL("/dashboard/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
