// ==========================================
// VALIDACIÓN DE INPUTS - Security Layer
// ==========================================
// Esquemas Zod para validar inputs antes de enviar a la API
// Previene SQL Injection, XSS y payloads malformados

import { z } from "zod";

// ==========================================
// CONSTANTES DE SEGURIDAD
// ==========================================

/** Longitud máxima para campos de búsqueda */
const MAX_SEARCH_LENGTH = 200;

/** Longitud máxima para campos de texto corto */
const MAX_SHORT_TEXT = 100;

/** Caracteres potencialmente peligrosos para SQL/NoSQL Injection y PostgREST apps */
const DANGEROUS_PATTERNS = /[;'"\\<>{}|`(),:%]/g;

/** Patrón de fecha válido: YYYY-MM-DD */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// ==========================================
// FUNCIONES DE SANITIZACIÓN
// ==========================================

/**
 * Sanitiza un string removiendo caracteres peligrosos
 * y limitando longitud
 */
export function sanitizeString(
  input: string,
  maxLength = MAX_SEARCH_LENGTH
): string {
  if (!input || typeof input !== "string") return "";

  return input
    .trim()
    .slice(0, maxLength)
    .replace(DANGEROUS_PATTERNS, "")
    .replace(/\s+/g, " "); // Normalizar espacios múltiples
}

/**
 * Valida y sanitiza una fecha en formato YYYY-MM-DD
 */
export function sanitizeDate(input: string | undefined): string | undefined {
  if (!input) return undefined;

  const trimmed = input.trim();
  if (!DATE_PATTERN.test(trimmed)) return undefined;

  // Validar que sea una fecha real
  const date = new Date(trimmed);
  if (isNaN(date.getTime())) return undefined;

  return trimmed;
}

// ==========================================
// ESQUEMAS ZOD
// ==========================================

/**
 * Esquema para búsqueda de avisos
 */
export const busquedaSchema = z
  .string()
  .max(MAX_SEARCH_LENGTH, "La búsqueda es demasiado larga")
  .transform((val) => sanitizeString(val))
  .optional();

/**
 * Esquema para filtros de fecha
 */
export const fechaSchema = z
  .string()
  .regex(DATE_PATTERN, "Formato de fecha inválido (YYYY-MM-DD)")
  .refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    },
    { message: "Fecha inválida" }
  )
  .optional();

/**
 * Esquema para rango de fechas
 */
export const rangoFechasSchema = z
  .object({
    desde: fechaSchema,
    hasta: fechaSchema,
  })
  .refine(
    (data) => {
      if (data.desde && data.hasta) {
        return new Date(data.desde) <= new Date(data.hasta);
      }
      return true;
    },
    { message: "La fecha 'desde' debe ser anterior a 'hasta'" }
  );

/**
 * Esquema para subrubro
 */
export const subrubroSchema = z
  .string()
  .max(MAX_SHORT_TEXT)
  .transform((val) => sanitizeString(val, MAX_SHORT_TEXT))
  .optional();

/**
 * Esquema para etiquetas (array de strings)
 */
export const etiquetasSchema = z
  .array(
    z
      .string()
      .max(50)
      .transform((val) => sanitizeString(val, 50))
  )
  .max(10, "Máximo 10 etiquetas permitidas")
  .optional();

/**
 * Esquema completo para filtros de avisos
 */
export const filtrosAvisoSchema = z.object({
  busqueda: busquedaSchema,
  subrubro: subrubroSchema,
  emisor: subrubroSchema,
  etiquetas: etiquetasSchema,
  fechaDesde: fechaSchema,
  fechaHasta: fechaSchema,
  fechaExacta: fechaSchema,
});

// ==========================================
// TIPOS INFERIDOS
// ==========================================

export type ValidatedFiltrosAviso = z.infer<typeof filtrosAvisoSchema>;
export type ValidatedRangoFechas = z.infer<typeof rangoFechasSchema>;

// ==========================================
// FUNCIONES DE VALIDACIÓN
// ==========================================

/**
 * Valida filtros de avisos antes de enviar a la API
 * Retorna filtros sanitizados o null si hay error
 */
export function validateFiltros(
  filtros: unknown
): ValidatedFiltrosAviso | null {
  const result = filtrosAvisoSchema.safeParse(filtros);

  if (!result.success) {
    // En producción, no logueamos errores - solo rechazamos silenciosamente
    return null;
  }

  return result.data;
}

/**
 * Valida un string de búsqueda
 * Retorna string sanitizado o vacío si es inválido
 */
export function validateBusqueda(busqueda: string): string {
  const result = busquedaSchema.safeParse(busqueda);
  return result.success ? result.data ?? "" : "";
}

/**
 * Valida rango de fechas
 */
export function validateRangoFechas(
  rango: unknown
): ValidatedRangoFechas | null {
  const result = rangoFechasSchema.safeParse(rango);
  return result.success ? result.data : null;
}
