import { redirect } from "@workspace/i18n/navigation";

export default async function DashboardRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/workspace", locale });
}
