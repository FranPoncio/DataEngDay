import { useState, useRef } from "react";

/* Borrar sin `confirm()`: se quita de la UI al toque y se muestra un toast
   con "Deshacer" por unos segundos. Recién si nadie deshace se confirma
   contra el servidor. Un solo pendiente a la vez: si llega uno nuevo, el
   anterior se confirma de una. */
export function useDeshacer() {
  const [pendiente, setPendiente] = useState(null);
  const ref = useRef(null);

  const pedir = ({ mensaje, quitar, restaurar, confirmar }) => {
    if (ref.current) {
      clearTimeout(ref.current.timer);
      ref.current.confirmar();
    }
    quitar();
    const timer = setTimeout(() => {
      confirmar();
      ref.current = null;
      setPendiente(null);
    }, 5000);
    ref.current = { restaurar, confirmar, timer };
    setPendiente({ mensaje });
  };

  const deshacer = () => {
    if (!ref.current) return;
    clearTimeout(ref.current.timer);
    ref.current.restaurar();
    ref.current = null;
    setPendiente(null);
  };

  return { pendiente, pedir, deshacer };
}
