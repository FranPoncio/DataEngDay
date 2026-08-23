-- Foto del recibo, adjunta desde la edición de un gasto ya guardado (no en
-- la carga rápida) para no tocar la cola offline. Bucket privado: las fotos
-- pueden mostrar datos de tarjeta o cuentas, así que se sirven con URL
-- firmada en vez de ser públicas.

alter table gastos add column if not exists recibo_path text;

insert into storage.buckets (id, name, public)
values ('recibos', 'recibos', false)
on conflict (id) do nothing;

-- Convención de path: {grupo_id}/{gasto_id}-{timestamp}.jpg — el primer
-- segmento del path es el grupo_id, que compara contra los grupos del
-- usuario logueado (mismo patrón grupo-scoped que el resto de las tablas).
drop policy if exists "recibos: ver del propio grupo" on storage.objects;
create policy "recibos: ver del propio grupo"
  on storage.objects for select
  using (
    bucket_id = 'recibos'
    and (storage.foldername(name))[1]::uuid in (select grupo_id from miembros where user_id = auth.uid())
  );

drop policy if exists "recibos: subir al propio grupo" on storage.objects;
create policy "recibos: subir al propio grupo"
  on storage.objects for insert
  with check (
    bucket_id = 'recibos'
    and (storage.foldername(name))[1]::uuid in (select grupo_id from miembros where user_id = auth.uid())
  );

drop policy if exists "recibos: reemplazar del propio grupo" on storage.objects;
create policy "recibos: reemplazar del propio grupo"
  on storage.objects for update
  using (
    bucket_id = 'recibos'
    and (storage.foldername(name))[1]::uuid in (select grupo_id from miembros where user_id = auth.uid())
  );

drop policy if exists "recibos: borrar del propio grupo" on storage.objects;
create policy "recibos: borrar del propio grupo"
  on storage.objects for delete
  using (
    bucket_id = 'recibos'
    and (storage.foldername(name))[1]::uuid in (select grupo_id from miembros where user_id = auth.uid())
  );

notify pgrst, 'reload schema';
