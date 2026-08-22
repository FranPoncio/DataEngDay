import { supabase } from "./supabase";
import { toISO, parseISO, hoy, sumarDias } from "./formato";

export const FASES = [
  { id: "pre", nombre: "Pre-viaje", sub: "Córdoba" },
  { id: "vuelo", nombre: "El vuelo", sub: "COR · SCL · AKL" },
  { id: "llegada", nombre: "Llegada", sub: "Auckland" },
  { id: "semana", nombre: "Primera semana", sub: "días 1–7" },
  { id: "mes", nombre: "Primer mes", sub: "días 8–30" },
  { id: "anio", nombre: "Durante el año", sub: "2026–2027" },
  { id: "cierre", nombre: "Cierre", sub: "ago–sep 2027" },
  { id: "otros", nombre: "Mías", sub: "agregadas por vos" },
];

export const faseDe = (id) => FASES.find((f) => f.id === id) || FASES[FASES.length - 1];

export const ESTADOS = [
  { id: "pendiente", nombre: "Pendiente" },
  { id: "haciendo", nombre: "Haciendo" },
  { id: "realizada", nombre: "Realizada" },
];

/* Con 30+ pendientes, una lista plana cansa: se separan las urgentes del resto.
   La usan Planning (columna Pendiente) y Hoy. */
export function porCercania(items) {
  const base = hoy();
  const hoyISO = toISO(base);
  const finISO = toISO(sumarDias(base, 7));

  return [
    { id: "atrasadas", titulo: "Atrasadas", plegable: false,
      items: items.filter((t) => t.fecha && t.fecha < hoyISO) },
    { id: "semana", titulo: "Esta semana", plegable: false,
      items: items.filter((t) => t.fecha && t.fecha >= hoyISO && t.fecha <= finISO) },
    { id: "despues", titulo: "Más adelante", plegable: true,
      items: items.filter((t) => t.fecha && t.fecha > finISO) },
    { id: "sinfecha", titulo: "Sin fecha", plegable: true,
      items: items.filter((t) => !t.fecha) },
  ];
}

export const PRIORIDADES = [
  { id: 1, nombre: "Alta" },
  { id: 2, nombre: "Media" },
  { id: 3, nombre: "Baja" },
];

/* Semilla: se cargan una sola vez, la primera vez que abrís el Plan.
   Después son filas comunes: las movés, las borrás, agregás las tuyas. */
const BASE = [
  ["pre", -22, 1, "Releer el PDF de la visa", "Anotar la fecha límite de primera entrada y las condiciones de empleo: cuánto podés trabajar con un mismo empleador y el tope de 6 meses de estudio.", null],
  ["pre", -22, 1, "Verificar el pasaporte", "Necesita al menos 15 meses de validez desde la fecha de entrada a Nueva Zelanda.", null],
  ["pre", -20, 1, "Anotar el INZ number y el CUIL", "El número de aplicación está en el asunto del mail de aprobación. Son los dos datos que piden para el IRD.", null],
  ["pre", -21, 1, "Contratar el seguro médico", "Condición obligatoria de la visa: cobertura médica y repatriación por los 12 meses. Póliza en inglés.", null],
  ["pre", -21, 1, "Comprar el pasaje de salida", "Pasaje de vuelta o fondos extra demostrables para comprarlo. Te lo piden en el check-in.", null],
  ["pre", -18, 2, "Traducir la licencia de conducir", "Traducción certificada al inglés o permiso internacional del ACA. Sirve 12 meses en NZ.", null],
  ["pre", -14, 2, "Ordenar impuestos y aportes en Argentina", "Monotributo, obra social, débitos automáticos, claves de home banking.", null],
  ["pre", -14, 1, "Reservar las primeras noches", "La dirección se usa en la declaración de ingreso y para abrir la cuenta bancaria.", null],
  ["pre", -10, 2, "Armar la carpeta digital", "Visa, seguro, pasaje, extractos, antecedentes, títulos. Copia en la nube y copia descargada.", null],
  ["pre", -7, 1, "Prueba de fondos: NZD 4.200", "Se demuestra al ingresar, no al aplicar. Extracto en inglés, efectivo o tarjeta con límite.", null],
  ["pre", -7, 3, "Descargar las apps", "NZTD, banco, transporte.", "https://www.travellerdeclaration.govt.nz/"],
  ["pre", -5, 2, "Habilitar tarjetas y llevar efectivo", "Avisar al banco las fechas del viaje.", null],
  ["pre", -2, 1, "Revisar el equipaje por bioseguridad", "Nada de comida, semillas, madera ni miel. Botines y carpa impecables. Más de NZD 10.000 se declara.", null],
  ["vuelo", -1, 1, "Completar el NZTD", "Obligatorio aunque tengas visa. Desde 24 h antes de empezar el viaje. Guardá el QR.", "https://www.travellerdeclaration.govt.nz/"],
  ["vuelo", 0, 1, "Check-in con visa y pasaje de salida", "Pueden pedirte la aprobación de la visa y la prueba de salida.", null],
  ["llegada", 0, 1, "Migraciones y bioseguridad", "Huellas y foto. A mano: fondos, seguro y pasaje de salida. Ante la duda, declarar.", null],
  ["llegada", 0, 1, "Comprar el chip local", "One NZ, Spark, 2degrees o Skinny. Hace falta número neozelandés para el IRD.", null],
  ["semana", 1, 1, "Solicitar el IRD number", "Vía «new arrival» en myIR: pasaporte, número de INZ y CUIL. Llega en 2 días. Sin cuenta bancaria previa.", "https://www.ird.govt.nz/managing-my-tax/ird-numbers/ird-numbers-for-individuals/new-arrival-to-new-zealand---ird-number-application"],
  ["semana", 2, 1, "Abrir la cuenta bancaria", "ANZ, ASB, BNZ, Westpac o Kiwibank. Varias dejan iniciar online desde antes de viajar.", null],
  ["semana", 4, 2, "CV en formato neozelandés", "Dos páginas, sin foto, con referencias contactables. Seek, TradeMe Jobs, Indeed NZ.", null],
  ["semana", 7, 1, "Completar el IR330", "Código de impuesto al entrar al primer trabajo. Sin IRD te retienen el 45%.", null],
  ["semana", 7, 3, "Avisar que no aplicás a KiwiSaver", "Con visa temporaria no corresponde el enrolamiento automático.", null],
  ["mes", 14, 2, "ACC vs. seguro médico", "El ACC cubre accidentes automáticamente. No cubre enfermedad.", "https://www.acc.co.nz/"],
  ["mes", 21, 1, "Alquiler con tenancy agreement", "El bond es de 4 semanas máximo y va a Tenancy Services, no al dueño.", "https://www.tenancy.govt.nz/"],
  ["mes", 25, 2, "Registrarte en un GP", "Como no residente pagás tarifa completa, pero conviene estar registrado antes.", null],
  ["mes", 30, 2, "Archivo de payslips", "Se usan para la devolución de impuestos y como respaldo laboral.", null],
  ["anio", 150, 2, "Decidir la extensión de 3 meses", "Se accede con 3 meses en horticultura o vitivinicultura.", null],
  ["anio", 202, 1, "Cierre del año fiscal", "31 de marzo. Payslips ordenados.", null],
  ["anio", 210, 2, "Buscar empleador acreditado (AEWV)", "Si querés quedarte, al menos 5 meses antes del vencimiento.", null],
  ["anio", 230, 1, "Revisar la liquidación del IRD", "Entre abril y mayo calcula solo la devolución. Revisá los datos bancarios en myIR.", null],
  ["cierre", 345, 1, "Declaración final de impuestos", "Avisale al IRD la fecha de salida y pedí la devolución.", null],
  ["cierre", 350, 1, "Recuperar el bond", "Ante Tenancy Services, con el comprobante del depósito.", null],
  ["cierre", 360, 2, "Cerrar la cuenta bancaria", "Después de cobrar la devolución.", null],
  ["cierre", 365, 1, "Vence la visa", "12 meses desde la primera entrada.", null],
];


