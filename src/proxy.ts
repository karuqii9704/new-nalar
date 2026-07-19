import { NextRequest, NextResponse } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

// This site is dedicated to the hackathon microsite. Every path is served from
// the /hackathon route tree via an internal rewrite (so the URL bar stays clean,
// e.g. hackathon.plusthe.site/dashboard → /hackathon/dashboard).
//
// Next.js 16 renamed the "middleware" file convention to "proxy"; this file
// keeps the exact same rewrite behavior under the new name.
// https://nextjs.org/docs/messages/middleware-to-proxy
export default function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname === "/hackathon" ||
        pathname.startsWith("/hackathon/") ||
        PUBLIC_FILE.test(pathname)
    ) {
        return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = `/hackathon${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
}

export const config = {
    matcher: ["/((?!_next|api|.*\\..*).*)"],
};
