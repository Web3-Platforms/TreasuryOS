import { ReactNode } from "react";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth";
import { NavSidebar } from "./nav-sidebar";
import { LogoutButton } from "./logout-button";

export async function AppShell({
  children,
  showAuthenticatedNav = true,
}: {
  children: ReactNode;
  showAuthenticatedNav?: boolean;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const hasToken = showAuthenticatedNav && !!token;

  return (
    <div className="app-shell">
      <NavSidebar
        hasToken={hasToken}
        logoutSlot={hasToken ? <LogoutButton /> : undefined}
      />
      <main className="app-shell__content">{children}</main>
    </div>
  );
}
