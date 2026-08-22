import { useState, useEffect, useCallback } from "react";
import {
  traerGrupo, setFechaLlegada, traerTareas, sembrarSiHaceFalta,
  agregarTarea, actualizarTarea, borrarTarea, escucharPlan, ESTADOS,
} from "../../lib/tareas";
import NuevaTarea from "../NuevaTarea";
import TarjetaTarea from "../TarjetaTarea";

export default function Planning({ contexto }) {
  const { grupo_id } = contexto;
  const [grupo, setGrupo] = useState(null);
  const [fechaForm, setFechaForm] = useState("");
  const [tareas, setTareas] = useState([]);
  const [abrirNueva, setAbrirNueva] = useState(false);
  const [error, setError] = useState("");

  const iniciar = useCallback(async () => {
    try {
      const g = await traerGrupo(grupo_id);
      setGrupo(g);
      if (g.fecha_llegada) {
        await sembrarSiHaceFalta(grupo_id, g.fecha_llegada);
        setTareas(await traerTareas(grupo_id));
      }
      setError("");
    } catch {
      setError("No se pudo cargar el plan.");
    }
  }, [grupo_id]);

  useEffect(() => {
    (async () => { await iniciar(); })();
  }, [iniciar]);

  useEffect(() => {
    const cortar = escucharPlan(grupo_id, async () => setTareas(await traerTareas(grupo_id)));
    return cortar;
  }, [grupo_id]);

  const guardarFechaLlegada = async () => {
    if (!fechaForm) return;
    try {
      await setFechaLlegada(grupo_id, fechaForm);
      await iniciar();
    } catch { setError("No se pudo guardar la fecha."); }
  };

  const guardarTarea = async (t) => {
    const fila = await agregarTarea(t);
    setTareas((prev) => [...prev, fila]);
  };

  const cambiarEstado = async (id, estado) => {
    const anterior = tareas;
    setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, estado } : t)));
    try { await actualizarTarea(id, { estado }); }
    catch { setTareas(anterior); setError("No se pudo actualizar el estado."); }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Borrar esta tarea?")) return;
    setTareas((prev) => prev.filter((t) => t.id !== id));
    try { await borrarTarea(id); }
    catch { setError("No se pudo borrar."); }
  };

  if (!grupo) return <div className="cargando">Cargando…</div>;

  if (!grupo.fecha_llegada) {
    return (
      <div className="tab-planning">
        <div className="llegada-form">
          <h2>¿Cuándo llegás a Nueva Zelanda?</h2>
          <p className="chico">Con esa fecha armamos el checklist completo de la mudanza.</p>
          <input type="date" value={fechaForm} onChange={(e) => setFechaForm(e.target.value)} />
          <button className="btn" onClick={guardarFechaLlegada} disabled={!fechaForm}>Armar el plan</button>
          {error && <p className="error banda">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="tab-planning">
      {error && <p className="error banda">{error}</p>}

      <main className="kanban">
        {ESTADOS.map((e) => {
          const items = tareas.filter((t) => t.estado === e.id);
          return (
            <section key={e.id} className="swimlane">
              <h2 className="dia">{e.nombre} ({items.length})</h2>
              {items.length === 0 && <p className="vacio chico">Nada acá.</p>}
              {items.map((t) => (
                <TarjetaTarea key={t.id} tarea={t}
                  onCambiarEstado={cambiarEstado} onBorrar={eliminar} />
              ))}
            </section>
          );
        })}
      </main>

      <button className="fab" onClick={() => setAbrirNueva(true)} aria-label="Nueva tarea">+</button>

      {abrirNueva && (
        <NuevaTarea contexto={contexto} onGuardar={guardarTarea} onCerrar={() => setAbrirNueva(false)} />
      )}
    </div>
  );
}
