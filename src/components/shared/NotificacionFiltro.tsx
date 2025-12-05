// ==========================================
// NOTIFICACIÓN FLOTANTE DE FILTRO ACTIVO
// ==========================================
// Componente reutilizable que muestra un indicador
// flotante cuando hay un filtro de fecha o búsqueda activo.
// Se posiciona pegado al borde inferior del header.

import { Calendar, Filter, Search, X } from "lucide-react";

import type { RangoFechas } from "@/types";

interface NotificacionFiltroProps {
  /** Rango de fechas activo (opcional) */
  rangoFechas?: RangoFechas;
  /** Texto de búsqueda activo (opcional) */
  busqueda?: string;
  /** Callback para limpiar filtro de fecha */
  onClearFecha?: () => void;
  /** Callback para limpiar búsqueda */
  onClearBusqueda?: () => void;
  /** Modo de visualización: "badge" (flotante) o "bar" (barra sticky) */
  variant?: "badge" | "bar";
}

/**
 * Formatea el rango de fechas de forma legible y compacta
 */
function formatearRango(rango: RangoFechas | undefined): string {
  if (!rango?.desde && !rango?.hasta) return "";

  const formatoCorto = (fecha: string | undefined): string => {
    if (!fecha) return "...";
    const [, mes, dia] = fecha.split("-");
    return `${dia}/${mes}`;
  };

  // Si es el mismo día, formato ultra compacto
  if (rango.desde === rango.hasta) {
    return formatoCorto(rango.desde);
  }

  return `${formatoCorto(rango.desde)} → ${formatoCorto(rango.hasta)}`;
}

/**
 * Notificación flotante de filtros activos
 * Se muestra pegada al borde inferior del header
 * Puede mostrar filtro de fecha, búsqueda, o ambos
 */
export function NotificacionFiltro({
  rangoFechas,
  busqueda,
  onClearFecha,
  onClearBusqueda,
  variant = "badge",
}: NotificacionFiltroProps) {
  const tieneRango = !!(rangoFechas?.desde || rangoFechas?.hasta);
  const tieneBusqueda = !!busqueda?.trim();

  // Si no hay filtros activos, no renderizar
  if (!tieneRango && !tieneBusqueda) return null;

  // Variante badge: flotante centrado bajo el header y nav
  // En móvil: top-14 (header h-14)
  // En desktop: top-[104px] = header h-16 (64px) + nav h-12 (48px) - 8px overlap
  if (variant === "badge") {
    return (
      <div className="fixed top-[60px] sm:top-[108px] left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex flex-wrap items-center justify-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full shadow-lg text-sm font-medium max-w-[90vw]">
          {/* Filtro de fecha */}
          {tieneRango && (
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              <span>{formatearRango(rangoFechas)}</span>
              {onClearFecha && (
                <button
                  type="button"
                  onClick={onClearFecha}
                  className="p-0.5 hover:bg-primary-foreground/20 rounded-full transition-colors"
                  aria-label="Limpiar filtro de fecha"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Separador si hay ambos filtros */}
          {tieneRango && tieneBusqueda && (
            <span className="w-px h-4 bg-primary-foreground/30 mx-1" />
          )}

          {/* Filtro de búsqueda */}
          {tieneBusqueda && (
            <div className="flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" />
              <span className="max-w-[120px] truncate">"{busqueda}"</span>
              {onClearBusqueda && (
                <button
                  type="button"
                  onClick={onClearBusqueda}
                  className="p-0.5 hover:bg-primary-foreground/20 rounded-full transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Variante bar: barra sticky
  return (
    <div className="sticky top-14 sm:top-16 z-40 -mx-3 sm:-mx-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="px-4 py-2 bg-background/95 backdrop-blur border-y flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-sm font-medium text-primary overflow-hidden">
          {/* Filtro de fecha */}
          {tieneRango && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="truncate">{formatearRango(rangoFechas)}</span>
              {onClearFecha && (
                <button
                  type="button"
                  onClick={onClearFecha}
                  className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Limpiar filtro de fecha"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Separador si hay ambos filtros */}
          {tieneRango && tieneBusqueda && (
            <span className="w-px h-4 bg-border" />
          )}

          {/* Filtro de búsqueda */}
          {tieneBusqueda && (
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 shrink-0" />
              <span className="truncate max-w-[150px]">"{busqueda}"</span>
              {onClearBusqueda && (
                <button
                  type="button"
                  onClick={onClearBusqueda}
                  className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Botón para limpiar todos los filtros (si hay más de uno) */}
        {tieneRango && tieneBusqueda && onClearFecha && onClearBusqueda && (
          <button
            type="button"
            onClick={() => {
              onClearFecha();
              onClearBusqueda();
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Limpiar todo
          </button>
        )}
      </div>
    </div>
  );
}
