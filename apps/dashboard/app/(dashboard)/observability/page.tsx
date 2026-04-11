import { AppShell } from "@/components/app-shell";
import { ApiSentrySmokeTestCard } from "@/components/api-sentry-smoke-test-card";
import { SentrySmokeTestCard } from "@/components/sentry-smoke-test-card";
import { redirectToReauth } from "@/lib/auth-redirect";
import { isUnauthorizedError } from "@/lib/auth";
import { getCurrentUser } from "@/lib/current-user";
import { canAccessObservability } from "@/lib/rbac";
import type { AuthenticatedUser } from "@treasuryos/types";
import Link from "next/link";

export default async function ObservabilityPage() {
  let user: AuthenticatedUser;

  try {
    user = await getCurrentUser();
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirectToReauth("/observability");
    }

    throw error;
  }

  if (!canAccessObservability(user)) {
    return (
      <AppShell>
        <div style={{ padding: "2rem", maxWidth: "800px" }}>
          <Link href="/" style={{ color: "#aaa", textDecoration: "none" }}>
            &larr; Back to Dashboard
          </Link>

          <div
            style={{
              marginTop: "1.5rem",
              background: "#111",
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "1.5rem",
            }}
          >
            <h1 style={{ marginTop: 0 }}>Observability Access Unavailable</h1>
            <p style={{ color: "#ccc", lineHeight: 1.6, marginBottom: 0 }}>
              Only Admin accounts can send live observability smoke-test events.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div>
        <div className="page-header">
          <h1 className="page-title">Observability</h1>
        </div>

        <p
          style={{
            color: "var(--muted)",
            marginTop: 0,
            marginBottom: "1.5rem",
            fontSize: "0.92rem",
            lineHeight: 1.6,
          }}
        >
          Use this admin-only page to send deterministic frontend and backend
          Sentry events from the live platform.
        </p>

        <div style={{ display: "grid", gap: "1rem" }}>
          <SentrySmokeTestCard />
          <ApiSentrySmokeTestCard />
        </div>
      </div>
    </AppShell>
  );
}
