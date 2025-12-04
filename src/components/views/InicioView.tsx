import { Calendar, FileText, Loader2, Newspaper } from "lucide-react";
import { createContext, useContext } from "react";

import {
  AvisoCard,
  BotonIrArriba,
  ListaPaginada,
  SelectorFechaFlotante,
  SintesisDia,
  ViewHeader,
} from "@/components/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DecretosSkeleton } from "@/components/ui/skeletons";
import { useFechaSeleccionada } from "@/contexts";
import { useAvisos, useFechasConSintesis } from "@/hooks";
import { formatearFechaCompleta } from "@/lib/utils";
import type { AvisoBora, FiltrosAviso } from "@/types";

// Contexto para navegación entre vistas (local a esta vista)
const NavigationContext = createContext<{
  onNavigate?: (vista: string) => void;
}>({});

// ==========================================
// SECCIÓN: LISTA DE DECRETOS
// ==========================================

// Lista de decretos con paginación
function ListaDecretos() {
  const { fechaSeleccionada } = useFechaSeleccionada();

  const filtros: FiltrosAviso = {
    subrubro: "Decreto",
    ...(fechaSeleccionada && { fechaExacta: fechaSeleccionada }),
  };

  // Pedimos un número alto para tener todos disponibles, la paginación la maneja ListaPaginada
  const { data: avisos, isLoading } = useAvisos(filtros, 100);

  return (
    <ListaPaginada<AvisoBora>
      items={avisos}
      cantidadInicial={10}
      cantidadIncremento={10}
      isLoading={isLoading}
      skeleton={<DecretosSkeleton cantidad={5} />}
      mensajeVacio="No se encontraron decretos para esta fecha."
      textoMostrarMas="Mostrar"
      getItemKey={(aviso) => aviso.id_aviso}
      renderItem={(aviso) => (
        <AvisoCard
          aviso={aviso}
          showSubrubro
          showFecha
          showEmisor
          showEtiquetas
          showCategoryBadge
          showShareButtons
          showAnexos
          useDescripcionAsTitle
        />
      )}
    />
  );
}

// Sección de Decretos simplificada (sin filtros de categoría)
function SeccionDecretos() {
  const { fechaSeleccionada } = useFechaSeleccionada();
  const { onNavigate } = useContext(NavigationContext);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">
              Decretos del Poder Ejecutivo
            </CardTitle>
            <CardDescription>
              Las normativas de mayor peso político
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Lista de decretos - key fuerza reset cuando cambia fecha */}
        <ListaDecretos key={fechaSeleccionada || "latest"} />

        {/* Botón para ver más anuncios en Feed */}
        <div className="mt-4 pt-3 border-t flex justify-center">
          <button
            onClick={() => onNavigate?.("feed")}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-xl transition-colors touch-manipulation"
          >
            <Newspaper className="h-4 w-4" />
            Ver más anuncios en Feed
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// VISTA PRINCIPAL DE INICIO
// ==========================================

interface InicioViewProps {
  onNavigate?: (vista: string) => void;
}

export function InicioView({ onNavigate }: InicioViewProps) {
  const { data: fechasDisponibles, isLoading: cargandoFechas } =
    useFechasConSintesis();
  const { fechaSeleccionada, setFechaSeleccionada } = useFechaSeleccionada();

  // Calcular la fecha inicial solo una vez cuando hay datos
  const fechaInicial = fechasDisponibles?.[0];

  // Usar fecha del contexto si está disponible, sino la fecha inicial
  const fechaEfectiva = fechaSeleccionada ?? fechaInicial;

  const headerBadge = cargandoFechas ? (
    <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm text-muted-foreground">Cargando...</span>
    </div>
  ) : fechaEfectiva ? (
    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
      <Calendar className="h-4 w-4" />
      <span className="font-medium text-sm sm:text-base">
        {formatearFechaCompleta(fechaEfectiva)}
      </span>
    </div>
  ) : null;

  // Handler para cambiar fecha que actualiza el contexto global
  const handleSetFecha = (fecha: string | undefined) => {
    setFechaSeleccionada(fecha);
  };

  return (
    <NavigationContext.Provider value={{ onNavigate }}>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-4 sm:pb-6">
        <ViewHeader
          title="Boletín Oficial Simplificado"
          description="Lo más importante del día, fácil de entender"
          badge={headerBadge}
          className="mb-6 sm:mb-8"
        />

        {/* Sección 1: Síntesis del día */}
        <SintesisDia
          fechaSeleccionada={fechaEfectiva ?? null}
          showShareButtons
        />

        {/* Sección 2: Decretos */}
        <SeccionDecretos />
      </div>

      {/* Botones flotantes */}
      <SelectorFechaFlotante
        mode="single"
        fechaSeleccionada={fechaEfectiva}
        onFechaChange={handleSetFecha}
      />
      <BotonIrArriba />
    </NavigationContext.Provider>
  );
}
