import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession, withAuth } from "@kinde-oss/kinde-auth-nextjs/server";

async function existingMiddleware(req: NextRequest) {
  const { getClaim } = getKindeServerSession();
  const orgCode = await getClaim("org_code");

  const url = req.nextUrl;
  if (
    url.pathname.startsWith("/workspace") &&
    !url.pathname.includes(orgCode?.value || "")
  ) {
    url.pathname = `/workspace/${orgCode?.value}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export default withAuth(existingMiddleware, {
  publicPaths: ["/", "/api/uploadthing"],
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|/rpc).*)"],
};