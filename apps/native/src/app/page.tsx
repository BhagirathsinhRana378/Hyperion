import { routing } from "@workspace/i18n/routing";
import { redirect } from "next/navigation";

// Required root page — immediately redirects to the default locale.
// The [locale]/layout.tsx handles the actual <html>/<body> shell.
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
