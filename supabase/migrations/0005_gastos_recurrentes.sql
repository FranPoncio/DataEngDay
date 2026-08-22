-- Gastos que se repiten todos los meses (alquiler, seguro, internet).
-- No se generan solos en el servidor: la app detecta los que faltan del mes
-- corriente y ofrece cargarlos de una, así siempre hay confirmación humana
-- y no aparecen gastos fantasma si un mes no se pagó.

alter table gastos add column if not exists recurrente boolean not null default false;

create index if not exists gastos_recurrente_idx on gastos (grupo_id, recurrente)
  where recurrente;

notify pgrst, 'reload schema';
