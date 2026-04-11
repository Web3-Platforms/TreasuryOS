"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { fetchApi } from "@/lib/api-client";
import {
  ACCESS_TOKEN_COOKIE,
  getAccessTokenMaxAgeSeconds,
  getApiErrorStatus,
  isUnauthorizedError,
} from "@/lib/auth";
import { isDemoAccessAvailable, isSumsubKycEnabled } from "@/lib/feature-flags";
import { getCurrentUser } from "@/lib/current-user";
import { canAccessObservability } from "@/lib/rbac";
import {
  type AiAdvisoryEnvelope,
  Jurisdiction,
  RiskLevel,
  type AiAdvisoryFeedbackDisposition,
  type AiAdvisoryFeedbackHelpfulness,
  type AiAdvisoryFeedbackRecord,
  type EntityRecord,
  type ReportRecord,
} from "@treasuryos/types";

type ActionResult = { success: true } | { error: string };
type CreateEntityActionResult =
  | { success: true; entityId: string }
  | { error: string };
type ScreenTransactionActionResult =
  | {
      success: true;
      caseId?: string;
      caseOpened: boolean;
      screeningDecision: string;
      transactionReference: string;
      triggeredRules: string[];
    }
  | { error: string };
type ObservabilitySmokeActionResult =
  | {
      success: true;
      eventId: string;
      requestId: string | null;
      message: string;
    }
  | { error: string };
export type GenerateReportActionResult = {
  error: string | null;
  notice: string | null;
};

const API_BASE_URL_ERROR =
  "Server misconfiguration: API_BASE_URL is not set. " +
  "Add it to your Vercel project environment variables or .env.local for local development.";
const SESSION_EXPIRED_ERROR = "Your session has expired. Please sign in again.";

async function clearAccessTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
}

async function getActionErrorMessage(error: unknown, fallback: string) {
  if (isUnauthorizedError(error)) {
    await clearAccessTokenCookie();
    return SESSION_EXPIRED_ERROR;
  }

  return error instanceof Error ? error.message : fallback;
}

function getApiErrorPayload(error: unknown): Record<string, unknown> | null {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  const match = message.match(/^API Error \d+:\s*([\s\S]+)$/);

  if (!match) {
    return null;
  }

  try {
    const parsed = JSON.parse(match[1]) as unknown;
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

async function persistAccessToken(accessToken: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getAccessTokenMaxAgeSeconds(),
  });
}

