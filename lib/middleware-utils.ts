import { NextRequest, NextResponse } from "next/server";

// Helper to update session expiration if we want sliding sessions later
export async function updateSession(request: NextRequest) {
    return NextResponse.next({
        request: {
            headers: request.headers,
        },
    });
}
