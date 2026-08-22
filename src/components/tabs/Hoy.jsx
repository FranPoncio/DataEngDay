import { useState, useEffect, useCallback, useMemo } from "react";
import { traerGastos, traerSaldos, rubroDe } from "../../lib/gastos";
import {
  traerGrupo, traerTareas, actualizarTarea, borrarTarea, escucharPlan, porCercania,
} from "../../lib/tareas";
import { plata, fechaCorta } from "../../lib/formato";
import TarjetaTarea from "../TarjetaTarea";

export default function Hoy({ contexto, onIrA }) {
  const { grupo_id, miembros, yo } = contexto;
  const [tareas, setTareas] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [saldos, setSaldos] = useState([]);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState("");

  const refrescar = useCallback(async () => {
    try {
      const g = await traerGrupo(grupo_id);
      const [t, gs, s] = await Promise.all([
        g.fecha_llegada ? traerTareas(grupo_id) : Promise.resolve([]),
        traerGastos(grupo_id),
        traerSaldos(grupo_id),
      ]);
      setTareas(t);
      setGastos(gs);
      setSaldos(s);
      setError("");
    } catch (e) {
      setError(`No se pudo cargar: ${e.message}`);
    } finally {
      setListo(true);
    }
  }, [grupo_id]);

  useEffect(() => {
    (async () => { await refrescar(); })();
  }, [refrescar]);

  useEffect(() => {
    const cortar = escucharPlan(grupo_id, async () => setTareas(await traerTareas(grupo_id)));
    return cortar;
  }, [grupo_id]);

  const cambiarEstado = async (id, estado) => {
    const anterior = tareas;
    setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, estado } : t)));
    try { await actualizarTarea(id, { estado }); }
    catch (e) { setTareas(anterior); setError(`No se pudo actualizar: ${e.message}`); }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Borrar esta tarea?")) return;
    const anterior = tareas;
    setTareas((prev) => prev.filter((t) => t.id !== id));
    try { await borrarTarea(id); }
    catch (e) { setTareas(anterior); setError(`No se pudo borrar: ${e.message}`); }
  };

  const urgentes = useMemo(() => {
    const pendientes = tareas.filter((t) => t.estado !== "realizada");
    const bloques = porCercania(pendientes);
    return {
      atrasadas: bloques.find((b) => b.id === "atrasadas").items,
      semana: bloques.find((b) => b.id === "semana").items,
    };
  }, [tareas]);

  const otro = miembros.find((m) => m.user_id !== yo?.user_id);
  const miSaldo = Number(saldos.find((s) => s.user_id === yo?.user_id)?.saldo || 0);
  const debo = miSaldo < 0;
  const empate = Math.abs(miSaldo) < 0.01;

  const ultimos = gastos.slice(0, 3);
  const alias = (id) => miembros.find((m) => m.user_id === id)?.alias || "?";

  if (!listo) return <div className="cargando">Cargando…</div>;

  const sinUrgentes = urgentes.atrasadas.length === 0 && urgentes.semana.length === 0;

  return (
    <div className="tab-hoy">
      {error && <p className="error banda">{error}</p>}

      <button className={`saldo-hoy ${empate ? "cero" : debo ? "debo" : "favor"}`}
        onClick={() => onIrA("gastos")}>
        <span className="saldo-hoy-lbl">
          {empate ? "Están a mano" : debo ? `Le debés a ${otro?.alias}` : `${otro?.alias} te debe`}
        </span>
        {!empate && <span className="saldo-hoy-n">${plata(miSaldo)}</span>}
      </button>

      {urgentes.atrasadas.length > 0 && (
        <section className="hoy-bloque">
          <h2 className="hoy-tit atrasado">Atrasadas ({urgentes.atrasadas.length})</h2>
          {urgentes.atrasadas.map((t) => (
            <TarjetaTarea key={t.id} tarea={t} compacta
              onCambiarEstado={cambiarEstado} onBorrar={eliminar} />
          ))}
        </section>
      )}

      {urgentes.semana.length > 0 && (
        <section className="hoy-bloque">
          <h2 className="hoy-tit">Esta semana ({urgentes.semana.length})</h2>
          {urgentes.semana.map((t) => (
            <TarjetaTarea key={t.id} tarea={t} compacta
              onCambiarEstado={cambiarEstado} onBorrar={eliminar} />
          ))}
        </section>
      )}

      {sinUrgentes && (
        <p className="vacio">Nada urgente por ahora. Todo en orden.</p>
      )}

      {ultimos.length > 0 && (
        <section className="hoy-bloque">
          <h2 className="hoy-tit">Últimos gastos</h2>
          {ultimos.map((g) => {
            const info = rubroDe(g.rubro);
            return (
              <article key={g.id} className="gasto" onClick={() => onIrA("gastos")}>
                <span className="punto" style={{ background: info.color }} />
                <div className="gasto-txt">
                  <p className="gasto-d">{g.descripcion}</p>
                  <p className="gasto-m">
                    {fechaCorta(g.fecha)} · {g.pagador_id === yo.user_id ? "vos" : alias(g.pagador_id)}
                  </p>
                </div>
                <span className="gasto-n">{plata(g.monto_base)}</span>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
