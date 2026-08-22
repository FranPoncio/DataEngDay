export const plata = (n) =>
  new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Math.abs(Number(n) || 0));

export const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
export const MESES_LARGO = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export const fechaCorta = (iso) => {
  const [, m, d] = iso.split("-");
  return `${Number(d)} ${MESES[Number(m) - 1]}`;
};

/* ------------------------------------------------------------------ fechas

   Todo el manejo de fechas es en hora LOCAL, nunca UTC. La app se usa desde
   Nueva Zelanda (UTC+12/+13): con toISOString() la mitad del día devuelve la
   fecha de ayer, y los gastos quedarían mal fechados. Las fechas acá son
   días de calendario, no instantes, así que se arman a mano desde el Date
   local en vez de pasar por UTC. */

const DIA = 86400000;

export const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const parseISO = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** Hoy a medianoche local. */
export const hoy = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};

export const hoyISO = () => toISO(hoy());
export const sumarDias = (b, n) => new Date(b.getTime() + n * DIA);
export const difDias = (a, b) => Math.round((a.getTime() - b.getTime()) / DIA);

export const rangoMes = (anio, mes) => ({
  desde: toISO(new Date(anio, mes, 1)),
  hasta: toISO(new Date(anio, mes + 1, 0)),
});
