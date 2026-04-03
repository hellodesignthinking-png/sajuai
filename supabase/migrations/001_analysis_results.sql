-- Enable RLS
alter table if exists analysis_results disable row level security;
drop table if exists analysis_results;

create table analysis_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  input jsonb not null,
  result jsonb not null,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '1 year')
);

-- Index for fast user-based queries
create index idx_analysis_user on analysis_results(user_id);

-- Enable Row Level Security
alter table analysis_results enable row level security;

-- Policies
create policy "Users can view own results" on analysis_results
  for select using (auth.uid() = user_id);

create policy "Users can insert own results" on analysis_results
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own results" on analysis_results
  for delete using (auth.uid() = user_id);
