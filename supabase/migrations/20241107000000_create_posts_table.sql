create table if not exists posts (
  id bigint primary key generated always as identity,
  content text not null,
  status text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
