create table if not exists schema_migrations (
  id bigserial primary key,
  name text not null unique,
  applied_at timestamptz not null default now()
);

create table if not exists app_users (
  id text primary key,
  email text not null unique,
  role text not null check (role in ('admin', 'compliance_officer', 'auditor')),
  created_at timestamptz not null default now()
);

create table if not exists entities (
  id text primary key,
  legal_name text not null,
  jurisdiction text not null,
  status text not null,
  kyc_status text not null,
  risk_level text not null,
  provider text not null,
  external_user_id text not null,
  kyc_applicant_id text,
  kyc_level_name text,
  latest_kyc_review_answer text,
  notes text,
  created_by text not null,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists wallets (
  id text primary key,
  entity_id text not null references entities(id),
  wallet_address text not null unique,
  label text,
  status text not null,
  chain_sync_status text not null,
  chain_tx_signature text,
  sync_error text,
  requested_by text not null,
  reviewed_by text,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists transaction_cases (
  id text primary key,
  entity_id text not null references entities(id),
  case_status text not null,
  amount numeric(20, 2) not null,
  asset text not null,
  source_wallet text not null,
  destination_wallet text not null,
  jurisdiction text not null,
  risk_level text not null,
  triggered_rules text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists report_jobs (
  id text primary key,
  month text not null,
  status text not null,
  generated_by text not null,
  generated_at timestamptz,
  artifact_path text,
  metrics jsonb not null default '{}'::jsonb
);

create table if not exists provider_webhooks (
  id text primary key,
  entity_id text,
  provider text not null,
  payload_type text not null,
  verified boolean not null,
  digest_alg text,
  created_at timestamptz not null default now()
);

create table if not exists audit_events (
  id text primary key,
  actor_id text not null,
  actor_email text not null,
  action text not null,
  resource_type text not null,
  resource_id text not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
