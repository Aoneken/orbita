import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea una fecha en formato dd/mm/aa o "Hoy"/"Ayer" según corresponda
 * @param fechaStr - Fecha en formato YYYY-MM-DD o Date
 * @returns String formateado: "Hoy", "Ayer", o "dd/mm/aa"
 */
export function formatearFechaCorta(fechaStr: string | Date): string {
  if (!fechaStr) return "";

  try {
    const fecha =
      typeof fechaStr === "string"
        ? new Date(fechaStr + "T12:00:00")
        : fechaStr;

    if (isNaN(fecha.getTime())) return "";

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    const fechaComparar = new Date(fecha);
    fechaComparar.setHours(0, 0, 0, 0);

    if (fechaComparar.getTime() === hoy.getTime()) {
      return "Hoy";
    }

    if (fechaComparar.getTime() === ayer.getTime()) {
      return "Ayer";
    }

    // Formato dd/mm/aa
    const dia = fecha.getDate().toString().padStart(2, "0");
    const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
    const año = fecha.getFullYear().toString().slice(-2);

    return `${dia}/${mes}/${año}`;
  } catch {
    return "";
  }
}

/**
 * Formatea una fecha de forma legible completa
 * @param fechaStr - Fecha en formato YYYY-MM-DD
 * @returns String formateado: "Hoy, martes 3 de diciembre" o "Ayer, lunes 2 de diciembre" o fecha completa
 */
export function formatearFechaCompleta(fechaStr: string | undefined): string {
  if (!fechaStr) return "";

  try {
    const fecha = new Date(fechaStr + "T12:00:00");
    if (isNaN(fecha.getTime())) return fechaStr;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    const fechaComparar = new Date(fecha);
    fechaComparar.setHours(0, 0, 0, 0);

    const opciones: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };

    const fechaFormateada = fecha.toLocaleDateString("es-AR", opciones);
    const fechaCapitalizada =
      fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);

    if (fechaComparar.getTime() === hoy.getTime()) {
      return `Hoy, ${fechaFormateada}`;
    }

    if (fechaComparar.getTime() === ayer.getTime()) {
      return `Ayer, ${fechaFormateada}`;
    }

    // Agregar año si no es del año actual
    if (fecha.getFullYear() !== hoy.getFullYear()) {
      return `${fechaCapitalizada} de ${fecha.getFullYear()}`;
    }

    return fechaCapitalizada;
  } catch {
    return fechaStr;
  }
}

/**
 * Formatea una fecha en formato absoluto DD/MM/YYYY
 * PARA USO EN EXPORTS (capturas, compartir) - nunca usa "Hoy" o "Ayer"
 * @param fechaStr - Fecha en formato YYYY-MM-DD o Date
 * @returns String formateado: "04/12/2025"
 */
export function formatearFechaAbsoluta(
  fechaStr: string | Date | null | undefined
): string {
  if (!fechaStr) {
    // Si no hay fecha, devolver la fecha de hoy en formato absoluto
    const hoy = new Date();
    const dia = hoy.getDate().toString().padStart(2, "0");
    const mes = (hoy.getMonth() + 1).toString().padStart(2, "0");
    const año = hoy.getFullYear();
    return `${dia}/${mes}/${año}`;
  }

  try {
    const fecha =
      typeof fechaStr === "string"
        ? new Date(fechaStr + "T12:00:00")
        : fechaStr;

    if (isNaN(fecha.getTime())) {
      // Fallback a hoy si la fecha es inválida
      const hoy = new Date();
      const dia = hoy.getDate().toString().padStart(2, "0");
      const mes = (hoy.getMonth() + 1).toString().padStart(2, "0");
      const año = hoy.getFullYear();
      return `${dia}/${mes}/${año}`;
    }

    const dia = fecha.getDate().toString().padStart(2, "0");
    const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
    const año = fecha.getFullYear();

    return `${dia}/${mes}/${año}`;
  } catch {
    // Fallback a hoy si hay error
    const hoy = new Date();
    const dia = hoy.getDate().toString().padStart(2, "0");
    const mes = (hoy.getMonth() + 1).toString().padStart(2, "0");
    const año = hoy.getFullYear();
    return `${dia}/${mes}/${año}`;
  }
}

/**
 * Formatea emisor en Title Case
 */