async function authenticateWithPassword(
  email: string,
  password: string,
  messages: {
    unauthorized: string;
    failed: string;
    invalidResponse: string;
  },
): Promise<ActionResult> {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    return { error: API_BASE_URL_ERROR };
  }

  let res: Response;

  try {
    res = await fetch(`${apiBaseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
  } catch (error) {
    console.error("Authentication request failed:", error);
    return { error: `${messages.failed} Network request failed.` };
  }

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Authentication failed:", res.status, errorText);

    if (res.status === 401) {
      return { error: messages.unauthorized };
    }

    return { error: `${messages.failed} API returned ${res.status}.` };
  }

  let data: { accessToken?: string };

  try {
    data = (await res.json()) as { accessToken?: string };
  } catch (error) {
    console.error("Authentication response parse failed:", error);
    return { error: messages.invalidResponse };
  }

  if (!data.accessToken) {
    return { error: messages.invalidResponse };
  }

  await persistAccessToken(data.accessToken);
  return { success: true };
}

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  return authenticateWithPassword(email, password, {
    unauthorized: "Authentication failed. Check credentials.",
    failed: "Authentication failed.",
    invalidResponse: "Invalid response from server.",
  });
}

export async function createEntityAction(
  formData: FormData,
): Promise<CreateEntityActionResult> {
  const legalName = (formData.get("legalName") as string | null)?.trim() ?? "";
  const jurisdiction = ((
    formData.get("jurisdiction") as string | null
  )?.trim() ?? Jurisdiction.EU) as Jurisdiction;
  const riskLevel = ((formData.get("riskLevel") as string | null)?.trim() ??
    RiskLevel.Medium) as RiskLevel;
  const notesValue = (formData.get("notes") as string | null)?.trim() ?? "";
  const notes = notesValue.length > 0 ? notesValue : undefined;

  if (legalName.length < 2) {
    return { error: "Legal name must be at least 2 characters long." };
  }

  if (jurisdiction !== Jurisdiction.EU) {
    return { error: "The current pilot launch only supports EU entities." };
  }

  try {
    const entity = await fetchApi<EntityRecord>("entities", {
      method: "POST",
      body: JSON.stringify({
        legalName,
        jurisdiction,
        riskLevel,
        notes,
      }),
    });

    revalidatePath("/entities");
    revalidatePath(`/entities/${entity.id}`);

    return { success: true, entityId: entity.id };
  } catch (error) {
    if (isUnauthorizedError(error)) {
      await clearAccessTokenCookie();
      return { error: SESSION_EXPIRED_ERROR };
    }

    const message =
      error instanceof Error ? error.message : "Create draft failed";

    if (message.includes("403")) {
      return { error: "You do not have permission to create entity drafts." };
    }

    if (message.includes("400")) {
      return {
        error:
          message.replace(/^API Error 400:\s*/, "") || "Create draft failed.",
      };
    }

    return { error: message };
  }
}

export async function updateEntityAction(
  entityId: string,
  formData: FormData,
): Promise<ActionResult> {
  const legalName = (formData.get("legalName") as string | null)?.trim() ?? "";
  const jurisdiction = ((
    formData.get("jurisdiction") as string | null
  )?.trim() ?? Jurisdiction.EU) as Jurisdiction;
  const riskLevel = ((formData.get("riskLevel") as string | null)?.trim() ??
    RiskLevel.Medium) as RiskLevel;
  const notes = (formData.get("notes") as string | null)?.trim() ?? "";

  if (legalName.length < 2) {
    return { error: "Legal name must be at least 2 characters long." };
  }

  if (jurisdiction !== Jurisdiction.EU) {
    return { error: "The current pilot launch only supports EU entities." };
  }

  try {
    await fetchApi<EntityRecord>(`entities/${entityId}`, {
      method: "PATCH",
      body: JSON.stringify({
        legalName,
        jurisdiction,
        notes,
        riskLevel,
      }),
    });

    revalidatePath("/entities");
    revalidatePath(`/entities/${entityId}`);
    revalidatePath("/transactions");

    return { success: true };
  } catch (error) {
    if (isUnauthorizedError(error)) {
      await clearAccessTokenCookie();
      return { error: SESSION_EXPIRED_ERROR };
    }

    const message =
      error instanceof Error ? error.message : "Update entity failed";

    if (message.includes("403")) {
      return {
        error: "You do not have permission to edit entity information.",
      };
    }

    if (message.includes("400")) {
      return {
        error:
          message.replace(/^API Error 400:\s*/, "") || "Update entity failed.",
      };
    }

    return { error: message };
  }
}

export async function demoLoginAction(): Promise<ActionResult> {
  if (!isDemoAccessAvailable()) {
    return { error: "Demo access is not available right now." };
  }

  const email = process.env.DEMO_ACCESS_EMAIL?.trim();
  const password = process.env.DEMO_ACCESS_PASSWORD;

  if (!email || !password) {
    return {
      error:
        "Server misconfiguration: DEMO_ACCESS_EMAIL and DEMO_ACCESS_PASSWORD must be set when demo access is enabled.",
    };
  }

  return authenticateWithPassword(email, password, {
    unauthorized: "Demo access is temporarily unavailable.",
    failed: "Demo access is temporarily unavailable.",
    invalidResponse: "Demo access is temporarily unavailable.",
  });
}

export async function logoutAction() {
  await clearAccessTokenCookie();
  redirect("/login");
}

export async function sendApiObservabilitySmokeTestAction(): Promise<ObservabilitySmokeActionResult> {
  try {
    const user = await getCurrentUser();

    if (!canAccessObservability(user)) {
      return {
        error: "You do not have permission to send API smoke-test events.",
      };
    }

    const result = await fetchApi<{
      eventId: string;
      requestId: string | null;
      message: string;
    }>("observability/smoke", {
      method: "POST",
    });

    return {
      success: true,
      eventId: result.eventId,
      requestId: result.requestId,
      message: result.message,
    };
  } catch (error) {
    const statusCode = getApiErrorStatus(error);
    const payload = getApiErrorPayload(error);
    const message = await getActionErrorMessage(
      error,
      "API smoke test failed.",
    );

    if (statusCode === 403) {
      return {
        error: "You do not have permission to send API smoke-test events.",
      };
    }

    if (statusCode === 503 && payload) {
      const details: string[] = [];

      if (typeof payload.eventId === "string" && payload.eventId.length > 0) {
        details.push(`Event ID: ${payload.eventId}`);
      }

      if (typeof payload.requestId === "string" && payload.requestId.length > 0) {
        details.push(`Request ID: ${payload.requestId}`);
      }

      return {
        error:
          typeof payload.message === "string"
            ? details.length > 0
              ? `${payload.message} ${details.join(" · ")}`
              : payload.message
            : message,
      };
    }

    return { error: message };
  }
}

export async function submitEntityAction(entityId: string) {
  if (!isSumsubKycEnabled()) {
    return { error: "Sumsub KYC is coming soon." };
  }

  try {
    await fetchApi(`entities/${entityId}/submit`, {
      method: "POST",
    });
    revalidatePath(`/entities/${entityId}`);
    revalidatePath("/entities");
    return { success: true };
  } catch (error) {
    console.error("Submit entity failed:", error);
    return { error: await getActionErrorMessage(error, "Submit failed") };
  }
}

export async function approveEntityAction(entityId: string) {
  try {
    await fetchApi(`entities/${entityId}/approve`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    revalidatePath(`/entities/${entityId}`);
    revalidatePath("/entities");
    return { success: true };
  } catch (error) {
    return {
      error: await getActionErrorMessage(error, "Approve action failed"),
    };
  }
}

export async function rejectEntityAction(entityId: string) {
  try {
    await fetchApi(`entities/${entityId}/reject`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    revalidatePath(`/entities/${entityId}`);
    revalidatePath("/entities");
    return { success: true };
  } catch (error) {
    return {
      error: await getActionErrorMessage(error, "Reject action failed"),
    };
  }
}

export async function requestWalletAction(
  entityId: string,
  walletAddress: string,
) {
  try {
    await fetchApi(`wallets`, {
      method: "POST",
      body: JSON.stringify({ entityId, walletAddress }),
    });
    revalidatePath(`/entities/${entityId}`);
    revalidatePath(`/wallets`);
    return { success: true };
  } catch (error) {
    return {
      error: await getActionErrorMessage(error, "Wallet request failed"),
    };
  }
}

export async function reviewWalletAction(walletId: string) {
  try {
    await fetchApi(`wallets/${walletId}/review`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    revalidatePath(`/wallets/${walletId}`);
    return { success: true };
  } catch (error) {
    return {
      error: await getActionErrorMessage(error, "Review action failed"),
    };
  }
}

export async function approveWalletAction(walletId: string) {
  try {
    await fetchApi(`wallets/${walletId}/approve`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    revalidatePath(`/wallets/${walletId}`);
    return { success: true };
  } catch (error) {
    return {
      error: await getActionErrorMessage(error, "Approve action failed"),
    };
  }
}

export async function rejectWalletAction(walletId: string) {
  try {
    await fetchApi(`wallets/${walletId}/reject`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    revalidatePath(`/wallets/${walletId}`);
    return { success: true };
  } catch (error) {
    return {
      error: await getActionErrorMessage(error, "Reject action failed"),
    };
  }
}

export async function reviewTransactionAction(caseId: string) {
  try {
    await fetchApi(`transaction-cases/${caseId}/review`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    revalidatePath(`/transactions`);
    revalidatePath(`/transactions/${caseId}`);
    return { success: true };
  } catch (error) {
    return {
      error: await getActionErrorMessage(error, "Review action failed"),
    };
  }
}

export async function approveTransactionAction(caseId: string, notes: string) {
  try {
    await fetchApi(`transaction-cases/${caseId}/approve`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    });
    revalidatePath(`/transactions`);
    revalidatePath(`/transactions/${caseId}`);
    return { success: true };
  } catch (error) {
    return {
      error: await getActionErrorMessage(error, "Approve action failed"),
    };
  }
}

export async function rejectTransactionAction(caseId: string, notes: string) {
  try {
    await fetchApi(`transaction-cases/${caseId}/reject`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    });
    revalidatePath(`/transactions`);
    revalidatePath(`/transactions/${caseId}`);
    return { success: true };
  } catch (error) {
    return {
      error: await getActionErrorMessage(error, "Reject action failed"),
    };
  }
}

export async function escalateTransactionAction(caseId: string, notes: string) {
  try {
    await fetchApi(`transaction-cases/${caseId}/escalate`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    });
    revalidatePath(`/transactions`);
    revalidatePath(`/transactions/${caseId}`);
    return { success: true };
  } catch (error) {
    return {
      error: await getActionErrorMessage(error, "Escalate action failed"),
    };
  }
}

export async function submitAiAdvisoryFeedbackAction(
  advisoryId: string,
  caseId: string,
  input: {
    helpfulness: AiAdvisoryFeedbackHelpfulness;
    disposition: AiAdvisoryFeedbackDisposition;
    note?: string;
  },
): Promise<ActionResult> {
  try {
    await fetchApi<AiAdvisoryFeedbackRecord>(
      `ai/advisories/${advisoryId}/feedback`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
    revalidatePath(`/transactions/${caseId}`);
    return { success: true };
  } catch (error) {
    return {
      error: await getActionErrorMessage(error, "AI feedback action failed"),
    };
  }
}

export async function generateTransactionCaseAdvisoryAction(
  caseId: string,
): Promise<AiAdvisoryEnvelope | { error: string }> {
  try {
    const advisory = await fetchApi<AiAdvisoryEnvelope>(
      `ai/transaction-cases/${caseId}/advisory`,
      {
        method: "POST",
      },
    );
    revalidatePath(`/transactions/${caseId}`);
    return advisory;
  } catch (error) {
    return {
      error: await getActionErrorMessage(error, "AI advisory action failed"),
    };
  }
}

export async function screenTransactionAction(input: {
  amount: number;
  asset: string;
  destinationWallet: string;
  entityId: string;
  manualReviewRequested?: boolean;
  notes?: string;
  referenceId?: string;
  sourceWallet: string;
  walletId: string;
}): Promise<ScreenTransactionActionResult> {
  try {
    const response = await fetchApi<{
      case?: { id: string; transactionReference: string };
      caseOpened: boolean;
      screeningDecision: string;
      transactionReference?: string;
      triggeredRules?: string[];
    }>("transaction-cases", {
      method: "POST",
      body: JSON.stringify(input),
    });

    revalidatePath("/transactions");

    if (response.case?.id) {
      revalidatePath(`/transactions/${response.case.id}`);
    }

    return {
      success: true,
      caseId: response.case?.id,
      caseOpened: response.caseOpened,
      screeningDecision: response.screeningDecision,
      transactionReference:
        response.case?.transactionReference ??
        response.transactionReference ??
        input.referenceId ??
        "",
      triggeredRules: Array.isArray(response.triggeredRules)
        ? response.triggeredRules
        : [],
    };
  } catch (error) {
    return {
      error: await getActionErrorMessage(error, "Transaction screening failed"),
    };
  }
}

export async function generateReportAction(
  _previousState: GenerateReportActionResult,
  formData: FormData,
): Promise<GenerateReportActionResult> {
  const month = (formData.get("month") as string | null)?.trim() ?? "";

  if (!month) {
    return {
      error: "Select a reporting month first.",
      notice: null,
    };
  }

  try {
    const report = await fetchApi<ReportRecord>(`reports`, {
      method: "POST",
      body: JSON.stringify({ month }),
    });
    revalidatePath(`/reports`);

    return {
      error: null,
      notice: `Report for ${report.month} is available below.`,
    };
  } catch (error) {
    if (isUnauthorizedError(error)) {
      await clearAccessTokenCookie();
      return {
        error: SESSION_EXPIRED_ERROR,
        notice: null,
      };
    }

    const message =
      error instanceof Error ? error.message : "Generate report failed";

    if (message.includes("403")) {
      return {
        error: "Your account is not allowed to generate reports.",
        notice: null,
      };
    }

    return {
      error: message,
      notice: null,
    };
  }
}
