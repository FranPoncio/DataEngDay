import { useState, useEffect, useCallback, useMemo } from "react";
import {
  traerGrupo, setFechaLlegada, traerTareas, sembrarSiHaceFalta,
  agregarTarea, actualizarTarea, borrarTarea, escucharPlan, porCercania, ESTADOS,
} from "../../lib/tareas";
import { sinAcentos } from "../../lib/formato";
import { useDeshacer } from "../../lib/deshacer";
import NuevaTarea from "../NuevaTarea";
import TarjetaTarea from "../TarjetaTarea";
import Toast from "../Toast";
import Calendario from "./Calendario";

export default function Planning({ contexto }) {
  const { grupo_id } = contexto;
  const [grupo, setGrupo] = useState(null);
  const [fechaForm, setFechaForm] = useState("");
  const [tareas, setTareas] = useState([]);
  const [vista, setVista] = useState("tablero"); // tablero | calendario
  const [busqueda, setBusqueda] = useState("");
  const [abrirNueva, setAbrirNueva] = useState(false);
  const [desplegado, setDesplegado] = useState({});
  const [error, setError] = useState("");
  const { pendiente, pedir, deshacer } = useDeshacer();

  const alternar = (id) => setDesplegado((prev) => ({ ...prev, [id]: !prev[id] }));

  const iniciar = useCallback(async () => {
    try {
      const g = await traerGrupo(grupo_id);
      setGrupo(g);
      if (g.fecha_llegada) {
        await sembrarSiHaceFalta(grupo_id, g.fecha_llegada);
        setTareas(await traerTareas(grupo_id));
      }
      setError("");
    } catch (e) {
      setError(`No se pudo cargar el plan: ${e.message}`);
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
    } catch (e) { setError(`No se pudo guardar la fecha: ${e.message}`); }
  };

  const guardarTarea = async (t) => {
    try {
      const fila = await agregarTarea(t);
      setTareas((prev) => [...prev, fila]);
    } catch (e) { setError(`No se pudo crear la tarea: ${e.message}`); }
  };

  const cambiarEstado = async (id, estado) => {
    const anterior = tareas;
    setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, estado } : t)));
    try { await actualizarTarea(id, { estado }); }
    catch (e) { setTareas(anterior); setError(`No se pudo actualizar: ${e.message}`); }
  };

  const eliminar = (id) => {
    pedir({
      mensaje: "Tarea borrada",
      quitar: () => setTareas((prev) => prev.filter((t) => t.id !== id)),
      restaurar: async () => setTareas(await traerTareas(grupo_id)),
      confirmar: async () => {
        try { await borrarTarea(id); }
        catch (e) { setError(`No se pudo borrar: ${e.message}`); }
      },
    });
  };

  const filtradas = useMemo(() => {
    const q = sinAcentos(busqueda.trim());
    if (!q) return tareas;
    return tareas.filter(
      (t) => sinAcentos(t.titulo).includes(q) || sinAcentos(t.detalle).includes(q)
    );
  }, [tareas, busqueda]);

  if (!grupo) {
    return (
      <div className="cargando">
        {error ? <span className="error">{error}</span> : "Cargando…"}
        {error && (
          <p><button className="link" onClick={() => iniciar()}>Reintentar</button></p>
        )}
      </div>
    );
  }

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
      <div className="periodo">
        {[["tablero", "Tablero"], ["calendario", "Calendario"]].map(([k, l]) => (
          <button key={k} className={`periodo-b ${vista === k ? "on" : ""}`} onClick={() => setVista(k)}>{l}</button>
        ))}
      </div>

      {error && <p className="error banda">{error}</p>}

      {vista === "calendario" ? (
        <Calendario tareas={tareas} onCambiarEstado={cambiarEstado} onBorrar={eliminar} />
      ) : (
        <>
          <div className="buscador">
            <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar tarea…" />
          </div>

          <main className="kanban">
            {ESTADOS.map((e) => {
              const items = filtradas.filter((t) => t.estado === e.id);
              const grupos = e.id === "pendiente" && !busqueda
                ? porCercania(items)
                : [{ id: e.id, items, plegable: e.id === "realizada" && !busqueda }];
              return (
                <section key={e.id} className="swimlane">
                  <h2 className="dia">{e.nombre} ({items.length})</h2>
                  {items.length === 0 && <p className="vacio chico">Nada acá.</p>}
                  {grupos.map((g) => {
                    if (g.items.length === 0) return null;
                    const abierto = g.plegable ? !!desplegado[g.id] : true;
                    return (
                      <div key={g.id} className="bloque">
                        {g.titulo && (
                          g.plegable ? (
                            <button className="bloque-cab" onClick={() => alternar(g.id)}>
                              <span>{abierto ? "▾" : "▸"} {g.titulo}</span>
                              <span className="bloque-n">{g.items.length}</span>
                            </button>
                          ) : (
                            <p className="bloque-cab estatico">
                              <span>{g.titulo}</span>
                              <span className="bloque-n">{g.items.length}</span>
                            </p>
                          )
                        )}
                        {!g.titulo && g.plegable && (
                          <button className="bloque-cab" onClick={() => alternar(g.id)}>
                            <span>{abierto ? "▾ Ocultar" : "▸ Ver todas"}</span>
                            <span className="bloque-n">{g.items.length}</span>
                          </button>
                        )}
                        {abierto && g.items.map((t) => (
                          <TarjetaTarea key={t.id} tarea={t}
                            onCambiarEstado={cambiarEstado} onBorrar={eliminar} />
                        ))}
                      </div>
                    );
                  })}
                </section>
              );
            })}
          </main>
        </>
      )}

      <button className="fab" onClick={() => setAbrirNueva(true)} aria-label="Nueva tarea">+</button>

      {abrirNueva && (
        <NuevaTarea contexto={contexto} onGuardar={guardarTarea} onCerrar={() => setAbrirNueva(false)} />
      )}

      {pendiente && <Toast mensaje={pendiente.mensaje} onDeshacer={deshacer} />}
    </div>
  );
}
