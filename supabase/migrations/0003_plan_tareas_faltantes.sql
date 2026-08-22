-- La tabla plan_tareas ya existía de antes (creada en una iteración previa),
-- así que el `create table if not exists` de 0002 no la tocó y quedó sin las
-- columnas nuevas. Esto agrega solo lo que falte — es seguro correrlo aunque
-- alguna columna ya exista, y no toca los datos existentes.

alter table plan_tareas add column if not exists fase text;
alter table plan_tareas add column if not exists prioridad smallint default 2;
alter table plan_tareas add column if not exists titulo text;
alter table plan_tareas add column if not exists detalle text;
alter table plan_tareas add column if not exists link text;
alter table plan_tareas add column if not exists fecha date;
alter table plan_tareas add column if not exists origen text default 'usuario';
alter table plan_tareas add column if not exists estado text default 'pendiente';
alter table plan_tareas add column if not exists creado timestamptz default now();

-- Normalizar filas viejas antes de aplicar los checks
update plan_tareas set estado = 'pendiente' where estado is null;
update plan_tareas set estado = 'haciendo'  where estado = 'faltante';
update plan_tareas set origen = 'usuario'   where origen is null;
update plan_tareas set prioridad = 2        where prioridad is null;
update plan_tareas set fase = 'otros'       where fase is null;

alter table plan_tareas alter column estado set not null;
alter table plan_tareas alter column estado set default 'pendiente';

-- Constraints (se recrean para que incluyan 'haciendo')
alter table plan_tareas drop constraint if exists plan_tareas_estado_check;
alter table plan_tareas add constraint plan_tareas_estado_check
  check (estado in ('pendiente', 'haciendo', 'realizada'));

alter table plan_tareas drop constraint if exists plan_tareas_prioridad_check;
alter table plan_tareas add constraint plan_tareas_prioridad_check
  check (prioridad in (1, 2, 3));

alter table plan_tareas drop constraint if exists plan_tareas_origen_check;
alter table plan_tareas add constraint plan_tareas_origen_check
  check (origen in ('base', 'usuario'));

alter table plan_tareas drop constraint if exists plan_tareas_fase_check;
alter table plan_tareas add constraint plan_tareas_fase_check
  check (fase in ('pre','vuelo','llegada','semana','mes','anio','cierre','otros'));

-- Por si la tabla vieja tampoco tenía RLS habilitada
alter table plan_tareas enable row level security;

drop policy if exists "plan_tareas: ver del propio grupo" on plan_tareas;
create policy "plan_tareas: ver del propio grupo"
  on plan_tareas for select
  using (grupo_id in (select grupo_id from miembros where user_id = auth.uid()));

drop policy if exists "plan_tareas: crear en el propio grupo" on plan_tareas;
create policy "plan_tareas: crear en el propio grupo"
  on plan_tareas for insert
  with check (grupo_id in (select grupo_id from miembros where user_id = auth.uid()));

drop policy if exists "plan_tareas: actualizar del propio grupo" on plan_tareas;
create policy "plan_tareas: actualizar del propio grupo"
  on plan_tareas for update
  using (grupo_id in (select grupo_id from miembros where user_id = auth.uid()))
  with check (grupo_id in (select grupo_id from miembros where user_id = auth.uid()));

drop policy if exists "plan_tareas: borrar del propio grupo" on plan_tareas;
create policy "plan_tareas: borrar del propio grupo"
  on plan_tareas for delete
  using (grupo_id in (select grupo_id from miembros where user_id = auth.uid()));

-- Refrescar el schema cache de PostgREST (el error que veías venía de acá)
notify pgrst, 'reload schema';
