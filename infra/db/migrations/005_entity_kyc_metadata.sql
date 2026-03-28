alter table entities
  add column if not exists kyc_correlation_id text,
  add column if not exists latest_kyc_webhook_type text,
  add column if not exists last_kyc_event_at timestamptz;

create unique index if not exists entities_external_user_id_uidx
  on entities (external_user_id);

create index if not exists entities_kyc_applicant_id_idx
  on entities (kyc_applicant_id);

alter table provider_webhooks
  add column if not exists applicant_id text,
  add column if not exists correlation_id text,
  add column if not exists event_created_at timestamptz,
  add column if not exists external_user_id text,
  add column if not exists payload_digest text,
  add column if not exists review_answer text,
  add column if not exists review_status text;

create unique index if not exists provider_webhooks_payload_digest_uidx
  on provider_webhooks (payload_digest)
  where payload_digest is not null;

create unique index if not exists provider_webhooks_correlation_payload_type_uidx
  on provider_webhooks (correlation_id, payload_type)
  where correlation_id is not null;
