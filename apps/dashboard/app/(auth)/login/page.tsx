import { LoginForm } from "@/components/login-form";
import { AppShell } from "@/components/app-shell";
import {
  isRecoverableSessionProbeError,
  isUnauthorizedError,
  resolvePostLoginRedirectPath,
} from "@/lib/auth";
import { isDemoAccessAvailable } from "@/lib/feature-flags";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

type LoginPageSearchParams = Promise<{
  callbackUrl?: string | string[];
}>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: LoginPageSearchParams;
}) {
  const { callbackUrl } = await searchParams;

  try {
    await getCurrentUser();
    redirect(resolvePostLoginRedirectPath(callbackUrl));
  } catch (error) {
    if (!isUnauthorizedError(error) && !isRecoverableSessionProbeError(error)) {
      throw error;
    }
  }

  return (
    <AppShell showAuthenticatedNav={false}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <LoginForm showDemoAccess={isDemoAccessAvailable()} />
      </div>
    </AppShell>
  );
}
