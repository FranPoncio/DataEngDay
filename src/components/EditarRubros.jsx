import { useState } from "react";
import { crearRubro, editarRubro, borrarRubro } from "../lib/gastos";

export default function EditarRubros({ grupo_id, rubros, onCerrar, onCambio }) {
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoColor, setNuevoColor] = useState("#5E7A18");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const conError = async (accion) => {
    try { await accion(); await onCambio(); }
    catch (e) { setError(`No se pudo guardar: ${e.message}`); }
  };

  const agregar = async () => {
    const nombre = nuevoNombre.trim();
    if (!nombre) return;
    setGuardando(true);
    await conError(() => crearRubro(grupo_id, { nombre, color: nuevoColor, orden: rubros.length }));
    setNuevoNombre("");
    setGuardando(false);
  };

  return (
    <div className="sheet-fondo" onClick={onCerrar}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-asa" />
        <h2 className="hoy-tit">Categorías</h2>
        {error && <p className="error banda">{error}</p>}

        <div className="rubros-editor">
          {rubros.map((r) => (
            <div key={r.id} className="rubro-fila">
              <input type="color" value={r.color}
                onChange={(e) => conError(() => editarRubro(grupo_id, r.id, { color: e.target.value }))} />
              <input className="rubro-nombre" defaultValue={r.nombre}
                onBlur={(e) => {
                  const nombre = e.target.value.trim();
                  if (nombre && nombre !== r.nombre) conError(() => editarRubro(grupo_id, r.id, { nombre }));
                  else e.target.value = r.nombre;
                }} />
              <button className="link borrar" onClick={() => conError(() => borrarRubro(grupo_id, r.id))}>
                Borrar
              </button>
            </div>
          ))}
        </div>

        <div className="rubro-fila">
          <input type="color" value={nuevoColor} onChange={(e) => setNuevoColor(e.target.value)} />
          <input className="rubro-nombre" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)}
            placeholder="Nueva categoría" onKeyDown={(e) => e.key === "Enter" && agregar()} />
          <button className="link" onClick={agregar} disabled={guardando || !nuevoNombre.trim()}>
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
