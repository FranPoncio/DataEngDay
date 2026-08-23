-- Refresco de paleta: los 8 colores default de `rubros` pasan a la paleta
-- cálida validada (ver el comentario en RUBROS, src/lib/gastos). Solo toca
-- las claves default — si ya renombraste o recoloreaste una categoría a mano,
-- esto no la pisa porque compara por clave, no por nombre.
update rubros set color = case clave
  when 'casa'       then '#B8541F'
  when 'comida'     then '#02836F'
  when 'estudio'    then '#B98418'
  when 'tramites'   then '#7A5091'
  when 'salidas'    then '#7A9A2E'
  when 'transporte' then '#AD4F5E'
  when 'setup'      then '#3A6FD1'
  when 'otros'      then '#A63D33'
  else color
end
where clave in ('casa','comida','estudio','tramites','salidas','transporte','setup','otros');

notify pgrst, 'reload schema';
