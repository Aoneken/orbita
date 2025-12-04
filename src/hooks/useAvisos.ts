import { supabase } from "@/lib/supabase";
import { sanitizeDate, sanitizeString } from "@/lib/validation";
import type { AvisoBora, EnvioTelegram, FiltrosAviso } from "@/types";
import { useQuery } from "@tanstack/react-query";

// ==========================================
// CONSTANTES DE SEGURIDAD
// ==========================================

/** Límite máximo de resultados para prevenir DoS */
const MAX_LIMIT = 1000;

/** Longitud máxima de búsqueda */
const MAX_SEARCH_LENGTH = 200;

/**
 * Hook para obtener la síntesis del día desde envios_telegram
 * Esta tabla contiene la síntesis IA profesional y estadísticas pre-calculadas
 * Ajustado para UTC-3 (Argentina): El día comienza a las 03:00 UTC y termina a las 03:00 UTC del día siguiente
 */
export function useSintesisTelegram(fechaSeleccionada?: string) {
  return useQuery({
    queryKey: ["sintesis-telegram", fechaSeleccionada],
    queryFn: async () => {
      let query = supabase.from("envios_telegram").select("*");

      if (fechaSeleccionada) {
        // Calcular rango en UTC para el día de Argentina (UTC-3)
        // 00:00 ART = 03:00 UTC
        const fechaInicio = new Date(`${fechaSeleccionada}T03:00:00Z`);

        const fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaFin.getDate() + 1); // +24 horas exactas (hasta 03:00 UTC del día siguiente)

        query = query
          .gte("fecha_envio", fechaInicio.toISOString())
          .lt("fecha_envio", fechaFin.toISOString());
      } else {
        // Obtener la más reciente
        query = query.order("fecha_envio", { ascending: false }).limit(1);
      }

      const { data, error } = await query.single();

      if (error) throw error;
      return data as EnvioTelegram;
    },
  });
}

/**
 * Hook para obtener los decretos del último día (para mostrar en síntesis)
 */
export function useDecretosDelDia(fechaSeleccionada?: string) {
  return useQuery({
    queryKey: ["decretos-del-dia", fechaSeleccionada],
    queryFn: async () => {
      let fecha = fechaSeleccionada;

      if (!fecha) {
        // Obtener la última fecha con datos
        const { data: ultimaFecha, error: errorFecha } = await supabase
          .from("avisos_bora")
          .select("fecha_publicacion")
          .order("fecha_publicacion", { ascending: false })
          .limit(1)
          .single();

        if (errorFecha) throw errorFecha;
        fecha = ultimaFecha.fecha_publicacion;
      }

      // Obtener decretos de ese día
      const { data: decretos, error: errorDecretos } = await supabase
        .from("avisos_bora")
        .select("*")
        .eq("fecha_publicacion", fecha)
        .eq("subrubro", "Decreto")
        .limit(5);

      if (errorDecretos) throw errorDecretos;

      return {
        fecha: fecha,
        decretos: decretos as AvisoBora[],
      };
    },
  });
}

/**
 * Hook para obtener avisos con filtros opcionales
 * Incluye sanitización de inputs para prevenir injection attacks
 */
