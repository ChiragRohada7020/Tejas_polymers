import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

/**
 * Tells the client whether the current visitor is an admin.
 *
 * The public pages deliberately do NOT read cookies() during render: doing
 * so opts the entire route out of static rendering, which is what made
 * every page return `Cache-Control: private, no-store` and forced a
 * fresh server render plus database query on each navigation.
 *
 * The admin check therefore happens in the browser instead. Editing UI
 * is only ever mounted client-side anyway, so nothing is lost.
 */
export async function GET() {
  const authenticated = await isAdminAuthenticated();
  return NextResponse.json(
    { authenticated },
    {
      // Never cache this, or a shared cache could leak admin status.
      headers: { "Cache-Control": "no-store" },
    }
  );
}