import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell/app-shell";
import { getSessionUser } from "@/features/auth/current-user";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
