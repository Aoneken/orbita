// ==========================================
// DEFINICIÓN DEL CONTEXTO DE FECHA
// ==========================================
// Separado del Provider para optimizar Fast Refresh

import { createContext } from "react";

import type { RangoFechas } from "@/types";

// ==========================================
// TIPOS
// ==========================================

export interface FechaContextType {
  // Fecha única (para InicioView, PortalView)
  fechaSeleccionada: string | undefined;
  setFechaSeleccionada: (fecha: string | undefined) => void;

  // Rango de fechas (para ExplorarView)
  rangoFechas: RangoFechas;
  setRangoFechas: (rango: RangoFechas) => void;

  // Limpiar todo
  resetFechas: () => void;
}

// ==========================================
// CONTEXTO
// ==========================================

export const FechaContext = createContext<FechaContextType | undefined>(
  undefined
);
