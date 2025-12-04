// ==========================================
// NOTIFICACIÓN FLOTANTE DE FILTRO ACTIVO
// ==========================================
// Componente reutilizable que muestra un indicador
// flotante cuando hay un filtro de fecha activo.
// Se posiciona pegado al borde inferior del header.

import { Calendar, Filter, X } from "lucide-react";

import type { RangoFechas } from "@/types";

interface NotificacionFiltroProps {
  rangoFechas: RangoFechas;
  onClear: () => void;
  /** Modo de visualización: "badge" (flotante) o "bar" (barra sticky) */
  variant?: "badge" | "bar";
}

/**
 * Formatea el rango de fechas de forma legible y compacta
 */
function formatearRango(rango: RangoFechas): string {
  if (!rango.desde && !rango.hasta) return "";

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
 * Notificación flotante de filtro activo
 * Se muestra pegada al borde inferior del header
 */
export function NotificacionFiltro({
  rangoFechas,
  onClear,
  variant = "badge",
}: NotificacionFiltroProps) {
  const tieneRango = !!(rangoFechas.desde || rangoFechas.hasta);

  if (!tieneRango) return null;

  // Variante badge: flotante centrado bajo el header
  if (variant === "badge") {
    return (
      <div className="fixed top-14 sm:top-[104px] left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-b-full shadow-lg text-sm font-medium">
          <Filter className="h-3.5 w-3.5" />
          <span>{formatearRango(rangoFechas)}</span>
          <button
            onClick={onClear}
            className="p-0.5 hover:bg-primary-foreground/20 rounded-full transition-colors"
            aria-label="Limpiar filtro"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Variante bar: barra sticky (para Feed cuando no hay búsqueda)
  return (
    <div className="sticky top-14 sm:top-16 z-40 -mx-3 sm:-mx-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="px-4 py-2 bg-background/95 backdrop-blur border-y flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-primary overflow-hidden">
          <Calendar className="h-4 w-4 shrink-0" />
          <span className="truncate">{formatearRango(rangoFechas)}</span>
        </div>
        <button
          onClick={onClear}
          className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Limpiar filtro"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
