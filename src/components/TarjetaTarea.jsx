import { useState } from "react";
import { ESTADOS, PRIORIDADES, faseDe, linkGoogleCalendar } from "../lib/tareas";
import { fechaCorta } from "../lib/formato";

export default function TarjetaTarea({ tarea, onCambiarEstado, onBorrar, compacta = false }) {
  const [abierta, setAbierta] = useState(false);
  const link = linkGoogleCalendar(tarea);
  const fase = faseDe(tarea.fase);
  const prioridad = PRIORIDADES.find((p) => p.id === tarea.prioridad) || PRIORIDADES[1];
  const hecha = tarea.estado === "realizada";

  return (
    <article className={`tarea ${tarea.estado} p${prioridad.id} ${abierta ? "abierta" : ""}`}>
      <div className="tarea-fila">
        <button className={`tarea-check ${tarea.estado}`} role="checkbox" aria-checked={hecha}
          aria-label={hecha ? "Marcar como pendiente" : "Marcar como realizada"}
          onClick={() => onCambiarEstado(tarea.id, hecha ? "pendiente" : "realizada")}>
          <span className="tarea-caja">{hecha && "✓"}</span>
        </button>

        <button className="tarea-cab" onClick={() => setAbierta(!abierta)}>
          <span className="tarea-top">
            {!compacta && <span className="tarea-fase">{fase.nombre}</span>}
            {tarea.fecha && <span className="tarea-f">{fechaCorta(tarea.fecha)}</span>}
          </span>
          <span className="tarea-t">{tarea.titulo}</span>
        </button>

        <div className="tarea-extra">
          <span className={`chip-p p${prioridad.id}`}>{prioridad.nombre}</span>
          {link && (
            <a className="tarea-cal" href={link} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="Agregar a Google Calendar" title="Agregar a Google Calendar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
                <path d="M3.5 9.5h17M8 3v4M16 3v4" />
                <path d="M12 13v4M10 15h4" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {abierta && (
        <div className="tarea-cuerpo">
          <p className="tarea-m">
            <span className={`chip-p p${prioridad.id}`}>{prioridad.nombre}</span>
            {` · ${fase.nombre}`}
          </p>
          {tarea.detalle && <p className="tarea-d">{tarea.detalle}</p>}

          <div className="estado-btns">
            {ESTADOS.map((e) => (
              <button key={e.id}
                className={`estado-b ${e.id} ${tarea.estado === e.id ? "on" : ""}`}
                onClick={() => onCambiarEstado(tarea.id, e.id)}>
                {e.nombre}
              </button>
            ))}
          </div>

          <div className="tarea-links">
            {tarea.link && (
              <a className="link" href={tarea.link} target="_blank" rel="noopener noreferrer">Más info</a>
            )}
            {link && (
              <a className="link" href={link} target="_blank" rel="noopener noreferrer">Google Calendar</a>
            )}
            <button className="link borrar" onClick={() => onBorrar(tarea.id)}>Borrar</button>
          </div>
        </div>
      )}
    </article>
  );
}