/* Si el grupo todavía no tiene fila en `grupos` (tabla nueva, sin FK a los
   grupo_id ya usados en miembros/gastos/pagos), la crea con ese mismo id
   la primera vez que se pide — no hace falta bootstrapear nada a mano. */
export async function traerGrupo(grupo_id) {
  const { data, error } = await supabase.from("grupos").select("*").eq("id", grupo_id).maybeSingle();
  if (error) throw error;
  if (data) return data;

  const { data: creado, error: e2 } = await supabase
    .from("grupos").insert({ id: grupo_id }).select().single();
  if (e2) throw e2;
  return creado;
}

export async function setFechaLlegada(grupo_id, fecha) {
  const { error } = await supabase.from("grupos").update({ fecha_llegada: fecha }).eq("id", grupo_id);
  if (error) throw error;
}

export async function traerTareas(grupo_id) {
  const { data, error } = await supabase
    .from("plan_tareas").select("*").eq("grupo_id", grupo_id).order("fecha");
  if (error) throw error;
  return data;
}

/** Si el grupo no tiene ninguna tarea, siembra las 34 desde la fecha de llegada. */
export async function sembrarSiHaceFalta(grupo_id, fechaLlegada) {
  const { count, error } = await supabase
    .from("plan_tareas").select("id", { count: "exact", head: true }).eq("grupo_id", grupo_id);
  if (error) throw error;
  if (count > 0) return false;

  const base = parseISO(fechaLlegada);
  const filas = BASE.map(([fase, off, prioridad, titulo, detalle, link]) => ({
    grupo_id, fase, prioridad, titulo, detalle, link,
    fecha: toISO(sumarDias(base, off)),
    origen: "base",
    estado: "pendiente",
  }));
  const { error: e2 } = await supabase.from("plan_tareas").insert(filas);
  if (e2) throw e2;
  return true;
}

export async function agregarTarea(t) {
  const { data, error } = await supabase.from("plan_tareas").insert(t).select().single();
  if (error) throw error;
  return data;
}

export async function actualizarTarea(id, cambios) {
  const { error } = await supabase.from("plan_tareas").update(cambios).eq("id", id);
  if (error) throw error;
}

export async function borrarTarea(id) {
  const { error } = await supabase.from("plan_tareas").delete().eq("id", id);
  if (error) throw error;
}

export function escucharPlan(grupo_id, alCambiar) {
  const canal = supabase
    .channel(`plan-${grupo_id}`)
    .on("postgres_changes",
      { event: "*", schema: "public", table: "plan_tareas", filter: `grupo_id=eq.${grupo_id}` },
      alCambiar)
    .subscribe();
  return () => supabase.removeChannel(canal);
}

/* Sin OAuth: arma un link que abre Google Calendar con el evento de día
   completo precargado, para que se confirme y guarde a mano. */
export function linkGoogleCalendar(t) {
  if (!t.fecha) return null;
  const siguiente = sumarDias(parseISO(t.fecha), 1);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: t.titulo,
    dates: `${t.fecha.replace(/-/g, "")}/${toISO(siguiente).replace(/-/g, "")}`,
    details: t.detalle || "",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
