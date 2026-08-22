import { useState } from "react";
import { FASES, PRIORIDADES } from "../lib/tareas";

export default function NuevaTarea({ contexto, onGuardar, onCerrar }) {
  const { grupo_id } = contexto;
  const [titulo, setTitulo] = useState("");
  const [fase, setFase] = useState("otros");
  const [prioridad, setPrioridad] = useState(2);
  const [fecha, setFecha] = useState("");
  const [detalle, setDetalle] = useState("");
  const [link, setLink] = useState("");
  const [mas, setMas] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const valido = titulo.trim().length > 0;

  const guardar = async () => {
    if (!valido || guardando) return;
    setGuardando(true);
    await onGuardar({
      grupo_id,
      titulo: titulo.trim(),
      fase,
      prioridad,
      fecha: fecha || null,
      detalle: detalle.trim() || null,
      link: link.trim() || null,
      origen: "usuario",
      estado: "pendiente",
    });
    setGuardando(false);
    onCerrar();
  };

  return (
    <div className="sheet-fondo" onClick={onCerrar}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-asa" />

        <input className="desc titulo-tarea" autoFocus value={titulo}
          onChange={(e) => setTitulo(e.target.value)} placeholder="¿Qué hay que hacer?" />

        <span className="etiqueta">Fase</span>
        <div className="rubros">
          {FASES.map((f) => (
            <button key={f.id} className={`rubro ${fase === f.id ? "on" : ""}`}
              style={fase === f.id ? { background: "var(--tinta)", borderColor: "var(--tinta)", color: "#fff" } : {}}
              onClick={() => setFase(f.id)}>
              {f.nombre}
            </button>
          ))}
        </div>

        <input className="desc" value={detalle} onChange={(e) => setDetalle(e.target.value)}
          placeholder="Detalle (opcional)" />

        {mas && (
          <div className="extra">
            <label>Prioridad</label>
            <div className="quien-btns">
              {PRIORIDADES.map((p) => (
                <button key={p.id} className={`quien-b ${prioridad === p.id ? "on" : ""}`}
                  onClick={() => setPrioridad(p.id)}>
                  {p.nombre}
                </button>
              ))}
            </div>

            <label>Fecha (opcional)</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />

            <label>Link de referencia (opcional)</label>
            <input type="url" value={link} onChange={(e) => setLink(e.target.value)}
              placeholder="https://…" />
          </div>
        )}

        <button className="link mas" onClick={() => setMas(!mas)}>
          {mas ? "Menos opciones" : "Más opciones"}
        </button>

        <button className="btn" onClick={guardar} disabled={!valido || guardando}>
          {guardando ? "Guardando…" : "Guardar tarea"}
        </button>
      </div>
    </div>
  );
}
