import createMiddleware from "@workspace/i18n/middleware";
import { routing } from "@workspace/i18n/routing";

// `localePrefix: "as-needed"` keeps the default locale (en) out of the
// URL — `/services` instead of `/en/services` — while still serving the
// `app/[locale]` tree via an internal rewrite. Overridden here rather
// than in @workspace/i18n because the native app's static export
// depends on prefixed `/en/...` paths.
const intlMiddleware = createMiddleware({
  ...routing,
  localePrefix: "as-needed",
});

export default function proxy(request: import("next/server").NextRequest) {
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|serwist|~offline|.*\\..*).*)",
};
