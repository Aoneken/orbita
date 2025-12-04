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
