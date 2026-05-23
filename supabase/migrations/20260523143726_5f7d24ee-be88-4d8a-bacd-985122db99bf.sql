create table public.pulse_accounts (
  id uuid primary key default gen_random_uuid(),
  user_name text not null default '',
  contact_name text not null default '',
  contact_email text not null,
  last_checkin timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pulse_passkeys (
  id bigserial primary key,
  account_id uuid not null references public.pulse_accounts(id) on delete cascade,
  credential_id text not null unique,
  public_key text not null,
  counter bigint not null default 0,
  transports text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index pulse_passkeys_account_id_idx on public.pulse_passkeys(account_id);

create table public.pulse_challenges (
  id uuid primary key default gen_random_uuid(),
  challenge text not null,
  kind text not null,
  account_id uuid references public.pulse_accounts(id) on delete cascade,
  rp_id text not null,
  origin text not null,
  expires_at timestamptz not null default (now() + interval '5 minutes'),
  created_at timestamptz not null default now()
);

create index pulse_challenges_expires_at_idx on public.pulse_challenges(expires_at);

alter table public.pulse_accounts enable row level security;
alter table public.pulse_passkeys enable row level security;
alter table public.pulse_challenges enable row level security;

create or replace function public.pulse_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger pulse_accounts_set_updated_at
before update on public.pulse_accounts
for each row execute function public.pulse_set_updated_at();