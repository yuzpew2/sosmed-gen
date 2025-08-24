create table if not exists prompts (
  id bigint primary key generated always as identity,
  name text not null,
  template text not null
);
