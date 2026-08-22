-- Mismo caso que plan_tareas: si la tabla `grupos` ya existía de antes, el
-- `create table if not exists` de 0002 no la tocó. Esto agrega lo que falte.
-- Seguro de correr aunque ya esté todo bien.

create table if not exists grupos (
  id     uuid primary key default gen_random_uuid(),
  creado timestamptz not null default now()
);

alter table grupos add column if not exists fecha_llegada date;
alter table grupos add column if not exists creado timestamptz default now();

alter table grupos enable row level security;

drop policy if exists "grupos: ver el propio" on grupos;
create policy "grupos: ver el propio"
  on grupos for select
  using (id in (select grupo_id from miembros where user_id = auth.uid()));

drop policy if exists "grupos: crear el propio" on grupos;
create policy "grupos: crear el propio"
  on grupos for insert
  with check (id in (select grupo_id from miembros where user_id = auth.uid()));

drop policy if exists "grupos: actualizar el propio" on grupos;
create policy "grupos: actualizar el propio"
  on grupos for update
  using (id in (select grupo_id from miembros where user_id = auth.uid()))
  with check (id in (select grupo_id from miembros where user_id = auth.uid()));

notify pgrst, 'reload schema';
