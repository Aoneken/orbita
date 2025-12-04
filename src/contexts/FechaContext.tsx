// ==========================================
// PROVIDER DE FECHA
// ==========================================
// Solo exporta el componente Provider para Fast Refresh.
// El contexto y tipos están en FechaContextDef.ts
// Los hooks están en useFechaHooks.ts

import { useCallback, useMemo, useState, type ReactNode } from "react";

import type { RangoFechas } from "@/types";

import { FechaContext, type FechaContextType } from "./FechaContextDef";

// ==========================================
// PROVIDER
// ==========================================

interface FechaProviderProps {
  children: ReactNode;
  // Permite inicializar con una fecha específica (opcional)
  fechaInicial?: string;
}

export function FechaProvider({ children, fechaInicial }: FechaProviderProps) {
  const [fechaSeleccionada, setFechaSeleccionadaState] = useState<
    string | undefined
  >(fechaInicial);

  const [rangoFechas, setRangoFechasState] = useState<RangoFechas>({
    desde: undefined,
    hasta: undefined,
  });

  // Memoizar setters para evitar re-renders innecesarios
  const setFechaSeleccionada = useCallback((fecha: string | undefined) => {
    setFechaSeleccionadaState(fecha);
  }, []);

  const setRangoFechas = useCallback((rango: RangoFechas) => {
    setRangoFechasState(rango);
  }, []);

  const resetFechas = useCallback(() => {
    setFechaSeleccionadaState(undefined);
    setRangoFechasState({ desde: undefined, hasta: undefined });
  }, []);

  // Memoizar el valor del contexto
  const value = useMemo<FechaContextType>(
    () => ({
      fechaSeleccionada,
      setFechaSeleccionada,
      rangoFechas,
      setRangoFechas,
      resetFechas,
    }),
    [
      fechaSeleccionada,
      setFechaSeleccionada,
      rangoFechas,
      setRangoFechas,
      resetFechas,
    ]
  );

  return (
    <FechaContext.Provider value={value}>{children}</FechaContext.Provider>
  );
}