export function formatearEmisor(emisor: string): string {
  if (!emisor) return emisor;
  return emisor
    .toLowerCase()
    .split(" ")
    .map((word) => {
      const minusculas = [
        "de",
        "del",
        "la",
        "las",
        "los",
        "el",
        "y",
        "e",
        "en",
      ];
      if (minusculas.includes(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ")
    .replace(/^./, (c) => c.toUpperCase());
}

// ==========================================
// DICCIONARIO DE ABREVIATURAS DE ORGANISMOS
// ==========================================

/**
 * Diccionario de abreviaturas oficiales y comunes.
 * Las claves están normalizadas (minúsculas, sin tildes).
 */
const ORGANISMOS_ABREVIATURAS: Record<string, string> = {
  // Siglas oficiales ampliamente conocidas
  "banco central de la republica argentina": "BCRA",
  "administracion federal de ingresos publicos": "AFIP",
  "administracion nacional de la seguridad social": "ANSES",
  "poder ejecutivo nacional": "PEN",
  "honorable congreso de la nacion": "HCN",
  "comision nacional de valores": "CNV",
  "superintendencia de seguros de la nacion": "SSN",
  "ente nacional regulador de la electricidad": "ENRE",
  "ente nacional regulador del gas": "ENARGAS",
  "instituto nacional de estadistica y censos": "INDEC",
  "consejo nacional de investigaciones cientificas y tecnicas": "CONICET",
  "universidad de buenos aires": "UBA",
  "agencia nacional de seguridad vial": "ANSV",
  "secretaria de energia": "Sec. Energía",

  // Ministerios - abreviaturas legibles
  "ministerio de economia": "Min. Economía",
  "ministerio de capital humano": "Min. Cap. Humano",
  "ministerio de seguridad": "Min. Seguridad",
  "ministerio de defensa": "Min. Defensa",
  "ministerio de salud": "Min. Salud",
  "ministerio de justicia": "Min. Justicia",
  "ministerio de relaciones exteriores, comercio internacional y culto":
    "Min. RREE",
  "ministerio de relaciones exteriores comercio internacional y culto":
    "Min. RREE",
  "ministerio del interior": "Min. Interior",
  "ministerio de infraestructura": "Min. Infraestructura",
  "ministerio de desregulacion y transformacion del estado": "Min. Desreg.",

  // Secretarías comunes
  "jefatura de gabinete de ministros": "Jef. Gabinete",
  "secretaria legal y tecnica": "Sec. Legal y Técnica",
  "secretaria de trabajo, empleo y seguridad social": "Sec. Trabajo",
  "secretaria de trabajo empleo y seguridad social": "Sec. Trabajo",
  "secretaria de comercio interior": "Sec. Comercio Int.",
  "secretaria de comercio exterior": "Sec. Comercio Ext.",
  "secretaria de hacienda": "Sec. Hacienda",
  "secretaria de finanzas": "Sec. Finanzas",
  "secretaria de industria y comercio": "Sec. Industria",
  "secretaria de agricultura, ganaderia y pesca": "Sec. Agricultura",
  "secretaria de agricultura ganaderia y pesca": "Sec. Agricultura",
  "secretaria de transporte": "Sec. Transporte",
  "secretaria de mineria": "Sec. Minería",

  // Otros organismos frecuentes
  "inspeccion general de justicia": "IGJ",
  "autoridad regulatoria nuclear": "ARN",
  "servicio nacional de sanidad y calidad agroalimentaria": "SENASA",
  "administracion de parques nacionales": "APN",
  "direccion nacional de migraciones": "DNM",
  "registro nacional de las personas": "RENAPER",
  "instituto nacional de tecnologia agropecuaria": "INTA",
  "instituto nacional de tecnologia industrial": "INTI",
  "instituto nacional de cine y artes audiovisuales": "INCAA",
  "agencia de acceso a la informacion publica": "AAIP",
  "sindicatura general de la nacion": "SIGEN",
  "auditoria general de la nacion": "AGN",
};

/**
 * Normaliza texto para búsqueda en diccionario (minúsculas, sin tildes)
 */
function normalizarParaBusqueda(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Diccionario de abreviaturas agresivas para palabras comunes.
 * Se aplican después de extraer el organismo principal.
 */
const ABREVIATURAS_PALABRAS: Record<string, string> = {
  ministerio: "Min.",
  secretaria: "Sec.",
  secretaría: "Sec.",
  direccion: "Dir.",
  dirección: "Dir.",
  nacional: "Nac.",
  general: "Gral.",
  provincial: "Prov.",
  administracion: "Adm.",
  administración: "Adm.",
  subsecretaria: "Subsec.",
  subsecretaría: "Subsec.",
  superintendencia: "Sup.",
  instituto: "Inst.",
  comision: "Com.",
  comisión: "Com.",
  autoridad: "Aut.",
  agencia: "Ag.",
  oficina: "Of.",
  departamento: "Dpto.",
  coordinacion: "Coord.",
  coordinación: "Coord.",
  regulacion: "Reg.",
  regulación: "Reg.",
  trabajo: "Trab.",
  relaciones: "Rel.",
  internacional: "Int.",
  internacionales: "Int.",
  exterior: "Ext.",
  exteriores: "Ext.",
  economia: "Econ.",
  economía: "Econ.",
  desarrollo: "Des.",
  humano: "Hum.",
  capital: "Cap.",
  seguridad: "Seg.",
  social: "Soc.",
  justicia: "Just.",
  ambiente: "Amb.",
  transporte: "Transp.",
  infraestructura: "Infraest.",
  educacion: "Educ.",
  educación: "Educ.",
  ciencia: "Cs.",
  tecnologia: "Tec.",
  tecnología: "Tec.",
  produccion: "Prod.",
  producción: "Prod.",
  comercio: "Com.",
  interior: "Int.",
  defensa: "Def.",
  hacienda: "Hac.",
  finanzas: "Fin.",
  agricultura: "Agric.",
  ganaderia: "Gan.",
  ganadería: "Gan.",
  pesca: "Pesca",
  mineria: "Min.",
  minería: "Min.",
  energia: "Energ.",
  energía: "Energ.",
  comunicaciones: "Com.",
  telecomunicaciones: "Telecom.",
  federal: "Fed.",
  publica: "Púb.",
  pública: "Púb.",
  publico: "Púb.",
  público: "Púb.",
  argentina: "Arg.",
  republica: "Rep.",
  república: "Rep.",
};

/**
 * Aplica abreviaturas agresivas a cada palabra del texto.
 */
function aplicarAbreviaturasAgresivas(texto: string): string {
  return texto
    .split(" ")
    .map((word) => {
      const wordLower = word.toLowerCase();
      // Palabras comunes a mantener en minúscula
      const minusculas = [
        "de",
        "del",
        "la",
        "las",
        "los",
        "el",
        "y",
        "e",
        "en",
        "a",
      ];
      if (minusculas.includes(wordLower)) return "";

      // Buscar abreviatura
      if (ABREVIATURAS_PALABRAS[wordLower]) {
        return ABREVIATURAS_PALABRAS[wordLower];
      }

      // Capitalizar primera letra
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .filter(Boolean)
    .join(" ");
}

/**
 * Formatea el nombre de un organismo usando abreviaturas conocidas.
 * Prioriza la brevedad: extrae el organismo principal (antes del guión)
 * y aplica abreviaturas agresivas.
 *
 * @param nombre - Nombre completo del organismo
 * @returns Nombre abreviado y corto
 */
export function formatOrganismoName(nombre: string): string {
  if (!nombre) return nombre;

  // 1. Si tiene guiones, tomar solo la primera parte (organismo principal)
  let organismoBase = nombre;
  if (nombre.includes(" - ")) {
    organismoBase = nombre.split(" - ")[0].trim();
  } else if (nombre.includes("-")) {
    // Guión sin espacios también
    const partes = nombre.split("-");
    if (partes[0].length > 3) {
      organismoBase = partes[0].trim();
    }
  }

  const normalizado = normalizarParaBusqueda(organismoBase);

  // 2. Buscar coincidencia exacta en diccionario de siglas conocidas
  if (ORGANISMOS_ABREVIATURAS[normalizado]) {
    return ORGANISMOS_ABREVIATURAS[normalizado];
  }

  // 3. Buscar coincidencia parcial en diccionario
  for (const [clave, abreviatura] of Object.entries(ORGANISMOS_ABREVIATURAS)) {
    if (normalizado.includes(clave) || clave.includes(normalizado)) {
      return abreviatura;
    }
  }

  // 4. Aplicar abreviaturas agresivas palabra por palabra
  return aplicarAbreviaturasAgresivas(organismoBase);
}

/**
 * Formatea una fecha de actualización en formato compacto (24hs)
 * NOTA: La BD almacena fechas en UTC (sin timezone indicator).
 * Convertimos a hora Argentina (UTC-3).
 * @param fechaStr - Fecha en formato ISO UTC (ej: "2025-12-04T03:40:00")
 * @returns String formateado: "4/12 00:40hs" (hora Argentina)
 */
export function formatearActualizacion(fechaStr: string): string {
  if (!fechaStr) return "";
  try {
    // Extraer componentes del string ISO (que está en UTC)
    const match = fechaStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (!match) return "";

    const [, year, mes, dia, hora, minutos] = match;

    // Crear fecha en UTC y convertir a Argentina (UTC-3)
    const fechaUtc = new Date(
      Date.UTC(
        parseInt(year),
        parseInt(mes) - 1,
        parseInt(dia),
        parseInt(hora),
        parseInt(minutos)
      )
    );

    // Formatear en timezone Argentina
    const opciones: Intl.DateTimeFormatOptions = {
      timeZone: "America/Buenos_Aires",
      day: "numeric",
      month: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    const partes = new Intl.DateTimeFormat("es-AR", opciones).formatToParts(
      fechaUtc
    );
    const diaArg = partes.find((p) => p.type === "day")?.value || "";
    const mesArg = partes.find((p) => p.type === "month")?.value || "";
    const horaArg = partes.find((p) => p.type === "hour")?.value || "";
    const minutosArg = partes.find((p) => p.type === "minute")?.value || "";

    return `${diaArg}/${mesArg} ${horaArg}:${minutosArg}hs`;
  } catch {
    return "";
  }
}
