import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/", "/login"];
const protectedRoutes = ["/admin", "/users"];

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isPublicRoute = publicRoutes.includes(path);

    const isProtectedRoute = protectedRoutes.some(
        (route) => path === route || path.startsWith(`${route}/`),
    );

    if (!isPublicRoute && !isProtectedRoute) {
        return NextResponse.next();
    }

    const session = request.cookies.get("session")?.value;

    if (!session) {
        if (isProtectedRoute) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        return NextResponse.next();
    }

    let isAuthenticated = false;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: {
                Cookie: `session=${session}`,
            },
            cache: "no-store",
        });

        if (response.status === 401) {
            const redirect = isProtectedRoute
                ? NextResponse.redirect(new URL("/login", request.url))
                : NextResponse.next();

            redirect.cookies.delete("session");

            return redirect;
        }

        if (!response.ok) {
            return new NextResponse("Authentication service unavailable", {
                status: 503,
            });
        }

        isAuthenticated = true;
    } catch {
        return new NextResponse("Authentication service unavailable", {
            status: 503,
        });
    }

    if (path === "/login" && isAuthenticated) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)"],
};
