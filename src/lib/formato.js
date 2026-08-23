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

export const sinAcentos = (s) =>
  (s || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/* Elige texto claro u oscuro según el color de fondo (contraste WCAG), en vez
   de asumir blanco: con categorías de color libre (el usuario elige cualquier
   tono en "Editar categorías"), un fondo claro con texto blanco se vuelve
   ilegible. */
const luminancia = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const contraste = (a, b) => {
  const [hi, lo] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
export const colorTexto = (fondo, oscuro = "#26211B", claro = "#FFFFFF") =>
  contraste(claro, fondo) >= contraste(oscuro, fondo) ? claro : oscuro;
