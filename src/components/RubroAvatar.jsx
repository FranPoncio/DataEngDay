import { colorTexto } from "../lib/formato";

/* Antes era un punto de color de 9px — funcional pero anónimo. La inicial
   da algo para reconocer de un vistazo sin tener que memorizar qué color
   es cada rubro. */
export default function RubroAvatar({ rubro }) {
  return (
    <span className="avatar-rubro" style={{ background: rubro.color, color: colorTexto(rubro.color) }}>
      {rubro.nombre.charAt(0).toUpperCase()}
    </span>
  );
}
