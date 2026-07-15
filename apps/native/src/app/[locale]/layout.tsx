import { messages, NextIntlClientProvider } from "@workspace/i18n";
import { routing } from "@workspace/i18n/routing";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    console.log("INVALID LOCALE", locale);
    notFound();
  }

  // Get messages for the current locale (client-side loading for Tauri)
  const localeMessages = messages[locale as keyof typeof messages];

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={localeMessages}
      timeZone="UTC"
    >
      {children}
    </NextIntlClientProvider>
  );
}
