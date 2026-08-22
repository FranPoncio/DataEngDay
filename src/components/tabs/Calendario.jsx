import { useState, useEffect, useCallback, useMemo } from "react";
import { traerTareas, actualizarTarea, borrarTarea, escucharPlan } from "../../lib/tareas";
import { MESES_LARGO } from "../../lib/formato";
import TarjetaTarea from "../TarjetaTarea";

const pad = (n) => String(n).padStart(2, "0");
const fechaISO = (anio, mes, dia) => `${anio}-${pad(mes + 1)}-${pad(dia)}`;

function diasDelMes(anio, mes) {
  const ultimoDia = new Date(anio, mes + 1, 0).getDate();
  const offset = (new Date(anio, mes, 1).getDay() + 6) % 7; // lunes=0
  return [...Array(offset).fill(null), ...Array.from({ length: ultimoDia }, (_, i) => i + 1)];
}

export default function Calendario({ contexto }) {
  const { grupo_id } = contexto;
  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());
  const [tareas, setTareas] = useState([]);
  const [diaSel, setDiaSel] = useState(fechaISO(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()));
  const [error, setError] = useState("");

  const refrescar = useCallback(async () => {
    try { setTareas(await traerTareas(grupo_id)); setError(""); }
    catch { setError("No se pudieron traer las tareas."); }
  }, [grupo_id]);

  useEffect(() => {
    (async () => { await refrescar(); })();
  }, [refrescar]);

  useEffect(() => {
    const cortar = escucharPlan(grupo_id, refrescar);
    return cortar;
  }, [grupo_id, refrescar]);

  const porFecha = useMemo(() => {
    const mapa = new Map();
    tareas.forEach((t) => {
      if (!t.fecha) return;
      if (!mapa.has(t.fecha)) mapa.set(t.fecha, []);
      mapa.get(t.fecha).push(t);
    });
    return mapa;
  }, [tareas]);

  const cambiarMes = (delta) => {
    let m = mes + delta, a = anio;
    if (m < 0) { m = 11; a -= 1; }
    if (m > 11) { m = 0; a += 1; }
    setMes(m); setAnio(a);
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

  const hoyISO = fechaISO(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const items = diaSel ? (porFecha.get(diaSel) || []) : [];

  return (
    <div className="tab-calendario">
      <nav className="mes-nav">
        <button className="link" onClick={() => cambiarMes(-1)}>‹</button>
        <span>{MESES_LARGO[mes]} {anio}</span>
        <button className="link" onClick={() => cambiarMes(1)}>›</button>
      </nav>

      {error && <p className="error banda">{error}</p>}

      <div className="cal-grid">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <span key={i} className="cal-cab">{d}</span>
        ))}
        {diasDelMes(anio, mes).map((dia, i) => {
          if (!dia) return <span key={i} className="cal-dia vacio-celda" />;
          const fecha = fechaISO(anio, mes, dia);
          const itemsDia = porFecha.get(fecha) || [];
          const estados = [...new Set(itemsDia.map((t) => t.estado))];
          return (
            <button key={i}
              className={`cal-dia ${fecha === hoyISO ? "hoy" : ""} ${fecha === diaSel ? "sel" : ""}`}
              onClick={() => setDiaSel(fecha)}>
              <span>{dia}</span>
              <span className="cal-puntos">
                {estados.map((e) => <span key={e} className={`cal-punto ${e}`} />)}
              </span>
            </button>
          );
        })}
      </div>

      <section className="agenda">
        {!diaSel && <p className="vacio">Tocá un día para ver sus tareas.</p>}
        {diaSel && items.length === 0 && <p className="vacio">Sin tareas ese día.</p>}
        {items.map((t) => (
          <TarjetaTarea key={t.id} tarea={t}
            onCambiarEstado={cambiarEstado} onBorrar={eliminar} />
        ))}
      </section>
    </div>
  );
}
