import { fetchApi } from "@/lib/api-client";
import { AppShell } from "@/components/app-shell";
import { isUnauthorizedError } from "@/lib/auth";
import { redirectToReauth } from "@/lib/auth-redirect";
import { isSumsubKycEnabled } from "@/lib/feature-flags";
import { getCurrentUser } from "@/lib/current-user";
import { canCreateEntityDraft } from "@/lib/rbac";
import type { AuthenticatedUser, EntityRecord } from "@treasuryos/types";
import Link from "next/link";

export default async function EntitiesPage() {
  const sumsubEnabled = isSumsubKycEnabled();
  let user: AuthenticatedUser;
  let entities: EntityRecord[] = [];

  try {
    user = await getCurrentUser();
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirectToReauth("/entities");
    }

    throw error;
  }

  try {
    const data = await fetchApi<{ entities: EntityRecord[] }>("entities");
    entities = data.entities;
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirectToReauth("/entities");
    }

    console.error("Failed to load entities:", error);
  }

  const canCreateDraft = canCreateEntityDraft(user);

  return (
    <AppShell>
      <div>
        <div className="page-header">
          <h1 className="page-title">Entity Review Queue</h1>
          {canCreateDraft ? (
            <Link href="/entities/new" className="btn btn-primary">
              New Draft
            </Link>
          ) : null}
        </div>

        {!sumsubEnabled && (
          <div className="alert alert-warning">
            Sumsub KYC is coming soon. Draft entities can still be created, but
            KYC submission is temporarily disabled.
          </div>
        )}

        <div className="page-card table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Legal Name</th>
                <th>Jurisdiction</th>
                <th>Status</th>
                <th>KYC</th>
                <th>Risk</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {entities.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      color: "var(--muted)",
                    }}
                  >
                    {canCreateDraft ? (
                      <>
                        No entities found.{" "}
                        <Link
                          href="/entities/new"
                          style={{ color: "var(--accent)" }}
                        >
                          Create the first draft.
                        </Link>
                      </>
                    ) : (
                      "No entities found in the system."
                    )}
                  </td>
                </tr>
              ) : (
                entities.map((entity) => {
                  const showComingSoonKyc =
                    !sumsubEnabled &&
                    !entity.kycApplicantId &&
                    entity.status === "draft";
                  return (
                    <tr key={entity.id}>
                      <td>
                        <Link
                          href={`/entities/${entity.id}`}
                          style={{ color: "var(--ink)", fontWeight: 500 }}
                        >
                          {entity.legalName}
                        </Link>
                      </td>
                      <td style={{ color: "var(--muted)" }}>
                        {entity.jurisdiction}
                      </td>
                      <td>
                        <span
                          className={`badge ${entity.status === "approved" ? "badge-green" : entity.status === "rejected" ? "badge-red" : "badge-gray"}`}
                        >
                          {entity.status}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${showComingSoonKyc ? "badge-amber" : entity.kycStatus === "Approved" ? "badge-green" : entity.kycStatus === "Rejected" ? "badge-red" : "badge-gray"}`}
                        >
                          {showComingSoonKyc ? "Coming soon" : entity.kycStatus}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${entity.riskLevel === "high" ? "badge-red" : entity.riskLevel === "medium" ? "badge-amber" : "badge-gray"}`}
                        >
                          {entity.riskLevel}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Link
                          href={`/entities/${entity.id}`}
                          style={{
                            color: "var(--accent)",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                          }}
                        >
                          Review →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
