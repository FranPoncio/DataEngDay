import { useState, useEffect, useCallback, useMemo } from "react";
import { traerGastos, traerSaldos, rubroDe } from "../../lib/gastos";
import { plata, MESES_LARGO, rangoMes } from "../../lib/formato";

const GAP_DEG = 1.5;

function polarACartesiano(cx, cy, r, anguloDeg) {
  const rad = ((anguloDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function trozoTorta(cx, cy, r, desde, hasta) {
  const inicio = polarACartesiano(cx, cy, r, hasta);
  const fin = polarACartesiano(cx, cy, r, desde);
  const arcoGrande = hasta - desde <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${inicio.x} ${inicio.y} A ${r} ${r} 0 ${arcoGrande} 0 ${fin.x} ${fin.y} Z`;
}

export default function Resumen({ contexto }) {
  const { grupo_id, miembros } = contexto;
  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());
  const [gastos, setGastos] = useState([]);
  const [saldos, setSaldos] = useState([]);
  const [error, setError] = useState("");

  const refrescar = useCallback(async () => {
    try {
      const { desde, hasta } = rangoMes(anio, mes);
      const [g, s] = await Promise.all([
        traerGastos(grupo_id, { desde, hasta }),
        traerSaldos(grupo_id),
      ]);
      setGastos(g);
      setSaldos(s);
      setError("");
    } catch {
      setError("No se pudieron traer los datos.");
    }
  }, [grupo_id, anio, mes]);

  useEffect(() => {
    (async () => { await refrescar(); })();
  }, [refrescar]);

  const cambiarMes = (delta) => {
    let m = mes + delta, a = anio;
    if (m < 0) { m = 11; a -= 1; }
    if (m > 11) { m = 0; a += 1; }
    setMes(m); setAnio(a);
  };

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

  const slices = porRubro.reduce((acc, r) => {
    const ancho = totalGeneral > 0 ? (r.total / totalGeneral) * 360 : 0;
    const gap = porRubro.length > 1 && ancho > GAP_DEG * 2 ? GAP_DEG / 2 : 0;
    const desde = acc.pos;
    const hasta = desde + ancho;
    acc.pos = hasta;
    acc.out.push({ ...r, path: trozoTorta(110, 110, 100, desde + gap, hasta - gap) });
    return acc;
  }, { pos: 0, out: [] }).out;

  return (
    <div className="tab-resumen">
      <nav className="mes-nav">
        <button className="link" onClick={() => cambiarMes(-1)}>‹</button>
        <span>{MESES_LARGO[mes]} {anio}</span>
        <button className="link" onClick={() => cambiarMes(1)}>›</button>
      </nav>

      {error && <p className="error banda">{error}</p>}

      {totalGeneral === 0 ? (
        <p className="vacio">Sin gastos este período.</p>
      ) : (
        <>
          <div className="torta-wrap">
            <svg className="torta" viewBox="0 0 220 220" role="img" aria-label="Gasto por rubro">
              {slices.map((s) => (
                <path key={s.rubro} d={s.path} fill={s.info.color} />
              ))}
            </svg>
            <ul className="torta-leyenda">
              {porRubro.map((r) => (
                <li key={r.rubro}>
                  <span className="punto" style={{ background: r.info.color }} />
                  <span className="torta-nombre">{r.info.nombre}</span>
                  <span className="torta-pct chico">{((r.total / totalGeneral) * 100).toFixed(0)}%</span>
                  <span className="torta-monto">{plata(r.total)}</span>
                </li>
              ))}
            </ul>
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
    </div>
  );
}