export function useAvisos(filtros?: FiltrosAviso, limite = 50) {
  // Sanitizar límite para prevenir DoS
  const safeLimite = Math.min(Math.max(1, limite), MAX_LIMIT);

  return useQuery({
    queryKey: ["avisos", filtros, safeLimite],
    queryFn: async () => {
      let query = supabase
        .from("avisos_bora")
        .select("*")
        .order("fecha_publicacion", { ascending: false })
        .limit(safeLimite);

      // Sanitizar búsqueda antes de usar en query
      if (filtros?.busqueda) {
        const safeBusqueda = sanitizeString(
          filtros.busqueda,
          MAX_SEARCH_LENGTH
        );
        if (safeBusqueda) {
          query = query.or(
            `titulo.ilike.%${safeBusqueda}%,descripcion_ia.ilike.%${safeBusqueda}%,resumen_ia.ilike.%${safeBusqueda}%`
          );
        }
      }

      if (filtros?.subrubro) {
        const safeSubrubro = sanitizeString(filtros.subrubro, 100);
        if (safeSubrubro) {
          query = query.eq("subrubro", safeSubrubro);
        }
      }

      if (filtros?.emisor) {
        const safeEmisor = sanitizeString(filtros.emisor, 100);
        if (safeEmisor) {
          query = query.ilike("emisor", `%${safeEmisor}%`);
        }
      }

      // Sanitizar fechas
      const safeFechaExacta = sanitizeDate(filtros?.fechaExacta);
      const safeFechaDesde = sanitizeDate(filtros?.fechaDesde);
      const safeFechaHasta = sanitizeDate(filtros?.fechaHasta);

      // Fecha exacta tiene prioridad sobre rango de fechas
      if (safeFechaExacta) {
        query = query.eq("fecha_publicacion", safeFechaExacta);
      } else {
        if (safeFechaDesde) {
          query = query.gte("fecha_publicacion", safeFechaDesde);
        }

        if (safeFechaHasta) {
          query = query.lte("fecha_publicacion", safeFechaHasta);
        }
      }

      // Usar overlaps para encontrar avisos que tengan AL MENOS UNA de las etiquetas
      if (filtros?.etiquetas && filtros.etiquetas.length > 0) {
        query = query.overlaps("etiquetas", filtros.etiquetas);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AvisoBora[];
    },
  });
}

/**
 * Hook para obtener un aviso específico
 */
export function useAviso(idAviso: number) {
  return useQuery({
    queryKey: ["aviso", idAviso],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("avisos_bora")
        .select("*")
        .eq("id_aviso", idAviso)
        .single();

      if (error) throw error;
      return data as AvisoBora;
    },
    enabled: !!idAviso,
  });
}

/**
 * Helper para obtener fecha en formato YYYY-MM-DD local (sin conversión a UTC)
 */
function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Hook para obtener estadísticas generales con comparación para tendencias
 */
export function useEstadisticas() {
  return useQuery({
    queryKey: ["estadisticas"],
    queryFn: async () => {
      const hoy = new Date();
      const hoyStr = getLocalDateString(hoy);

      const ayer = new Date(hoy);
      ayer.setDate(ayer.getDate() - 1);
      const ayerStr = getLocalDateString(ayer);

      const hace7Dias = new Date(hoy);
      hace7Dias.setDate(hace7Dias.getDate() - 7);
      const hace7DiasStr = getLocalDateString(hace7Dias);

      const hace14Dias = new Date(hoy);
      hace14Dias.setDate(hace14Dias.getDate() - 14);
      const hace14DiasStr = getLocalDateString(hace14Dias);

      // Total de avisos
      const { count: total } = await supabase
        .from("avisos_bora")
        .select("*", { count: "exact", head: true });

      // Avisos de hoy
      const { count: hoyCount } = await supabase
        .from("avisos_bora")
        .select("*", { count: "exact", head: true })
        .eq("fecha_publicacion", hoyStr);

      // Avisos de ayer (para tendencia)
      const { count: ayerCount } = await supabase
        .from("avisos_bora")
        .select("*", { count: "exact", head: true })
        .eq("fecha_publicacion", ayerStr);

      // Últimos 7 días
      const { count: semanaCount } = await supabase
        .from("avisos_bora")
        .select("*", { count: "exact", head: true })
        .gte("fecha_publicacion", hace7DiasStr);

      // Semana anterior (para tendencia: 7-14 días atrás)
      const { count: semanaAnteriorCount } = await supabase
        .from("avisos_bora")
        .select("*", { count: "exact", head: true })
        .gte("fecha_publicacion", hace14DiasStr)
        .lt("fecha_publicacion", hace7DiasStr);

      return {
        total: total || 0,
        hoy: hoyCount || 0,
        ayer: ayerCount || 0,
        semana: semanaCount || 0,
        semanaAnterior: semanaAnteriorCount || 0,
      };
    },
  });
}

/**
 * Hook para obtener conteo por subrubro
 * @param rangoFechas - Rango opcional. Si no se proporciona, usa últimos 30 días.
 */
