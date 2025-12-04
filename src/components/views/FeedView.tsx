import { FileText, Newspaper, Search, X } from "lucide-react";
import { useState } from "react";

import {
  AvisoCard,
  BotonIrArriba,
  ListaPaginada,
  NotificacionFiltro,
  SelectorFechaFlotante,
  ViewHeader,
} from "@/components/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DecretosSkeleton } from "@/components/ui/skeletons";
import { useRangoFechas } from "@/contexts";
import { useAvisos } from "@/hooks";
import type { AvisoBora, FiltrosAviso } from "@/types";

// ==========================================
// LISTA DE AVISOS CON PAGINACIÓN
// ==========================================

// NOTA: Este componente recibe una `key` que cambia cuando cambian los filtros
// (busqueda, rangoFechas), lo que automáticamente resetea el estado interno.

function ListaAvisos({ busqueda }: { busqueda: string }) {
  const { rangoFechas } = useRangoFechas();

  // Detectar si es un solo día (desde === hasta)
  const isSingleDay =
    rangoFechas.desde && rangoFechas.desde === rangoFechas.hasta;

  const filtros: FiltrosAviso = {
    ...(busqueda && { busqueda }),
    // Si es un solo día, usar fechaExacta
    ...(isSingleDay
      ? { fechaExacta: rangoFechas.desde }
      : {
          ...(rangoFechas.desde && { fechaDesde: rangoFechas.desde }),
          ...(rangoFechas.hasta && { fechaHasta: rangoFechas.hasta }),
        }),
  };

  // Determinar si hay filtros activos
  const hayFiltrosActivos = !!(
    busqueda ||
    rangoFechas.desde ||
    rangoFechas.hasta
  );

  // Sin filtros: límite de 200 para carga inicial (performance)
  // Con filtros: búsqueda server-side contra toda la BD (límite alto)
  const limite = hayFiltrosActivos ? 1000 : 200;

  const { data: avisos, isLoading, error } = useAvisos(filtros, limite);

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive rounded-lg p-3 sm:p-4 text-center text-sm">
        Error al cargar los avisos. Intenta de nuevo.
      </div>
    );
  }

  const mensajeVacio =
    busqueda || rangoFechas.desde || rangoFechas.hasta
      ? "No se encontraron avisos con estos filtros."
      : "No hay avisos disponibles.";

  return (
    <ListaPaginada<AvisoBora>
      items={avisos}
      cantidadInicial={20}
      cantidadIncremento={20}
      isLoading={isLoading}
      skeleton={<DecretosSkeleton cantidad={8} />}
      mensajeVacio={mensajeVacio}
      textoMostrarMas="Mostrar"
      enableInfiniteScroll={true}
      showFooter={true}
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

// ==========================================
// SELECTOR DE FECHA FLOTANTE (RANGO)
// ==========================================

// ==========================================
// VISTA PRINCIPAL DEL FEED
// ==========================================

export function FeedView() {
  const [busqueda, setBusqueda] = useState("");
  const { rangoFechas, setRangoFechas } = useRangoFechas();

  const tieneRango = !!(rangoFechas.desde || rangoFechas.hasta);

  return (
    <>
      {/* Notificación flotante de filtro de fecha - consistente con Dashboard */}
      {!busqueda && (
        <NotificacionFiltro
          rangoFechas={rangoFechas}
          onClear={() => setRangoFechas({ desde: undefined, hasta: undefined })}
          variant="badge"
        />
      )}

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-4 sm:pb-6">
        <ViewHeader
          title="Feed de Avisos"
          description="Todas las publicaciones del Boletín Oficial"
          icon={<Newspaper className="h-6 w-6" />}
          className="mb-6"
        />

        {/* Barra Sticky de Búsqueda - solo cuando hay búsqueda activa */}
        {busqueda && (
          <div className="sticky top-14 sm:top-16 z-40 -mx-3 sm:-mx-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="px-4 py-2 bg-background/95 backdrop-blur border-y flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-primary overflow-hidden">
                <Search className="h-4 w-4 shrink-0" />
                <span className="truncate">"{busqueda}"</span>
              </div>
              <button
                onClick={() => setBusqueda("")}
                className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Barra de búsqueda simplificada */}
        <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6 pb-6">
            {/* Barra de búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Escribí para buscar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 h-11 sm:h-10 text-base sm:text-sm"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Filtros activos removidos de aquí para usar barra sticky */}
          </CardContent>
        </Card>

        {/* Indicador removido */}

        {/* Lista de avisos */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">
                  {tieneRango ? "Avisos del período" : "Últimos avisos"}
                </CardTitle>
                <CardDescription>
                  {busqueda
                    ? "Resultados de la búsqueda"
                    : tieneRango
                    ? "Publicaciones en este rango de fechas"
                    : "Ordenados por fecha de publicación"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ListaAvisos
              key={`${busqueda}-${rangoFechas.desde}-${rangoFechas.hasta}`}
              busqueda={busqueda}
            />
          </CardContent>
        </Card>
      </div>

      {/* Botones flotantes */}
      <SelectorFechaFlotante
        mode="range"
        allowModeSwitch={true}
        rangoFechas={rangoFechas}
        onRangoChange={setRangoFechas}
      />
      <BotonIrArriba />
    </>
  );
}
