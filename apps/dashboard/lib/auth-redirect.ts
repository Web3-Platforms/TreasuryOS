import { redirect } from "next/navigation";
import { buildLoginUrl } from "./auth";

export function redirectToLogin(
  options?: Parameters<typeof buildLoginUrl>[0],
): never {
  redirect(buildLoginUrl(options));
}

export function redirectToReauth(callbackUrl?: string | null): never {
  redirectToLogin({
    callbackUrl,
    reauth: true,
    sessionExpired: true,
  });
}