export function useConteoSubrubros(rangoFechas?: {
  desde?: string;
  hasta?: string;
}) {
  const tieneRango = rangoFechas?.desde || rangoFechas?.hasta;

  return useQuery({
    queryKey: ["conteo-subrubros", rangoFechas?.desde, rangoFechas?.hasta],
    queryFn: async () => {
      let query = supabase.from("avisos_bora").select("subrubro");

      if (tieneRango) {
        if (rangoFechas?.desde) {
          query = query.gte("fecha_publicacion", rangoFechas.desde);
        }
        if (rangoFechas?.hasta) {
          query = query.lte("fecha_publicacion", rangoFechas.hasta);
        }
      } else {
        // Default: últimos 30 días
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 30);
        query = query.gte("fecha_publicacion", getLocalDateString(fechaLimite));
      }

      const { data, error } = await query;

      if (error) throw error;

      // Agregación con normalización para evitar duplicados por variaciones de texto
      const conteo = new Map<string, number>();
      data.forEach((item) => {
        // Normalizar: trim + colapsar espacios múltiples
        const sr = (item.subrubro || "Sin clasificar")
          .trim()
          .replace(/\s+/g, " ");
        conteo.set(sr, (conteo.get(sr) || 0) + 1);
      });

      return Array.from(conteo.entries())
        .map(([subrubro, cantidad]) => ({ subrubro, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad);
    },
  });
}

/**
 * Hook para obtener conteo por etiquetas
 * @param rangoFechas - Rango opcional. Si no se proporciona, usa últimos 30 días.
 */
export function useConteoEtiquetas(rangoFechas?: {
  desde?: string;
  hasta?: string;
}) {
  const tieneRango = rangoFechas?.desde || rangoFechas?.hasta;

  return useQuery({
    queryKey: ["conteo-etiquetas", rangoFechas?.desde, rangoFechas?.hasta],
    queryFn: async () => {
      let query = supabase.from("avisos_bora").select("etiquetas");

      if (tieneRango) {
        if (rangoFechas?.desde) {
          query = query.gte("fecha_publicacion", rangoFechas.desde);
        }
        if (rangoFechas?.hasta) {
          query = query.lte("fecha_publicacion", rangoFechas.hasta);
        }
      } else {
        // Default: últimos 30 días
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 30);
        query = query.gte("fecha_publicacion", getLocalDateString(fechaLimite));
      }

      const { data, error } = await query;

      if (error) throw error;

      // Agregación con normalización para evitar duplicados por variaciones de texto
      const conteo = new Map<string, number>();
      data.forEach((item) => {
        if (item.etiquetas && Array.isArray(item.etiquetas)) {
          item.etiquetas.forEach((et: string) => {
            // Normalizar: trim + colapsar espacios múltiples
            const etNorm = et.trim().replace(/\s+/g, " ");
            if (etNorm) {
              conteo.set(etNorm, (conteo.get(etNorm) || 0) + 1);
            }
          });
        }
      });

      return Array.from(conteo.entries())
        .map(([etiqueta, cantidad]) => ({ etiqueta, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad);
    },
  });
}

/**
 * Hook para obtener top emisores
 * @param limite - Cantidad máxima de emisores a retornar
 * @param rangoFechas - Rango opcional. Si no se proporciona, usa últimos 30 días.
 */
export function useTopEmisores(
  limite = 20,
  rangoFechas?: { desde?: string; hasta?: string }
) {
  const tieneRango = rangoFechas?.desde || rangoFechas?.hasta;

  return useQuery({
    queryKey: ["top-emisores", limite, rangoFechas?.desde, rangoFechas?.hasta],
    queryFn: async () => {
      let query = supabase.from("avisos_bora").select("emisor");

      if (tieneRango) {
        if (rangoFechas?.desde) {
          query = query.gte("fecha_publicacion", rangoFechas.desde);
        }
        if (rangoFechas?.hasta) {
          query = query.lte("fecha_publicacion", rangoFechas.hasta);
        }
      } else {
        // Default: últimos 30 días
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 30);
        query = query.gte("fecha_publicacion", getLocalDateString(fechaLimite));
      }

      const { data, error } = await query;

      if (error) throw error;

      // Agregación con normalización para evitar duplicados por variaciones de texto
      const conteo = new Map<string, number>();
      data.forEach((item) => {
        // Normalizar: trim + colapsar espacios múltiples
        const emisor = (item.emisor || "Sin emisor")
          .trim()
          .replace(/\s+/g, " ");
        conteo.set(emisor, (conteo.get(emisor) || 0) + 1);
      });

      return Array.from(conteo.entries())
        .map(([emisor, cantidad]) => ({ emisor, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, limite);
    },
  });
}

/**
 * Hook para obtener avisos por fecha (para gráfico de actividad)
 * @param rangoFechas - Rango opcional. Si no se proporciona, usa últimos 14 días.
 */
export function useAvisosPorFecha(rangoFechas?: {
  desde?: string;
  hasta?: string;
}) {
  const tieneRango = rangoFechas?.desde || rangoFechas?.hasta;

  return useQuery({
    queryKey: ["avisos-por-fecha", rangoFechas?.desde, rangoFechas?.hasta],
    queryFn: async () => {
      let query = supabase.from("avisos_bora").select("fecha_publicacion");

      if (tieneRango) {
        if (rangoFechas?.desde) {
          query = query.gte("fecha_publicacion", rangoFechas.desde);
        }
        if (rangoFechas?.hasta) {
          query = query.lte("fecha_publicacion", rangoFechas.hasta);
        }
      } else {
        // Default: últimos 14 días (para mostrar actividad reciente)
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 14);
        query = query.gte("fecha_publicacion", getLocalDateString(fechaLimite));
      }

      const { data, error } = await query;

      if (error) throw error;

      const conteo: Record<string, number> = {};
      data.forEach((item) => {
        const fecha = item.fecha_publicacion;
        conteo[fecha] = (conteo[fecha] || 0) + 1;
      });

      return Object.entries(conteo)
        .map(([fecha, cantidad]) => ({ fecha, cantidad }))
        .sort((a, b) => b.fecha.localeCompare(a.fecha));
    },
  });
}

/**
 * Hook para obtener la fecha de última actualización de la BD
 */
export function useUltimaActualizacion() {
  return useQuery({
    queryKey: ["ultima-actualizacion"],
    queryFn: async () => {
      // Obtener el registro más reciente de envios_telegram
      const { data, error } = await supabase
        .from("envios_telegram")
        .select("fecha_envio")
        .order("fecha_envio", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data.fecha_envio as string;
    },
  });
}

/**
 * Hook para verificar el estado de conexión a la base de datos
 * Retorna true si hay conexión, false si no
 */
export function useConnectionStatus() {
  return useQuery({
    queryKey: ["connection-status"],
    queryFn: async () => {
      try {
        // Hacer un query sencillo para verificar conexión
        const { error } = await supabase
          .from("envios_telegram")
          .select("id")
          .limit(1);

        return !error;
      } catch {
        return false;
      }
    },
    refetchInterval: 30000, // Verificar cada 30 segundos
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook para obtener las fechas que tienen síntesis disponible
 * Usado para el selector de fecha en la vista de inicio
 * Ajustado para UTC-3: Resta 3 horas antes de extraer la fecha
 */
export function useFechasConSintesis() {
  return useQuery({
    queryKey: ["fechas-con-sintesis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("envios_telegram")
        .select("fecha_envio")
        .not("sintesis_ia", "is", null)
        .order("fecha_envio", { ascending: false });

      if (error) throw error;

      // Extraer solo la parte de fecha del timestamp ajustado a UTC-3
      const fechasUnicas = new Set<string>();
      data.forEach((d) => {
        // Crear fecha desde UTC
        const fechaUTC = new Date(d.fecha_envio as string);
        // Restar 3 horas para obtener hora Argentina
        fechaUTC.setHours(fechaUTC.getHours() - 3);

        const fechaStr = fechaUTC.toISOString().split("T")[0];
        fechasUnicas.add(fechaStr);
      });

      return Array.from(fechasUnicas);
    },
  });
}
