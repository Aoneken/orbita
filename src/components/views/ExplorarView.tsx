import { FileText, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

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
// CONSTANTES Y UTILIDADES
// ==========================================

/**
 * Pesos de tipos de norma para ordenamiento jerárquico.
 * Mayor peso = mayor importancia institucional.
 */
const NORMA_WEIGHTS: Record<string, number> = {
  // Poder Ejecutivo
  "decreto de necesidad y urgencia": 100,
  decreto: 90,
  "decisión administrativa": 85,
  // Resoluciones generales
  "resolución general": 80,
  "resolución conjunta": 75,
  resolución: 70,
  // Disposiciones
  disposición: 60,
  // Avisos y otros
  aviso: 40,
  edicto: 30,
};

/**
 * Obtiene el peso de ordenamiento para un tipo de norma.
 * @param subrubro - Tipo de norma (ej: "Decreto", "Resolución")
 * @returns Peso numérico (mayor = más importante)
 */
function getNormaWeight(subrubro: string | null | undefined): number {
  if (!subrubro) return 0;
  const normalized = subrubro.toLowerCase().trim();

  // Buscar coincidencia exacta primero
  if (NORMA_WEIGHTS[normalized] !== undefined) {
    return NORMA_WEIGHTS[normalized];
  }

  // Buscar coincidencia parcial
  for (const [key, weight] of Object.entries(NORMA_WEIGHTS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return weight;
    }
  }

  return 0; // Tipo desconocido
}

/**
 * Normaliza texto removiendo tildes/acentos para búsqueda.
 * @param text - Texto a normalizar
 * @returns Texto sin acentos, en minúsculas
 */
function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Calcula puntuación de relevancia para un aviso según la búsqueda.
 * - Título/Síntesis (descripcion_ia): 10 puntos
 * - Organismo (emisor): 5 puntos
 * - Texto general (resumen_ia): 1 punto
 *
 * @param aviso - Aviso a puntuar
 * @param searchTerms - Términos de búsqueda normalizados
 * @returns Puntuación total de relevancia
 */
function calculateRelevanceScore(
  aviso: AvisoBora,
  searchTerms: string[]
): number {
  if (searchTerms.length === 0) return 0;

  let score = 0;

  const titulo = normalizeForSearch(aviso.titulo || "");
  const descripcion = normalizeForSearch(aviso.descripcion_ia || "");
  const emisor = normalizeForSearch(aviso.emisor || "");
  const resumen = normalizeForSearch(aviso.resumen_ia || "");

  for (const term of searchTerms) {
    // Título: 10 puntos
    if (titulo.includes(term)) score += 10;

    // Síntesis (descripcion_ia): 10 puntos
    if (descripcion.includes(term)) score += 10;

    // Organismo (emisor): 5 puntos
    if (emisor.includes(term)) score += 5;

    // Texto general (resumen_ia): 1 punto
    if (resumen.includes(term)) score += 1;
  }

  return score;
}

// ==========================================
// LISTA DE AVISOS CON PAGINACIÓN Y BÚSQUEDA INTELIGENTE
// ==========================================

// NOTA: Este componente recibe una `key` que cambia cuando cambian los filtros
// (busqueda, rangoFechas), lo que automáticamente resetea el estado interno.

function ListaAvisos({ busqueda }: { busqueda: string }) {
  const { rangoFechas } = useRangoFechas();

  // Detectar si es un solo día (desde === hasta)
  const isSingleDay =
    rangoFechas.desde && rangoFechas.desde === rangoFechas.hasta;

  // Para búsqueda avanzada, NO enviamos busqueda al servidor.
  // Traemos los datos y filtramos/ordenamos en cliente para scoring.
  const filtros: FiltrosAviso = {
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

  const { data: avisosRaw, isLoading, error } = useAvisos(filtros, limite);

  // Procesar avisos: filtrar por búsqueda + ordenar jerárquicamente
  const avisosProcesados = useMemo(() => {
    if (!avisosRaw) return [];

    let avisos = [...avisosRaw];

    // Si hay búsqueda, filtrar y puntuar
    if (busqueda.trim()) {
      const searchTerms = normalizeForSearch(busqueda.trim())
        .split(/\s+/)
        .filter(Boolean);

      // Filtrar avisos que coinciden con al menos un término
      avisos = avisos.filter((aviso) => {
        const titulo = normalizeForSearch(aviso.titulo || "");
        const descripcion = normalizeForSearch(aviso.descripcion_ia || "");
        const emisor = normalizeForSearch(aviso.emisor || "");
        const resumen = normalizeForSearch(aviso.resumen_ia || "");
        const contenidoBuscable = `${titulo} ${descripcion} ${emisor} ${resumen}`;

        return searchTerms.some((term) => contenidoBuscable.includes(term));
      });

      // Calcular scores y ordenar por relevancia
      const avisosConScore = avisos.map((aviso) => ({
        aviso,
        score: calculateRelevanceScore(aviso, searchTerms),
      }));

      // Ordenar: mayor score primero, luego por fecha, luego por peso de norma
      avisosConScore.sort((a, b) => {
        // Primero por score de relevancia
        if (b.score !== a.score) return b.score - a.score;

        // Luego por fecha (más reciente primero)
        const fechaA = new Date(a.aviso.fecha_publicacion).getTime();
        const fechaB = new Date(b.aviso.fecha_publicacion).getTime();
        if (fechaB !== fechaA) return fechaB - fechaA;

        // Finalmente por peso de norma
        return (
          getNormaWeight(b.aviso.subrubro) - getNormaWeight(a.aviso.subrubro)
        );
      });

      return avisosConScore.map((item) => item.aviso);
    }

    // Sin búsqueda: ordenamiento jerárquico (fecha > tipo de norma)
    avisos.sort((a, b) => {
      // Primero por fecha (más reciente primero)
      const fechaA = new Date(a.fecha_publicacion).getTime();
      const fechaB = new Date(b.fecha_publicacion).getTime();
      if (fechaB !== fechaA) return fechaB - fechaA;

      // Luego por peso de norma
      return getNormaWeight(b.subrubro) - getNormaWeight(a.subrubro);
    });

    return avisos;
  }, [avisosRaw, busqueda]);

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
      items={avisosProcesados}
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
// VISTA PRINCIPAL: EXPLORAR
// ==========================================

export function ExplorarView() {
  const [busqueda, setBusqueda] = useState("");
  const { rangoFechas, setRangoFechas } = useRangoFechas();

  const tieneRango = !!(rangoFechas.desde || rangoFechas.hasta);

  return (
    <>
      {/* Notificación flotante unificada de filtros activos */}
      <NotificacionFiltro
        rangoFechas={rangoFechas}
        busqueda={busqueda}
        onClearFecha={() =>
          setRangoFechas({ desde: undefined, hasta: undefined })
        }
        onClearBusqueda={() => setBusqueda("")}
        variant="badge"
      />

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-4 sm:pb-6">
        <ViewHeader
          title="Explorar Avisos"
          description="Buscá y explorá todas las publicaciones del Boletín Oficial"
          icon={<Search className="h-6 w-6" />}
          className="mb-6"
        />

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
                  type="button"
                  onClick={() => setBusqueda("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>

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
      <BotonIrArriba position="elevated" />
    </>
  );
}
