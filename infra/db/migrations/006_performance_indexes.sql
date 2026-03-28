-- Performance Indexes for TreasuryOS Production Readiness

-- Wallets lookups by entity and status
create index if not exists wallets_entity_id_idx on wallets (entity_id);
create index if not exists wallets_status_idx on wallets (status);

-- Transaction cases lookups by wallet and status
create index if not exists transaction_cases_wallet_id_idx on transaction_cases (wallet_id);
create index if not exists transaction_cases_case_status_idx on transaction_cases (case_status);

-- Audit searchability by resource, actor and time
create index if not exists audit_events_resource_id_idx on audit_events (resource_id);
create index if not exists audit_events_actor_id_idx on audit_events (actor_id);
create index if not exists audit_events_created_at_idx on audit_events (created_at desc);

-- Session cleanup and user lookup
create index if not exists auth_sessions_user_id_idx on auth_sessions (user_id);
create index if not exists auth_sessions_expires_at_idx on auth_sessions (expires_at);
