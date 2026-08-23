-- El formulario dice "Fecha (opcional)" pero la columna no lo era: crear una
-- tarea sin fecha tiraba "null value in column fecha violates not-null
-- constraint". La UI ya manda null cuando el campo queda vacío (NuevaTarea.jsx),
-- así que el fix es del lado de la columna, no del código.
alter table plan_tareas alter column fecha drop not null;

notify pgrst, 'reload schema';
