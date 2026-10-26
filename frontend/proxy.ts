import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/login"];

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isPublicRoute = publicRoutes.includes(path);

    const session = request.cookies.get("session")?.value;

    if (!session) {
        if (!isPublicRoute) {
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
            const redirect = isPublicRoute
                ? NextResponse.next()
                : NextResponse.redirect(new URL("/login", request.url));

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

    if (isPublicRoute && isAuthenticated) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)"],
};
