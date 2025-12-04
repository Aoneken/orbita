// ==========================================
// COMPONENTE UNIFICADO: SintesisDia
// Muestra síntesis IA del Boletín Oficial
// ==========================================

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SintesisSkeleton } from "@/components/ui/skeletons";
import { useDecretosDelDia, useSintesisTelegram } from "@/hooks";
import {
  agruparTiposNorma,
  capturarSintesis,
  compartirSintesis,
  eliminarEmisorDuplicados,
} from "@/utils";
import { Calendar, Camera, FileText, Share2 } from "lucide-react";

// ==========================================
// TIPOS
// ==========================================

interface SintesisDiaProps {
  /** Fecha seleccionada (YYYY-MM-DD) o null para hoy */
  fechaSeleccionada: string | null;
  /** Mostrar botones de compartir (InicioView style) */
  showShareButtons?: boolean;
  /** Mostrar decretos del día (PortalView style) */
  showDecretos?: boolean;
  /** Cantidad máxima de decretos a mostrar */
  maxDecretos?: number;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export function SintesisDia({
  fechaSeleccionada,
  showShareButtons = false,
  showDecretos = false,
  maxDecretos = 5,
}: SintesisDiaProps) {
  const {
    data: envio,
    isLoading: loadingSintesis,
    error: errorSintesis,
  } = useSintesisTelegram(fechaSeleccionada ?? undefined);

  // Solo cargar decretos si se van a mostrar
  const { data: decretosData, isLoading: loadingDecretos } = useDecretosDelDia(
    showDecretos ? fechaSeleccionada ?? undefined : undefined
  );

  const decretos = decretosData?.decretos || [];
  const isLoading = loadingSintesis || (showDecretos && loadingDecretos);

  if (isLoading) {
    return <SintesisSkeleton />;
  }

  if (errorSintesis || (!envio && !loadingSintesis)) {
    return (
      <Card className="mb-6 border-destructive/20 bg-destructive/5">
        <CardContent className="pt-6 pb-6 text-center">
          <p className="text-sm text-destructive font-medium mb-2">
            No se pudo cargar la síntesis del día
          </p>
          <p className="text-xs text-muted-foreground">
            Intenta recargar la página o selecciona otra fecha.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Parsear los campos JSON
  if (!envio) return null;

  const desgloseTiposRaw = envio.desglose_tipos as Record<
    string,
    number
  > | null;
  const etiquetasTop3 = envio.etiquetas_top3 as string[] | null;
  const emisoresTop3 = envio.emisores_top3 as string[] | null;

  // Usar total_normas precalculado de la BD
  const totalAvisos = envio.total_normas ?? 0;
  const desgloseTipos = agruparTiposNorma(desgloseTiposRaw);

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Síntesis del día</CardTitle>
          </div>
          {showShareButtons && (
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  compartirSintesis(envio.sintesis_ia || "", fechaSeleccionada)
                }
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Compartir síntesis"
              >
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                onClick={() =>
                  capturarSintesis(envio.sintesis_ia || "", fechaSeleccionada)
                }
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Copiar para historia"
              >
                <Camera className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Síntesis narrativa generada por IA */}
        {envio.sintesis_ia && (
          <div className="mb-4 p-4 bg-background rounded-lg border">
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {envio.sintesis_ia}
            </p>
          </div>
        )}

        {/* Desglose por tipos - formato compacto */}
        {desgloseTipos && Object.keys(desgloseTipos).length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">
              Estadísticas:{" "}
              <span className="font-medium text-primary">{totalAvisos}</span>{" "}
              avisos
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(desgloseTipos).map(([tipo, cantidad]) => (
                <Badge key={tipo} variant="secondary" className="text-xs">
                  {tipo}: {cantidad}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Etiquetas destacadas (Top 3) */}
        {etiquetasTop3 && etiquetasTop3.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">
              Temas destacados:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {etiquetasTop3.map((etiqueta) => (
                <Badge key={etiqueta} variant="secondary" className="text-xs">
                  {etiqueta}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Emisores destacados (Top 3 sin duplicados) */}
        {emisoresTop3 && emisoresTop3.length > 0 && (
          <div className={showDecretos && decretos.length > 0 ? "mb-4" : ""}>
            <p className="text-xs text-muted-foreground mb-2">
              Principales emisores:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {eliminarEmisorDuplicados(emisoresTop3).map((emisor) => (
                <Badge key={emisor} variant="outline" className="text-xs">
                  {emisor}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Decretos del día (solo si showDecretos=true) */}
        {showDecretos && decretos && decretos.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Decretos del día ({decretos.length}):
            </p>
            <div className="space-y-2">
              {decretos.slice(0, maxDecretos).map((decreto) => (
                <a
                  key={decreto.id_aviso}
                  href={decreto.url_detalle}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded-lg bg-background border hover:border-primary/50 transition-colors"
                >
                  <p className="text-sm font-medium line-clamp-2">
                    {decreto.descripcion_ia || decreto.titulo}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {decreto.emisor}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SintesisDia;
