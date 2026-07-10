import { siteConfig } from "@workspace/core/config/site";
import { themeInitScript } from "@workspace/core/scripts/theme-init";
import { hasLocale, messages, NextIntlClientProvider } from "@workspace/i18n";
import { routing } from "@workspace/i18n/routing";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { AppLayout } from "./components/app-layout";
import "@workspace/ui/globals.css";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Get messages for the current locale (client-side loading for Tauri)
  const localeMessages = messages[locale as keyof typeof messages];

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Geist+Mono:wght@100..900&family=Geist:wght@100..900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted script
          dangerouslySetInnerHTML={{
            __html: themeInitScript,
          }}
        />
      </head>
      <body className="font-sans overflow-hidden antialiased">
        <NextIntlClientProvider
          locale={locale}
          messages={localeMessages}
          timeZone="UTC"
        >
          <AppLayout>{children}</AppLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
