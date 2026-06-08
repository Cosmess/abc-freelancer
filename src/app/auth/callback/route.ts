import { NextResponse, type NextRequest } from "next/server";

import { syncInternalUserFromSupabaseUser } from "@/lib/auth/internal-user-store";
import { getRoleHomePath } from "@/lib/auth/paths";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function sanitizeNext(next: string | null): string {
  if (!next) return "";
  // Accept only relative paths — must start with "/" but not "//"
  // Rejects absolute URLs (https://evil.com) and scheme-relative URLs (//evil.com)
  if (!next.startsWith("/") || next.startsWith("//")) return "";
  return next;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeNext(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = await syncInternalUserFromSupabaseUser(data.user);
      return NextResponse.redirect(
        new URL(next || getRoleHomePath(user.role), requestUrl.origin),
      );
    }
  }

  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
