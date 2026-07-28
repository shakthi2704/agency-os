import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"


export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isAuthPage = req.nextUrl.pathname.startsWith("/login")
    const isApiAuth = req.nextUrl.pathname.startsWith("/api/auth")

    // Allow auth API routes through
    if (isApiAuth) return NextResponse.next()

    // Redirect to login if not logged in
    if (!isLoggedIn && !isAuthPage) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    // Redirect to dashboard if already logged in and on auth page
    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}