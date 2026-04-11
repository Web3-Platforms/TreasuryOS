"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";

type SendState = "idle" | "sending" | "sent" | "failed";

export function SentrySmokeTestCard() {
  const [sendState, setSendState] = useState<SendState>("idle");
  const [eventId, setEventId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSendTestEvent() {
    setSendState("sending");
    setEventId(null);
    setMessage(null);

    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      setSendState("failed");
      setMessage("This build does not include NEXT_PUBLIC_SENTRY_DSN.");
      return;
    }

    try {
      const capturedEventId =
        Sentry.withScope((scope) => {
          scope.setTag("surface", "dashboard");
          scope.setTag("smoke_test", "true");
          scope.setContext("treasuryos_smoke_test", {
            source: "dashboard_observability_page",
          });

          const error = new Error(
            `TreasuryOS dashboard Sentry smoke test (${new Date().toISOString()})`,
          );
          error.name = "TreasuryOsDashboardSentrySmokeTest";

          return Sentry.captureException(error);
        }) ?? null;

      const flushed = await Sentry.flush(2000);

      if (!flushed) {
        setSendState("failed");
        setMessage(
          "Sentry accepted the event locally but did not flush it in time. Check the tunnel route or DSN.",
        );
        return;
      }

      setEventId(capturedEventId);
      setSendState("sent");
      setMessage(
        "Frontend test event submitted. Check Sentry for issue name TreasuryOsDashboardSentrySmokeTest.",
      );
    } catch (error) {
      console.error("Failed to send Sentry smoke test event", error);
      setSendState("failed");
      setMessage(
        error instanceof Error ? error.message : "Unknown Sentry submission error.",
      );
    }
  }

  const isSending = sendState === "sending";

  return (
    <div className="page-card" style={{ padding: "1.5rem" }}>
      <div className="page-header" style={{ marginBottom: "1rem" }}>
        <h2 className="page-title" style={{ fontSize: "1.1rem", margin: 0 }}>
          Frontend Sentry Smoke Test
        </h2>
      </div>

      <p
        style={{
          color: "var(--muted)",
          marginTop: 0,
          marginBottom: "1rem",
          fontSize: "0.9rem",
          lineHeight: 1.6,
        }}
      >
        This sends a tagged browser-side exception from the live dashboard so you
        can confirm Sentry ingestion without waiting for sampled traffic.
      </p>

      <button
        type="button"
        onClick={handleSendTestEvent}
        disabled={isSending}
        style={{
          padding: "0.75rem 1rem",
          borderRadius: "8px",
          border: "1px solid #2f6fed",
          background: isSending ? "#274472" : "#0d6efd",
          color: "white",
          fontWeight: 700,
          cursor: isSending ? "not-allowed" : "pointer",
        }}
      >
        {isSending ? "Sending..." : "Send frontend test event"}
      </button>

      {message && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.85rem 1rem",
            borderRadius: "10px",
            border:
              sendState === "failed"
                ? "1px solid #ff4d4f"
                : "1px solid rgba(19, 194, 194, 0.35)",
            background:
              sendState === "failed"
                ? "rgba(255, 77, 79, 0.08)"
                : "rgba(19, 194, 194, 0.08)",
            color: sendState === "failed" ? "#ffb3b3" : "#c8fff4",
            fontSize: "0.875rem",
            lineHeight: 1.5,
          }}
        >
          <div>{message}</div>
          {eventId && (
            <div className="mono" style={{ marginTop: "0.5rem" }}>
              Event ID: {eventId}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          marginTop: "1rem",
          color: "var(--muted)",
          fontSize: "0.82rem",
          lineHeight: 1.6,
        }}
      >
        Expected tags: <span className="mono">surface=dashboard</span>,{" "}
        <span className="mono">smoke_test=true</span>
      </div>
    </div>
  );
}
