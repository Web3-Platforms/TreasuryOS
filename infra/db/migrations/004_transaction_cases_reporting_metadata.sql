alter table transaction_cases
  add column if not exists wallet_id text references wallets(id),
  add column if not exists transaction_reference text,
  add column if not exists manual_review_requested boolean not null default false,
  add column if not exists created_by text not null default 'system',
  add column if not exists reviewed_by text,
  add column if not exists review_notes text,
  add column if not exists evidence_ref text,
  add column if not exists resolution_reason text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists transaction_cases_entity_id_created_at_idx
  on transaction_cases (entity_id, created_at desc);

alter table report_jobs
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists artifact_mime_type text,
  add column if not exists download_name text,
  add column if not exists row_count integer not null default 0;

create index if not exists report_jobs_month_created_at_idx
  on report_jobs (month, created_at desc);
