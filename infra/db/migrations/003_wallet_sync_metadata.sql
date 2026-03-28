alter table wallets
  add column if not exists whitelist_entry text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists chain_sync_attempted_at timestamptz;
