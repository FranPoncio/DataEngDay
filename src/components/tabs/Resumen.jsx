import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { traerGastos, traerSaldos, rubroDe } from "../../lib/gastos";
import { plata, MESES_LARGO, rangoMes } from "../../lib/formato";

export default function Resumen({ contexto }) {
  const { grupo_id, miembros } = contexto;
  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());
  const [modo, setModo] = useState("mes"); // mes | anio | todo
  const [gastos, setGastos] = useState([]);
  const [saldos, setSaldos] = useState([]);
  const [error, setError] = useState("");

  const refrescar = useCallback(async () => {
    try {
      const rango =
        modo === "mes" ? rangoMes(anio, mes)
        : modo === "anio" ? { desde: `${anio}-01-01`, hasta: `${anio}-12-31` }
        : {};
      const [g, s] = await Promise.all([
        traerGastos(grupo_id, rango),
        traerSaldos(grupo_id),
      ]);
      setGastos(g);
      setSaldos(s);
      setError("");
    } catch (e) {
      setError(`No se pudieron traer los datos: ${e.message}`);
    }
  }, [grupo_id, anio, mes, modo]);

  useEffect(() => {
    (async () => { await refrescar(); })();
  }, [refrescar]);

  const cambiarMes = (delta) => {
    if (modo === "anio") { setAnio(anio + delta); return; }
    let m = mes + delta, a = anio;
    if (m < 0) { m = 11; a -= 1; }
    if (m > 11) { m = 0; a += 1; }
    setMes(m); setAnio(a);
  };

  const etiquetaPeriodo =
    modo === "mes" ? `${MESES_LARGO[mes]} ${anio}`
    : modo === "anio" ? `Año ${anio}`
    : "Todo el historial";

  const porRubro = useMemo(() => {
    const mapa = new Map();
    gastos.forEach((g) => mapa.set(g.rubro, (mapa.get(g.rubro) || 0) + Number(g.monto_base)));
    return [...mapa.entries()]
      .map(([rubro, total]) => ({ rubro, total, info: rubroDe(rubro) }))
      .sort((a, b) => b.total - a.total);
  }, [gastos]);

  const porPersonaRubro = useMemo(() => {
    const mapa = new Map();
    gastos.forEach((g) => {
      if (!mapa.has(g.rubro)) mapa.set(g.rubro, {});
      const fila = mapa.get(g.rubro);
      fila[g.pagador_id] = (fila[g.pagador_id] || 0) + Number(g.monto_base);
    });
    return mapa;
  }, [gastos]);

  const totalGeneral = porRubro.reduce((acc, r) => acc + r.total, 0);
  const totalesPorPersona = miembros.map((m) =>
    gastos.filter((g) => g.pagador_id === m.user_id).reduce((acc, g) => acc + Number(g.monto_base), 0)
  );

  const otro = miembros.find((m) => m.user_id !== contexto.yo?.user_id);
  const miSaldo = Number(saldos.find((s) => s.user_id === contexto.yo?.user_id)?.saldo || 0);
  const debo = miSaldo < 0;
  const empate = Math.abs(miSaldo) < 0.01;

  const maximo = porRubro.length ? porRubro[0].total : 0;

  return (
    <div className="tab-resumen">
      <div className="periodo">
        {[["mes", "Mes"], ["anio", "Año"], ["todo", "Todo"]].map(([k, l]) => (
          <button key={k} className={`periodo-b ${modo === k ? "on" : ""}`} onClick={() => setModo(k)}>{l}</button>
        ))}
      </div>

      <nav className="mes-nav">
        {modo !== "todo" && <button className="link" onClick={() => cambiarMes(-1)}>‹</button>}
        <span>{etiquetaPeriodo}</span>
        {modo !== "todo" && <button className="link" onClick={() => cambiarMes(1)}>›</button>}
      </nav>

      {error && <p className="error banda">{error}</p>}

      {totalGeneral === 0 ? (
        <p className="vacio">Sin gastos este período.</p>
      ) : (
        <>
          <div className="barras">
            <p className="barras-tit">Gasto por rubro <span className="chico">· total ${plata(totalGeneral)}</span></p>
            {porRubro.map((r) => (
              <div key={r.rubro} className="barra-fila">
                <span className="barra-nombre">{r.info.nombre}</span>
                <span className="barra-pista">
                  <span className="barra" style={{
                    width: `${maximo > 0 ? (r.total / maximo) * 100 : 0}%`,
                    background: r.info.color,
                  }} />
                </span>
                <span className="barra-monto">{plata(r.total)}</span>
                <span className="barra-pct chico">{((r.total / totalGeneral) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>

          <div className="tabla-scroll">
            <table className="tabla-resumen">
              <thead>
                <tr>
                  <th>Rubro</th>
                  {miembros.map((m) => <th key={m.user_id}>{m.alias}</th>)}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {porRubro.map((r) => {
                  const fila = porPersonaRubro.get(r.rubro) || {};
                  return (
                    <tr key={r.rubro}>
                      <td>{r.info.nombre}</td>
                      {miembros.map((m) => <td key={m.user_id}>{plata(fila[m.user_id] || 0)}</td>)}
                      <td>{plata(r.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  {totalesPorPersona.map((t, i) => <td key={i}>{plata(t)}</td>)}
                  <td>{plata(totalGeneral)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      <section className={`saldo-mini ${empate ? "cero" : debo ? "debo" : "favor"}`}>
        <p className="chico">
          {empate ? "Están a mano" : debo ? `Le debés a ${otro?.alias}` : `${otro?.alias} te debe`}
        </p>
        {!empate && <p className="saldo-mini-n">${plata(miSaldo)}</p>}
      </section>

      <footer className="pie">
        <span className="chico">Sesión de {contexto.yo?.alias}</span>
        <button className="link" onClick={() => supabase.auth.signOut()}>Cerrar sesión</button>
      </footer>
    </div>
  );
}
