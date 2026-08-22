import { describe, it, expect } from "vitest";
import { calcularMontos, tasaDe, TASAS } from "./gastos";
import { rangoMes, toISO, hoyISO, parseISO, sumarDias } from "./formato";

describe("calcularMontos", () => {
  it("divide a la mitad un gasto en la moneda base", () => {
    expect(calcularMontos({ monto: 100, tc_a_base: 1, split: "mitad" }))
      .toEqual({ monto_base: 100, deuda: 50 });
  });

  it("no genera deuda cuando el gasto es propio", () => {
    expect(calcularMontos({ monto: 80, tc_a_base: 1, split: "propio" }))
      .toEqual({ monto_base: 80, deuda: 0 });
  });

  it("usa el monto exacto cuando el split es exacto", () => {
    expect(calcularMontos({ monto: 100, tc_a_base: 1, split: "exacto", monto_exacto: 30 }))
      .toEqual({ monto_base: 100, deuda: 30 });
  });

  it("convierte a NZD con el tipo de cambio", () => {
    // 50 USD x 1.6717 = 83.585, que en punto flotante se guarda como
    // 83.58499... y por eso toFixed(2) baja a 83.58 (no sube a 83.59).
    expect(calcularMontos({ monto: 50, tc_a_base: TASAS.USD, split: "mitad" }))
      .toEqual({ monto_base: 83.58, deuda: 41.79 });
  });

  it("parte del monto ya convertido, no del original", () => {
    // La mitad de 100 USD son ~83.58 NZD, no 50
    const { deuda } = calcularMontos({ monto: 100, tc_a_base: TASAS.USD, split: "mitad" });
    expect(deuda).toBeCloseTo(83.58, 2);
  });

  it("trata un tc ausente o cero como 1", () => {
    expect(calcularMontos({ monto: 10, split: "mitad" }).monto_base).toBe(10);
    expect(calcularMontos({ monto: 10, tc_a_base: 0, split: "mitad" }).monto_base).toBe(10);
  });

  it("redondea a dos decimales", () => {
    const { monto_base } = calcularMontos({ monto: 33.333, tc_a_base: 1, split: "propio" });
    expect(monto_base).toBe(33.33);
  });

  it("no rompe con montos que vienen como texto del formulario", () => {
    expect(calcularMontos({ monto: "100", tc_a_base: "1", split: "mitad" }))
      .toEqual({ monto_base: 100, deuda: 50 });
  });

  it("exacto sin monto cargado no genera deuda", () => {
    expect(calcularMontos({ monto: 100, tc_a_base: 1, split: "exacto" }).deuda).toBe(0);
  });
});

describe("tasaDe", () => {
  it("deja la moneda base en 1", () => {
    expect(tasaDe("NZD")).toBe(1);
  });

  it("cae en 1 para una moneda desconocida en vez de romper", () => {
    expect(tasaDe("JPY")).toBe(1);
  });
});

describe("fechas locales", () => {
  /* La app se usa desde Nueva Zelanda (UTC+12/+13). Con toISOString() la
     mitad del día devuelve la fecha de ayer: estos tests cuidan eso. */

  it("toISO usa el día local, no el UTC", () => {
    // 1 de marzo 00:30 local: en UTC+12 esto es el 28/29 de febrero en UTC
    expect(toISO(new Date(2027, 2, 1, 0, 30))).toBe("2027-03-01");
  });

  it("toISO rellena mes y día con cero", () => {
    expect(toISO(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("rangoMes incluye el último día del mes", () => {
    expect(rangoMes(2026, 7)).toEqual({ desde: "2026-08-01", hasta: "2026-08-31" });
  });

  it("rangoMes resuelve febrero bisiesto", () => {
    expect(rangoMes(2028, 1).hasta).toBe("2028-02-29");
  });

  it("rangoMes cierra bien un mes de 30 días", () => {
    expect(rangoMes(2026, 3)).toEqual({ desde: "2026-04-01", hasta: "2026-04-30" });
  });

  it("parseISO y toISO son inversas", () => {
    expect(toISO(parseISO("2026-12-31"))).toBe("2026-12-31");
  });

  it("sumarDias cruza el fin de mes", () => {
    expect(toISO(sumarDias(parseISO("2026-08-30"), 3))).toBe("2026-09-02");
  });

  it("hoyISO devuelve una fecha con formato válido", () => {
    expect(hoyISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
