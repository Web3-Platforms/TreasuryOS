alter table ai_advisories
  add column if not exists provider text not null default 'deterministic',
  add column if not exists prompt_version text not null default 'deterministic-tx-case-v1',
  add column if not exists fallback_used boolean not null default false,
  add column if not exists provider_latency_ms integer;

create table if not exists ai_feedback (
  id text primary key,
  advisory_id text not null references ai_advisories(id) on delete cascade,
  advisory_type text not null,
  resource_type text not null,
  resource_id text not null,
  actor_id text not null,
  actor_email text not null,
  helpfulness text not null check (helpfulness in ('helpful', 'not_helpful')),
  disposition text not null check (disposition in ('accepted', 'edited', 'dismissed')),
  note text,
  advisory_source_hash text not null,
  advisory_provider text not null,
  advisory_model text not null,
  advisory_prompt_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (
    advisory_id,
    actor_id,
    advisory_source_hash,
    advisory_provider,
    advisory_model,
    advisory_prompt_version
  )
);

create index if not exists ai_feedback_resource_created_at_idx
  on ai_feedback (resource_type, resource_id, created_at desc);
