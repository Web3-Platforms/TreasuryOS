create table if not exists ai_advisories (
  id text primary key,
  advisory_type text not null,
  resource_type text not null,
  resource_id text not null,
  summary text not null,
  recommendation text,
  risk_factors text[] not null default '{}',
  checklist text[] not null default '{}',
  confidence numeric(4, 2),
  model text not null,
  redaction_profile text not null,
  source_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (advisory_type, resource_type, resource_id)
);

create index if not exists ai_advisories_resource_updated_at_idx
  on ai_advisories (resource_type, resource_id, updated_at desc);
