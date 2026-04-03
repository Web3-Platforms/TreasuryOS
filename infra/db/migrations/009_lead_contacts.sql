create table if not exists lead_contacts (
  id          bigserial primary key,
  full_name   text        not null,
  email       text        not null,
  organization text       not null,
  message     text        not null,
  source      text        not null default 'landing_page',
  created_at  timestamptz not null default now()
);

create index if not exists idx_lead_contacts_email      on lead_contacts(email);
create index if not exists idx_lead_contacts_created_at on lead_contacts(created_at desc);
