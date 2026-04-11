import { fetchApi } from "@/lib/api-client";
import { AppShell } from "@/components/app-shell";
import { isUnauthorizedError } from "@/lib/auth";
import { redirectToReauth } from "@/lib/auth-redirect";
import {
  EntityStatus,
  KycStatus,
  WalletStatus,
  type EntityRecord,
  type ReviewedTransaction,
  type WalletRecord,
} from "@treasuryos/types";
import Link from "next/link";
import { ScreenTransactionForm } from "@/components/screen-transaction-form";

export default async function TransactionsPage() {
  let cases: ReviewedTransaction[] = [];
  let queueLoadError: string | null = null;
  let screeningLoadError: string | null = null;
  let screeningEntities: Array<{
    id: string;
    legalName: string;
    wallets: Array<{
      id: string;
      status: WalletRecord["status"];
      walletAddress: string;
    }>;
  }> = [];

  const [casesResult, entitiesResult, walletsResult] = await Promise.allSettled(
    [
      fetchApi<{ cases: ReviewedTransaction[] }>("transaction-cases", {
        next: { revalidate: 0 },
      }),
      fetchApi<{ entities: EntityRecord[] }>("entities", {
        next: { revalidate: 0 },
      }),
      fetchApi<{ wallets: WalletRecord[] }>("wallets", {
        next: { revalidate: 0 },
      }),
    ],
  );

  if (
    [casesResult, entitiesResult, walletsResult].some(
      (result) =>
        result.status === "rejected" && isUnauthorizedError(result.reason),
    )
  ) {
    redirectToReauth("/transactions");
  }

  if (casesResult.status === "fulfilled") {
    cases = casesResult.value.cases || [];
  } else {
    console.error("Failed to load transaction cases:", casesResult.reason);
    queueLoadError = "Transaction cases could not be loaded from the API.";
  }

  if (
    entitiesResult.status === "fulfilled" &&
    walletsResult.status === "fulfilled"
  ) {
    const entities = entitiesResult.value.entities || [];
    const wallets = walletsResult.value.wallets || [];

    screeningEntities = entities
      .filter(
        (entity) =>
          entity.status === EntityStatus.Approved &&
          entity.kycStatus === KycStatus.Approved,
      )
      .map((entity) => ({
        id: entity.id,
        legalName: entity.legalName,
        wallets: wallets
          .filter(
            (wallet) =>
              wallet.entityId === entity.id &&
              (wallet.status === WalletStatus.Approved ||
                wallet.status === WalletStatus.Synced),
          )
          .map((wallet) => ({
            id: wallet.id,
            status: wallet.status,
            walletAddress: wallet.walletAddress,
          })),
      }))
      .filter((entity) => entity.wallets.length > 0);
  } else {
    console.error("Failed to load transaction screening options:", {
      entitiesError:
        entitiesResult.status === "rejected" ? entitiesResult.reason : null,
      walletsError:
        walletsResult.status === "rejected" ? walletsResult.reason : null,
    });
    screeningLoadError = "Transaction screening options could not be loaded.";
  }

  return (
    <AppShell>
      <div>
        <div className="page-header">
          <h1 className="page-title">Transaction Case Queue</h1>
        </div>
        <p
          style={{
            marginTop: 0,
            marginBottom: "1.5rem",
            color: "var(--muted)",
            maxWidth: "52rem",
            fontSize: "0.875rem",
          }}
        >
          This queue shows only screened transactions that triggered review
          rules or were explicitly marked for manual review. Cleared screenings
          do not appear here.
        </p>

        {screeningLoadError ? (
          <div
            className="alert alert-warning"
            style={{ marginBottom: "1.5rem" }}
          >
            {screeningLoadError}
          </div>
        ) : screeningEntities.length > 0 ? (
          <ScreenTransactionForm entities={screeningEntities} />
        ) : (
          <div
            className="page-card"
            style={{
              padding: "1.25rem",
              marginBottom: "1.5rem",
              color: "var(--muted)",
              fontSize: "0.875rem",
            }}
          >
            No approved or synced entity wallets are available for screening
            yet. Approve an entity and wallet first, then return here to open
            transaction review cases.
          </div>
        )}

        {queueLoadError ? (
          <div className="alert alert-warning">{queueLoadError}</div>
        ) : cases.length === 0 ? (
          <div
            className="page-card"
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "0.875rem",
            }}
          >
            No transaction cases are waiting for review right now. Screen a
            transaction above to open a case when a rule triggers, or use manual
            review to force one into the queue.
          </div>
        ) : (
          <div className="page-card table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Entity</th>
                  <th>Amount</th>
                  <th>Risk</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((txCase) => (
                  <tr key={txCase.id}>
                    <td className="mono">
                      {txCase.transactionReference || txCase.id.split("-")[0]}
                    </td>
                    <td className="mono">
                      <Link
                        href={`/entities/${txCase.entityId}`}
                        style={{ color: "var(--accent)" }}
                      >
                        {txCase.entityId.substring(0, 8)}…
                      </Link>
                    </td>
                    <td className="mono">
                      {parseFloat(txCase.amount).toLocaleString()}{" "}
                      {txCase.asset}
                    </td>
                    <td>
                      <span
                        className={`badge ${txCase.riskLevel === "high" ? "badge-red" : txCase.riskLevel === "medium" ? "badge-amber" : "badge-green"}`}
                      >
                        {txCase.riskLevel}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${txCase.caseStatus === "approved" ? "badge-green" : txCase.caseStatus === "rejected" ? "badge-red" : txCase.caseStatus === "under_review" ? "badge-blue" : "badge-gray"}`}
                      >
                        {txCase.caseStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={`/transactions/${txCase.id}`}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
