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

export const rangoMes = (anio, mes) => ({
  desde: `${anio}-${String(mes + 1).padStart(2, "0")}-01`,
  hasta: new Date(anio, mes + 1, 0).toISOString().slice(0, 10),
});
