-- Planning de la mudanza: grupos.fecha_llegada + plan_tareas.
-- No existe todavía una tabla `grupos` en la base (grupo_id hoy es un uuid
-- suelto compartido entre miembros/gastos/pagos, sin FK). Esta migración la
-- crea, pero NO toca miembros/gastos/pagos ni les agrega una FK — el `id`
-- de grupos se hace coincidir con el grupo_id ya existente desde la app
-- (ver traerGrupo en src/lib/tareas.js: si no hay fila la crea sola la
-- primera vez que entrás a Planning, gracias a la policy de insert de abajo).

create table if not exists grupos (
  id            uuid primary key default gen_random_uuid(),
  fecha_llegada date,
  creado        timestamptz not null default now()
);

alter table grupos enable row level security;

create policy "grupos: ver el propio"
  on grupos for select
  using (id in (select grupo_id from miembros where user_id = auth.uid()));

create policy "grupos: crear el propio"
  on grupos for insert
  with check (id in (select grupo_id from miembros where user_id = auth.uid()));

create policy "grupos: actualizar el propio"
  on grupos for update
  using (id in (select grupo_id from miembros where user_id = auth.uid()))
  with check (id in (select grupo_id from miembros where user_id = auth.uid()));

create table if not exists plan_tareas (
  id         uuid primary key default gen_random_uuid(),
  grupo_id   uuid not null references grupos(id) on delete cascade,
  fase       text not null
             check (fase in ('pre','vuelo','llegada','semana','mes','anio','cierre','otros')),
  prioridad  smallint not null default 2 check (prioridad in (1, 2, 3)),
  titulo     text not null,
  detalle    text,
  link       text,
  fecha      date,
  origen     text not null default 'usuario' check (origen in ('base', 'usuario')),
  estado     text not null default 'pendiente'
             check (estado in ('pendiente', 'haciendo', 'realizada')),
  creado     timestamptz not null default now()
);

create index if not exists plan_tareas_grupo_id_idx on plan_tareas (grupo_id);
create index if not exists plan_tareas_fecha_idx on plan_tareas (fecha);

alter table plan_tareas enable row level security;

create policy "plan_tareas: ver del propio grupo"
  on plan_tareas for select
  using (grupo_id in (select grupo_id from miembros where user_id = auth.uid()));

create policy "plan_tareas: crear en el propio grupo"
  on plan_tareas for insert
  with check (grupo_id in (select grupo_id from miembros where user_id = auth.uid()));

create policy "plan_tareas: actualizar del propio grupo"
  on plan_tareas for update
  using (grupo_id in (select grupo_id from miembros where user_id = auth.uid()))
  with check (grupo_id in (select grupo_id from miembros where user_id = auth.uid()));

create policy "plan_tareas: borrar del propio grupo"
  on plan_tareas for delete
  using (grupo_id in (select grupo_id from miembros where user_id = auth.uid()));

alter publication supabase_realtime add table grupos;
alter publication supabase_realtime add table plan_tareas;
