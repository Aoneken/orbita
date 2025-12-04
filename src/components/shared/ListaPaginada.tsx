import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Loader2 } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

// ==========================================
// COMPONENTE: ListaPaginada
// Lista con paginación y animaciones suaves
// ==========================================

interface ListaPaginadaProps<T> {
  /** Array de items a mostrar */
  items: T[] | undefined;
  /** Cantidad de items a mostrar inicialmente */
  cantidadInicial: number;
  /** Cantidad de items a agregar en cada "mostrar más" */
  cantidadIncremento: number;
  /** Estado de carga inicial */
  isLoading: boolean;
  /** Componente skeleton para mostrar durante la carga */
  skeleton: ReactNode;
  /** Mensaje cuando no hay items */
  mensajeVacio: string;
  /** Función para renderizar cada item */
  renderItem: (item: T, index: number, isNew: boolean) => ReactNode;
  /** Función para obtener la key única de cada item */
  getItemKey: (item: T) => string | number;
  /** Texto del botón "mostrar más" (se añade el número automáticamente) */
  textoMostrarMas?: string;
  /** Habilitar scroll infinito automático */
  enableInfiniteScroll?: boolean;
  /** Mostrar footer con contador de resultados */
  showFooter?: boolean;
}

// ==========================================
// VARIANTES DE ANIMACIÓN
// ==========================================

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
    },
  },
};

const indicatorVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
    },
  },
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export function ListaPaginada<T>({
  items,
  cantidadInicial,
  cantidadIncremento,
  isLoading,
  skeleton,
  mensajeVacio,
  renderItem,
  getItemKey,
  textoMostrarMas = "Mostrar",
  enableInfiniteScroll = false,
  showFooter = false,
}: ListaPaginadaProps<T>) {
  const [cantidadMostrar, setCantidadMostrar] = useState(cantidadInicial);
  const [cantidadAnterior, setCantidadAnterior] = useState(cantidadInicial);
  const [mostrandoIndicador, setMostrandoIndicador] = useState(false);

  // Ref para el observador de scroll infinito
  const observerTarget = useRef<HTMLDivElement>(null);

  // Items visibles actuales
  const itemsVisibles = useMemo(() => {
    return items?.slice(0, cantidadMostrar) ?? [];
  }, [items, cantidadMostrar]);

  // Determinar si hay más items disponibles
  const hayMas = items && items.length >= cantidadMostrar;

  // Manejar "mostrar más" - memoizado para evitar recreación
  const handleMostrarMas = useCallback(() => {
    setCantidadAnterior(cantidadMostrar);
    setCantidadMostrar((prev) => prev + cantidadIncremento);

    // Mostrar indicador brevemente
    setMostrandoIndicador(true);
    setTimeout(() => {
      setMostrandoIndicador(false);
    }, 1500);
  }, [cantidadMostrar, cantidadIncremento]);

  // Efecto para scroll infinito
  useEffect(() => {
    if (!enableInfiniteScroll || !hayMas || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleMostrarMas();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [enableInfiniteScroll, hayMas, isLoading, handleMostrarMas]);

  // Loading inicial
  if (isLoading && cantidadMostrar === cantidadInicial) {
    return <>{skeleton}</>;
  }

  // Sin items
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {mensajeVacio}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Lista de items */}
      <div>
        {itemsVisibles.map((item, index) => {
          const isNew =
            index >= cantidadAnterior && cantidadAnterior < cantidadMostrar;

          return (
            <motion.div
              key={getItemKey(item)}
              initial={isNew ? "hidden" : false}
              animate="visible"
              variants={itemVariants}
              transition={{
                delay: isNew ? (index - cantidadAnterior) * 0.05 : 0,
              }}
            >
              {renderItem(item, index, isNew)}
            </motion.div>
          );
        })}
      </div>

      {/* Indicador de nuevos items */}
      <AnimatePresence>
        {mostrandoIndicador && cantidadAnterior < cantidadMostrar && (
          <motion.div
            variants={indicatorVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="sticky bottom-20 sm:bottom-4 flex justify-center pointer-events-none z-10 -mt-2"
          >
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
              <ChevronDown className="h-4 w-4 animate-bounce" />
              <span>
                {Math.min(
                  cantidadIncremento,
                  itemsVisibles.length - cantidadAnterior
                )}{" "}
                nuevos
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón mostrar más o mensaje de fin */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex justify-center pt-4 pb-2">
          {hayMas ? (
            enableInfiniteScroll ? (
              // Elemento invisible para trigger de scroll infinito + loader
              <div
                ref={observerTarget}
                className="w-full flex justify-center py-4"
              >
                <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
              </div>
            ) : (
              <motion.button
                onClick={handleMostrarMas}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg transition-colors touch-manipulation disabled:opacity-50"
                whileTap={{ scale: 0.97 }}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                {textoMostrarMas} {cantidadIncremento} más
              </motion.button>
            )
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              No hay más para mostrar
            </p>
          )}
        </div>

        {/* Footer con contador de resultados */}
        {showFooter && items && items.length > 0 && (
          <div className="w-full pt-2 pb-3 border-t">
            <p className="text-center text-xs text-muted-foreground font-medium">
              Mostrando {itemsVisibles.length} de {items.length} avisos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListaPaginada;
