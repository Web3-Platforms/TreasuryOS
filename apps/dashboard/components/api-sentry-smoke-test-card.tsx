"use client";

import { useState } from "react";
import { sendApiObservabilitySmokeTestAction } from "../app/actions";

type SendState = "idle" | "sending" | "sent" | "failed";

export function ApiSentrySmokeTestCard() {
  const [sendState, setSendState] = useState<SendState>("idle");
  const [eventId, setEventId] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSendTestEvent() {
    setSendState("sending");
    setEventId(null);
    setRequestId(null);
    setMessage(null);

    try {
      const result = await sendApiObservabilitySmokeTestAction();

      if ("error" in result) {
        setSendState("failed");
        setMessage(result.error);
        return;
      }

      setSendState("sent");
      setEventId(result.eventId);
      setRequestId(result.requestId);
      setMessage(result.message);
    } catch (error) {
      console.error("Failed to send API Sentry smoke test event", error);
      setSendState("failed");
      setMessage(
        error instanceof Error ? error.message : "Unknown API smoke-test error.",
      );
    }
  }

  const isSending = sendState === "sending";

  return (
    <div className="page-card" style={{ padding: "1.5rem" }}>
      <div className="page-header" style={{ marginBottom: "1rem" }}>
        <h2 className="page-title" style={{ fontSize: "1.1rem", margin: 0 }}>
          API Sentry Smoke Test
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
        This sends a tagged backend exception from the live API gateway through
        an admin-only endpoint.
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
        {isSending ? "Sending..." : "Send API test event"}
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
          {requestId && (
            <div className="mono" style={{ marginTop: "0.5rem" }}>
              Request ID: {requestId}
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
        Expected tags: <span className="mono">surface=api</span>,{" "}
        <span className="mono">smoke_test=true</span>
      </div>
    </div>
  );
}
