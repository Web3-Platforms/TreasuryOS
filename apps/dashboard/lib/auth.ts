const DEFAULT_POST_LOGIN_REDIRECT_PATH = "/";
const DEFAULT_ACCESS_TOKEN_MAX_AGE_SECONDS = 8 * 60 * 60;
const INTERNAL_REDIRECT_BASE_URL = "https://dashboard.treasuryos.local";

export const ACCESS_TOKEN_COOKIE = "treasuryos_access_token";
export const CALLBACK_URL_SEARCH_PARAM = "callbackUrl";
export const REAUTH_SEARCH_PARAM = "reauth";
export const SESSION_EXPIRED_SEARCH_PARAM = "sessionExpired";

type SearchParamValue = string | readonly string[] | null | undefined;

function normalizeSearchParamValue(value: SearchParamValue): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return null;
}

export function sanitizeCallbackUrl(value: SearchParamValue): string | null {
  const normalizedValue = normalizeSearchParamValue(value)?.trim();

  if (
    !normalizedValue ||
    !normalizedValue.startsWith("/") ||
    normalizedValue.startsWith("//")
  ) {
    return null;
  }

  try {
    const url = new URL(normalizedValue, INTERNAL_REDIRECT_BASE_URL);

    if (url.origin !== INTERNAL_REDIRECT_BASE_URL) {
      return null;
    }

    if (url.pathname === "/login" || url.pathname.startsWith("/login/")) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function resolvePostLoginRedirectPath(value: SearchParamValue): string {
  return sanitizeCallbackUrl(value) ?? DEFAULT_POST_LOGIN_REDIRECT_PATH;
}

export function buildLoginUrl(
  options: {
    callbackUrl?: SearchParamValue;
    reauth?: boolean;
    sessionExpired?: boolean;
  } = {},
): string {
  const params = new URLSearchParams();
  const callbackUrl = sanitizeCallbackUrl(options.callbackUrl);

  if (callbackUrl) {
    params.set(CALLBACK_URL_SEARCH_PARAM, callbackUrl);
  }

  if (options.reauth) {
    params.set(REAUTH_SEARCH_PARAM, "1");
  }

  if (options.sessionExpired) {
    params.set(SESSION_EXPIRED_SEARCH_PARAM, "1");
  }

  const query = params.toString();
  return query.length > 0 ? `/login?${query}` : "/login";
}

export function isUnauthorizedError(error: unknown): boolean {
  const apiStatus = getApiErrorStatus(error);

  if (apiStatus === 401) {
    return true;
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  return message === "Unauthorized";
}

export function getApiErrorStatus(error: unknown): number | null {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  const match = message.match(/^API Error (\d+):/);

  if (!match) {
    return null;
  }

  const statusCode = Number.parseInt(match[1], 10);
  return Number.isFinite(statusCode) ? statusCode : null;
}

export function isRecoverableSessionProbeError(error: unknown): boolean {
  const statusCode = getApiErrorStatus(error);
  return statusCode === 429 || (statusCode !== null && statusCode >= 500);
}

export function getAccessTokenMaxAgeSeconds(): number {
  const configuredTtlMinutes = Number.parseInt(
    process.env.AUTH_TOKEN_TTL_MINUTES ?? "",
    10,
  );

  if (Number.isFinite(configuredTtlMinutes) && configuredTtlMinutes > 0) {
    return configuredTtlMinutes * 60;
  }

  return DEFAULT_ACCESS_TOKEN_MAX_AGE_SECONDS;
}
