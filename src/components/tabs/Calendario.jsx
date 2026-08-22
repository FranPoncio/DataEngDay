import { useState, useMemo } from "react";
import { MESES_LARGO } from "../../lib/formato";
import TarjetaTarea from "../TarjetaTarea";

const pad = (n) => String(n).padStart(2, "0");
const fechaISO = (anio, mes, dia) => `${anio}-${pad(mes + 1)}-${pad(dia)}`;

function diasDelMes(anio, mes) {
  const ultimoDia = new Date(anio, mes + 1, 0).getDate();
  const offset = (new Date(anio, mes, 1).getDay() + 6) % 7; // lunes=0
  return [...Array(offset).fill(null), ...Array.from({ length: ultimoDia }, (_, i) => i + 1)];
}

export default function Calendario({ tareas, onCambiarEstado, onBorrar }) {
  const hoyISO = useMemo(() => {
    const n = new Date();
    return fechaISO(n.getFullYear(), n.getMonth(), n.getDate());
  }, []);
  const [navegado, setNavegado] = useState(null);
  const [diaTocado, setDiaTocado] = useState(null);

  const porFecha = useMemo(() => {
    const mapa = new Map();
    tareas.forEach((t) => {
      if (!t.fecha) return;
      if (!mapa.has(t.fecha)) mapa.set(t.fecha, []);
      mapa.get(t.fecha).push(t);
    });
    return mapa;
  }, [tareas]);

  /* Las tareas sembradas caen en meses lejanos al actual: mientras no
     navegues a mano, mostramos el mes de hoy solo si tiene tareas, y si no
     el de la primera tarea con fecha. */
  const inicial = useMemo(() => {
    const mesDeHoy = hoyISO.slice(0, 7);
    if (porFecha.size === 0 || [...porFecha.keys()].some((f) => f.startsWith(mesDeHoy))) {
      return { fecha: hoyISO, esHoy: true };
    }
    return { fecha: [...porFecha.keys()].sort()[0], esHoy: false };
  }, [porFecha, hoyISO]);

  const [anio, mes] = navegado
    ? [navegado.anio, navegado.mes]
    : [Number(inicial.fecha.slice(0, 4)), Number(inicial.fecha.slice(5, 7)) - 1];
  const diaSel = diaTocado ?? inicial.fecha;

  const cambiarMes = (delta) => {
    let m = mes + delta, a = anio;
    if (m < 0) { m = 11; a -= 1; }
    if (m > 11) { m = 0; a += 1; }
    setNavegado({ anio: a, mes: m });
  };

  const items = porFecha.get(diaSel) || [];

  return (
    <div className="tab-calendario">
      <nav className="mes-nav">
        <button className="link" onClick={() => cambiarMes(-1)}>‹</button>
        <span>{MESES_LARGO[mes]} {anio}</span>
        <button className="link" onClick={() => cambiarMes(1)}>›</button>
      </nav>

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
              onClick={() => setDiaTocado(fecha)}>
              <span>{dia}</span>
              <span className="cal-puntos">
                {estados.map((e) => <span key={e} className={`cal-punto ${e}`} />)}
              </span>
            </button>
          );
        })}
      </div>

      <section className="agenda">
        {items.length === 0 && <p className="vacio">Sin tareas ese día.</p>}
        {items.map((t) => (
          <TarjetaTarea key={t.id} tarea={t}
            onCambiarEstado={onCambiarEstado} onBorrar={onBorrar} />
        ))}
      </section>
    </div>
  );
}
