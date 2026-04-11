import { fetchApi } from "@/lib/api-client";
import { AppShell } from "@/components/app-shell";
import { isUnauthorizedError } from "@/lib/auth";
import { redirectToReauth } from "@/lib/auth-redirect";
import type {
  AiAdvisoryEnvelope,
  ReviewedTransaction,
} from "@treasuryos/types";
import Link from "next/link";
import { TransactionReviewActions } from "@/components/transaction-review-actions";
import { TransactionAiAdvisoryPanel } from "@/components/transaction-ai-advisory-panel";

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let txCase: ReviewedTransaction | null = null;
  let aiAdvisory: AiAdvisoryEnvelope | null = null;
  let aiLoadError: string | null = null;

  const [caseResult, advisoryResult] = await Promise.allSettled([
    fetchApi<ReviewedTransaction>(`transaction-cases/${id}`, {
      next: { revalidate: 0 },
    }),
    fetchApi<AiAdvisoryEnvelope>(`ai/transaction-cases/${id}/advisory`, {
      next: { revalidate: 0 },
    }),
  ]);

  if (
    [caseResult, advisoryResult].some(
      (result) =>
        result.status === "rejected" && isUnauthorizedError(result.reason),
    )
  ) {
    redirectToReauth(`/transactions/${id}`);
  }

  if (caseResult.status === "fulfilled") {
    txCase = caseResult.value;
  } else {
    console.error(`Failed to load transaction case ${id}:`, caseResult.reason);
  }

  if (advisoryResult.status === "fulfilled") {
    aiAdvisory = advisoryResult.value;
  } else {
    console.error(
      `Failed to load AI advisory for transaction case ${id}:`,
      advisoryResult.reason,
    );
    aiLoadError = "AI advisory could not be loaded from the API.";
  }

  if (!txCase) {
    return (
      <AppShell>
        <div style={{ padding: "2rem" }}>
          <h1>Transaction Case Not Found</h1>
          <p>
            The transaction you are looking for does not exist or you do not
            have permission to view it.
          </p>
          <Link href="/transactions" style={{ color: "#0d6efd" }}>
            &larr; Back to Transactions
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={{ maxWidth: "800px" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Link
            href="/transactions"
            style={{ color: "var(--muted)", fontSize: "0.875rem" }}
          >
            ← Back to Transaction Queue
          </Link>
        </div>

        <div className="page-header">
          <div>
            <h1 className="page-title">Transaction Detail</h1>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.4rem",
                marginTop: "0.5rem",
                alignItems: "center",
              }}
            >
              <span
                className={`badge ${txCase.riskLevel === "high" ? "badge-red" : txCase.riskLevel === "medium" ? "badge-amber" : "badge-green"}`}
              >
                {txCase.riskLevel} risk
              </span>
              <span className="badge badge-gray">{txCase.caseStatus}</span>
              <span
                style={{ color: "var(--muted)", fontSize: "0.75rem" }}
                className="mono"
              >
                {txCase.id}
              </span>
            </div>
          </div>
          <TransactionReviewActions
            caseId={txCase.id}
            status={txCase.caseStatus}
          />
        </div>

        <div
          className="page-card"
          style={{ padding: "1.25rem", marginBottom: "1.25rem" }}
        >
          <h2
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--muted)",
              margin: "0 0 1rem 0",
            }}
          >
            Transaction Information
          </h2>
          <dl className="detail-grid">
            <dt className="detail-label">Reference</dt>
            <dd className="detail-value mono">{txCase.transactionReference}</dd>

            <dt className="detail-label">Amount</dt>
            <dd className="detail-value mono">
              {parseFloat(txCase.amount).toLocaleString()} {txCase.asset}
            </dd>

            <dt className="detail-label">Entity</dt>
            <dd className="detail-value mono">
              <Link
                href={`/entities/${txCase.entityId}`}
                style={{ color: "var(--accent)" }}
              >
                {txCase.entityId}
              </Link>
            </dd>

            <dt className="detail-label">Jurisdiction</dt>
            <dd className="detail-value">{txCase.jurisdiction || "Unknown"}</dd>

            <dt className="detail-label">Source Wallet</dt>
            <dd className="detail-value mono">{txCase.sourceWallet}</dd>

            <dt className="detail-label">Dest. Wallet</dt>
            <dd className="detail-value mono">{txCase.destinationWallet}</dd>

            <dt className="detail-label">Created</dt>
            <dd className="detail-value">
              {new Date(txCase.createdAt).toLocaleString()}
            </dd>
          </dl>
        </div>

        <TransactionAiAdvisoryPanel
          caseId={txCase.id}
          initialAdvisory={aiAdvisory}
          initialLoadError={aiLoadError}
        />

        <div className="page-card" style={{ padding: "1.25rem" }}>
          <h2
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--muted)",
              margin: "0 0 1rem 0",
            }}
          >
            Compliance &amp; Review Notes
          </h2>
          <dl className="detail-grid">
            <dt className="detail-label">Triggered Rules</dt>
            <dd className="detail-value mono" style={{ color: "var(--muted)" }}>
              {txCase.triggeredRules && txCase.triggeredRules.length > 0 ? (
                <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
                  {txCase.triggeredRules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              ) : (
                "None"
              )}
            </dd>

            <dt className="detail-label">Manual Review</dt>
            <dd className="detail-value">
              {txCase.manualReviewRequested ? "Yes" : "No"}
            </dd>

            {txCase.reviewedAt && (
              <>
                <dt className="detail-label">Reviewed At</dt>
                <dd className="detail-value">
                  {new Date(txCase.reviewedAt).toLocaleString()}
                </dd>
              </>
            )}

            {txCase.reviewedBy && (
              <>
                <dt className="detail-label">Reviewed By</dt>
                <dd className="detail-value">{txCase.reviewedBy}</dd>
              </>
            )}

            {txCase.notes && (
              <>
                <dt className="detail-label">Notes</dt>
                <dd
                  className="detail-value"
                  style={{ whiteSpace: "pre-wrap", color: "var(--ink)" }}
                >
                  {txCase.notes}
                </dd>
              </>
            )}

            {txCase.resolutionReason && (
              <>
                <dt className="detail-label">Resolution</dt>
                <dd
                  className="detail-value"
                  style={{ whiteSpace: "pre-wrap", color: "var(--ink)" }}
                >
                  {txCase.resolutionReason}
                </dd>
              </>
            )}
          </dl>
        </div>
      </div>
    </AppShell>
  );
}
