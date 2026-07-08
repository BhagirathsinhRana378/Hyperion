import { redirect } from "@workspace/i18n/navigation";

export default async function HomeRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/workspace", locale });
}
