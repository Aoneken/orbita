// ==========================================
// HOOK: usePaginacion
// ==========================================
// Encapsula la lógica de paginación con scroll suave.
// Usado en listas de avisos/decretos en InicioView, ExplorarView, PortalView.

import { useCallback, useEffect, useRef, useState } from "react";

interface UsePaginacionOptions {
  /** Cantidad inicial de elementos a mostrar */
  inicial?: number;
  /** Cantidad de elementos a agregar al paginar */
  incremento?: number;
  /** Offset del header fijo (para calcular scroll) */
  headerOffset?: number;
}

interface UsePaginacionResult {
  /** Cantidad actual de elementos a mostrar */
  cantidadMostrar: number;
  /** Ref para el contenedor de la lista */
  listaRef: React.RefObject<HTMLDivElement | null>;
  /** Función para incrementar la cantidad */
  handleMostrarMas: () => void;
  /** Indica si hay más elementos disponibles */
  hayMas: boolean;
  /** Resetear la paginación */
  reset: () => void;
}

/**
 * Hook para manejar paginación con scroll suave.
 *
 * @param data - Array de datos (para detectar si hay más)
 * @param options - Opciones de configuración
 * @returns Objeto con estado y funciones de paginación
 *
 * @example
 * ```tsx
 * const { cantidadMostrar, listaRef, handleMostrarMas, hayMas } = usePaginacion(avisos, {
 *   inicial: 10,
 *   incremento: 10,
 * });
 * ```
 */
export function usePaginacion<T>(
  data: T[] | undefined,
  options: UsePaginacionOptions = {}
): UsePaginacionResult {
  const { inicial = 10, incremento = 10, headerOffset = 120 } = options;

  const [cantidadMostrar, setCantidadMostrar] = useState(inicial);
  const listaRef = useRef<HTMLDivElement>(null);
  const prevCantidadRef = useRef(inicial);

  // Handler para mostrar más elementos
  const handleMostrarMas = useCallback(() => {
    setCantidadMostrar((prev) => prev + incremento);
  }, [incremento]);

  // Resetear la paginación
  const reset = useCallback(() => {
    setCantidadMostrar(inicial);
    prevCantidadRef.current = inicial;
  }, [inicial]);

  // Efecto para scroll suave cuando se cargan más elementos
  useEffect(() => {
    if (cantidadMostrar > inicial && data && data.length > 0) {
      const cantidadAnterior = prevCantidadRef.current;

      // Solo hacer scroll si realmente aumentó la cantidad
      if (cantidadMostrar > cantidadAnterior) {
        const timer = setTimeout(() => {
          const items =
            listaRef.current?.querySelectorAll("[data-aviso-index]");
          if (items && items.length > cantidadAnterior) {
            const nuevoElemento = items[cantidadAnterior] as HTMLElement;
            if (nuevoElemento) {
              const elementPosition = nuevoElemento.getBoundingClientRect().top;
              const offsetPosition =
                elementPosition + window.scrollY - headerOffset;
              window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
              });
            }
          }
        }, 100);

        prevCantidadRef.current = cantidadMostrar;
        return () => clearTimeout(timer);
      }
    }
  }, [data, cantidadMostrar, inicial, headerOffset]);

  // Detectar si hay más elementos
  const hayMas = data ? data.length === cantidadMostrar : false;

  return {
    cantidadMostrar,
    listaRef,
    handleMostrarMas,
    hayMas,
    reset,
  };
}
