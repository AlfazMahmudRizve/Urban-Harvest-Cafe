import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "secret-key-change-me-in-production";
const key = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // ADMIN PROTECTION — verify JWT signature, not just cookie existence
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

        // Verify the JWT signature — rejects tampered or fake cookies
        try {
            const { payload } = await jwtVerify(adminSession, key, {
                algorithms: ["HS256"],
            });

            // Verify this is actually an admin session
            const user = payload.user as { role?: string } | undefined;
            if (!user || user.role !== "admin") {
                return NextResponse.redirect(new URL("/dashboard/login", request.url));
            }
        } catch {
            // Invalid/expired/tampered token — deny access
            const response = NextResponse.redirect(new URL("/dashboard/login", request.url));
            response.cookies.delete("admin_session");
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
