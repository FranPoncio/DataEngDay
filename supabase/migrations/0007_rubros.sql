-- Categorías editables: antes eran un array hardcodeado en el frontend,
-- ahora viven por grupo así cada pareja puede ajustar las suyas. `clave` es
-- el mismo texto que ya se guarda en gastos.rubro (no se migra ese dato,
-- solo se vuelve editable la lista de categorías disponibles).

create table if not exists rubros (
  grupo_id uuid not null references grupos(id),
  clave    text not null,
  nombre   text not null,
  color    text not null,
  orden    int not null default 0,
  primary key (grupo_id, clave)
);

alter table rubros enable row level security;

drop policy if exists "rubros: ver del propio grupo" on rubros;
create policy "rubros: ver del propio grupo"
  on rubros for select
  using (grupo_id in (select grupo_id from miembros where user_id = auth.uid()));

drop policy if exists "rubros: crear en el propio grupo" on rubros;
create policy "rubros: crear en el propio grupo"
  on rubros for insert
  with check (grupo_id in (select grupo_id from miembros where user_id = auth.uid()));

drop policy if exists "rubros: editar del propio grupo" on rubros;
create policy "rubros: editar del propio grupo"
  on rubros for update
  using (grupo_id in (select grupo_id from miembros where user_id = auth.uid()))
  with check (grupo_id in (select grupo_id from miembros where user_id = auth.uid()));

drop policy if exists "rubros: borrar del propio grupo" on rubros;
create policy "rubros: borrar del propio grupo"
  on rubros for delete
  using (grupo_id in (select grupo_id from miembros where user_id = auth.uid()));

-- Semilla: los 8 rubros que hoy están hardcodeados, para cada grupo que ya
-- existe. Los colores están validados con el script de accesibilidad del
-- skill dataviz (contraste, chroma, separación para daltonismo) — si se
-- agregan o cambian rubros después, esa validación queda a mano.
insert into rubros (grupo_id, clave, nombre, color, orden)
select distinct m.grupo_id, v.clave, v.nombre, v.color, v.orden
from miembros m
cross join (values
  ('casa',       'Casa',       '#00997F', 0),
  ('comida',     'Comida',     '#C43D4B', 1),
  ('estudio',    'Estudio',    '#2D62C4', 2),
  ('tramites',   'Trámites',   '#A87200', 3),
  ('salidas',    'Salidas',    '#8B3FBF', 4),
  ('transporte', 'Transporte', '#0092B0', 5),
  ('setup',      'Setup',      '#C2186B', 6),
  ('otros',      'Otros',      '#5E7A18', 7)
) as v(clave, nombre, color, orden)
on conflict (grupo_id, clave) do nothing;

notify pgrst, 'reload schema';
