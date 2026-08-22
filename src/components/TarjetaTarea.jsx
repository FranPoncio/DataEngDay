import { ESTADOS, PRIORIDADES, faseDe, linkGoogleCalendar } from "../lib/tareas";
import { fechaCorta } from "../lib/formato";

export default function TarjetaTarea({ tarea, onCambiarEstado, onBorrar, mostrarFase = true }) {
  const link = linkGoogleCalendar(tarea);
  const fase = faseDe(tarea.fase);
  const prioridad = PRIORIDADES.find((p) => p.id === tarea.prioridad);

  return (
    <article className="tarea" onDoubleClick={() => onBorrar(tarea.id)}>
      <div className="tarea-txt">
        <p className="tarea-t">{tarea.titulo}</p>
        <p className="tarea-m">
          {tarea.fecha ? fechaCorta(tarea.fecha) : "Sin fecha"}
          {mostrarFase && ` · ${fase.nombre}`}
          {tarea.prioridad === 1 && ` · prioridad ${prioridad.nombre.toLowerCase()}`}
        </p>
        {tarea.detalle && <p className="tarea-d">{tarea.detalle}</p>}
        <div className="tarea-links">
          {tarea.link && (
            <a className="link" href={tarea.link} target="_blank" rel="noopener noreferrer">Más info</a>
          )}
          {link && (
            <a className="link" href={link} target="_blank" rel="noopener noreferrer">Agregar a Google Calendar</a>
          )}
        </div>
      </div>
      <div className="estado-btns">
        {ESTADOS.map((e) => (
          <button key={e.id}
            className={`estado-b ${e.id} ${tarea.estado === e.id ? "on" : ""}`}
            onClick={() => onCambiarEstado(tarea.id, e.id)}>
            {e.nombre}
          </button>
        ))}
      </div>
    </article>
  );
}
