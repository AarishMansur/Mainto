import { NextRequest, NextResponse } from "next/server";
import { validatePreviewUrl } from "@sanity/preview-url-secret";
import { client } from "@/sanity/lib/client";

export async function GET(request: NextRequest) {
  const { isValid, redirectTo } = await validatePreviewUrl(
    client.withConfig({ token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN }),
    request.url
  );

  if (!isValid) {
    return new Response("Invalid secret", { status: 401 });
  }

  const draftMode = await import("next/headers").then((m) => m.draftMode());
  draftMode.enable();

  return NextResponse.redirect(new URL(redirectTo || "/", request.url));
}
