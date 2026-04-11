import { fetchApi } from "@/lib/api-client";
import { AppShell } from "@/components/app-shell";
import { isUnauthorizedError } from "@/lib/auth";
import { redirectToReauth } from "@/lib/auth-redirect";
import {
  ChainSyncStatus,
  WalletStatus,
  type WalletRecord,
} from "@treasuryos/types";
import Link from "next/link";
import { WalletReviewActions } from "@/components/wallet-review-actions";

export default async function WalletDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let wallet: WalletRecord | null = null;

  try {
    wallet = await fetchApi<WalletRecord>(`wallets/${id}`);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirectToReauth(`/wallets/${id}`);
    }

    console.error(`Failed to load wallet ${id}:`, error);
  }

  if (!wallet) {
    return (
      <AppShell>
        <div style={{ padding: "2rem" }}>
          <h1>Wallet Not Found</h1>
          <p>
            The wallet you are looking for does not exist or you do not have
            permission to view it.
          </p>
          <Link href="/wallets" style={{ color: "#0d6efd" }}>
            &larr; Back to Wallets
          </Link>
        </div>
      </AppShell>
    );
  }

  const isProposalPending =
    wallet.status === WalletStatus.ProposalPending ||
    wallet.chainSyncStatus === ChainSyncStatus.ProposalPending;
  const syncStatusBackground =
    wallet.chainSyncStatus === ChainSyncStatus.Sent
      ? "#0f5132"
      : wallet.chainSyncStatus === ChainSyncStatus.ProposalPending
        ? "#5c3b00"
        : wallet.chainSyncStatus === ChainSyncStatus.Failed
          ? "#842029"
          : "#333";

  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: "800px" }}>
        <div style={{ marginBottom: "2rem" }}>
          <Link
            href="/wallets"
            style={{ color: "#aaa", textDecoration: "none" }}
          >
            &larr; Back to Wallets Queue
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h1 style={{ margin: "0 0 0.5rem 0" }}>Wallet Detail</h1>
            <div
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              <span
                style={{
                  padding: "0.25rem 0.5rem",
                  background:
                    wallet.status === WalletStatus.ProposalPending
                      ? "#5c3b00"
                      : "#333",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                }}
              >
                {wallet.status}
              </span>
              <span style={{ color: "#888", fontSize: "0.875rem" }}>
                ID: {wallet.id}
              </span>
            </div>
          </div>

          <WalletReviewActions walletId={wallet.id} status={wallet.status} />
        </div>

        <div
          style={{
            background: "#111",
            border: "1px solid #333",
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              marginTop: 0,
              marginBottom: "1rem",
              borderBottom: "1px solid #333",
              paddingBottom: "0.5rem",
            }}
          >
            Properties
          </h2>
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "1rem",
              margin: 0,
            }}
          >
            <dt style={{ color: "#aaa", fontWeight: 500 }}>Entity ID</dt>
            <dd style={{ margin: 0, fontFamily: "monospace" }}>
              <Link
                href={`/entities/${wallet.entityId}`}
                style={{ color: "#0d6efd", textDecoration: "none" }}
              >
                {wallet.entityId}
              </Link>
            </dd>

            <dt style={{ color: "#aaa", fontWeight: 500 }}>Wallet Address</dt>
            <dd
              style={{
                margin: 0,
                fontFamily: "monospace",
                wordBreak: "break-all",
              }}
            >
              {wallet.walletAddress}
            </dd>

            <dt style={{ color: "#aaa", fontWeight: 500 }}>Created At</dt>
            <dd style={{ margin: 0 }}>
              {new Date(wallet.createdAt).toLocaleString()}
            </dd>

            {wallet.reviewedAt && (
              <>
                <dt style={{ color: "#aaa", fontWeight: 500 }}>Reviewed At</dt>
                <dd style={{ margin: 0 }}>
                  {new Date(wallet.reviewedAt).toLocaleString()}
                </dd>
              </>
            )}

            {wallet.reviewedBy && (
              <>
                <dt style={{ color: "#aaa", fontWeight: 500 }}>Reviewed By</dt>
                <dd style={{ margin: 0 }}>{wallet.reviewedBy}</dd>
              </>
            )}
          </dl>
        </div>

        <div
          style={{
            background: "#111",
            border: "1px solid #333",
            borderRadius: "8px",
            padding: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              marginTop: 0,
              marginBottom: "1rem",
              borderBottom: "1px solid #333",
              paddingBottom: "0.5rem",
            }}
          >
            Solana Whitelist Sync
          </h2>
          {isProposalPending && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.875rem 1rem",
                borderRadius: "8px",
                background: "#2a1200",
                border: "1px solid #8a4b08",
                color: "#f0c36d",
              }}
            >
              This wallet is waiting for Squads multisig approval and execution.
              It should not be treated as fully synced until the proposal is
              executed on-chain.
            </div>
          )}
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "1rem",
              margin: 0,
            }}
          >
            <dt style={{ color: "#aaa", fontWeight: 500 }}>Sync Status</dt>
            <dd style={{ margin: 0 }}>
              <span
                style={{
                  padding: "0.25rem 0.5rem",
                  background: syncStatusBackground,
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                }}
              >
                {wallet.chainSyncStatus}
              </span>
            </dd>

            <dt style={{ color: "#aaa", fontWeight: 500 }}>Whitelist Entry</dt>
            <dd style={{ margin: 0, fontFamily: "monospace", color: "#888" }}>
              {wallet.whitelistEntry || "Pending approval"}
            </dd>

            <dt style={{ color: "#aaa", fontWeight: 500 }}>
              {isProposalPending ? "Proposal Reference" : "Tx Signature"}
            </dt>
            <dd
              style={{
                margin: 0,
                fontFamily: "monospace",
                color: "#888",
                wordBreak: "break-all",
              }}
            >
              {wallet.chainTxSignature || "N/A"}
            </dd>

            {wallet.syncError && (
              <>
                <dt style={{ color: "#ff4d4f", fontWeight: 500 }}>
                  Sync Error
                </dt>
                <dd style={{ margin: 0, color: "#ff4d4f" }}>
                  {wallet.syncError}
                </dd>
              </>
            )}
          </dl>
        </div>
      </div>
    </AppShell>
  );
}
