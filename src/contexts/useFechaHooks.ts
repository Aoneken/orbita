// ==========================================
// HOOKS DE FECHA - Separados para Fast Refresh
// ==========================================
// Estos hooks se mueven aquí para evitar el warning
// "Fast refresh only works when a file only exports components"

import { useContext } from "react";

import { FechaContext, type FechaContextType } from "./FechaContextDef";

/**
 * Hook para acceder al contexto de fecha.
 * Lanza error si se usa fuera de FechaProvider.
 */
export function useFechaContext(): FechaContextType {
  const context = useContext(FechaContext);
  if (!context) {
    throw new Error("useFechaContext debe usarse dentro de FechaProvider");
  }
  return context;
}

/**
 * Hook simplificado para fecha única (Inicio, Portal).
 */
export function useFechaSeleccionada() {
  const { fechaSeleccionada, setFechaSeleccionada } = useFechaContext();
  return { fechaSeleccionada, setFechaSeleccionada };
}

/**
 * Hook simplificado para rango de fechas (Explorar).
 */
export function useRangoFechas() {
  const { rangoFechas, setRangoFechas } = useFechaContext();
  return { rangoFechas, setRangoFechas };
}
