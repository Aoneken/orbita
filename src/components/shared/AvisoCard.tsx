// ==========================================
// COMPONENTE UNIFICADO: AvisoCard
// Variantes: expandible (Inicio/Feed) | simple (Portal)
// ==========================================

import { Badge } from "@/components/ui/badge";
import { formatearEmisor, formatearFechaCorta } from "@/lib/utils";
import type { AvisoBora } from "@/types";
import {
  capturarPantalla,
  compartirEnlace,
  obtenerCategoriaDeAviso,
} from "@/utils";
import {
  Camera,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Share2,
} from "lucide-react";
import { memo, useState } from "react";

// ==========================================
// TIPOS Y CONFIGURACIÓN
// ==========================================

type AvisoCardVariant = "expandible" | "simple";

interface AvisoCardProps {
  aviso: AvisoBora;
  variant?: AvisoCardVariant;
  // Opciones para variante "expandible"
  showShareButtons?: boolean;
  showEtiquetas?: boolean;
  showCategoryBadge?: boolean;
  showSubrubro?: boolean;
  showFecha?: boolean;
  showEmisor?: boolean;
  showAnexos?: boolean;
  // Para InicioView: mostrar descripcion_ia en lugar de titulo
  useDescripcionAsTitle?: boolean;
  // Número máximo de etiquetas a mostrar
  maxEtiquetas?: number;
}

// ==========================================
// UTILIDADES
// ==========================================

// formatearFechaCorta ahora se importa de @/lib/utils

// ==========================================
// VARIANTE: SIMPLE (PortalView style)
// ==========================================

function AvisoCardSimple({
  aviso,
  useDescripcionAsTitle,
}: {
  aviso: AvisoBora;
  useDescripcionAsTitle?: boolean;
}) {
  const textoTitulo = useDescripcionAsTitle
    ? aviso.descripcion_ia || aviso.titulo
    : aviso.titulo;

  return (
    <a
      href={aviso.url_detalle}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="flex items-start gap-3 py-4 border-b hover:bg-muted/50 active:bg-muted/70 transition-colors px-3 -mx-3 rounded touch-manipulation">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm sm:text-base leading-snug group-hover:text-primary transition-colors">
            {textoTitulo}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5 text-xs sm:text-sm text-muted-foreground">
            <span className="truncate max-w-[150px] sm:max-w-[200px]">
              {aviso.emisor}
            </span>
            <span>·</span>
            <span>{aviso.fecha_publicacion}</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
      </div>
    </a>
  );
}

// ==========================================
// VARIANTE: EXPANDIBLE (InicioView/FeedView style)
// ==========================================

interface AvisoCardExpandibleProps {
  aviso: AvisoBora;
  showShareButtons: boolean;
  showEtiquetas: boolean;
  showCategoryBadge: boolean;
  showSubrubro: boolean;
  showFecha: boolean;
  showEmisor: boolean;
  showAnexos: boolean;
  useDescripcionAsTitle: boolean;
  maxEtiquetas: number;
}

function AvisoCardExpandible({
  aviso,
  showShareButtons,
  showEtiquetas,
  showCategoryBadge,
  showSubrubro,
  showFecha,
  showEmisor,
  showAnexos,
  useDescripcionAsTitle,
  maxEtiquetas,
}: AvisoCardExpandibleProps) {
  const [expandido, setExpandido] = useState(false);
  const categoria = obtenerCategoriaDeAviso(aviso);

  // Procesar etiquetas si es necesario
  const etiquetas =
    showEtiquetas && aviso.etiquetas
      ? Array.isArray(aviso.etiquetas)
        ? aviso.etiquetas
        : typeof aviso.etiquetas === "string"
        ? (aviso.etiquetas as string).split(",").map((e: string) => e.trim())
        : []
      : [];

  // Texto principal: descripcion_ia o titulo según configuración
  const textoTitulo = useDescripcionAsTitle
    ? aviso.descripcion_ia
    : aviso.titulo;

  return (
    <div
      className="py-4 border-b hover:bg-muted/50 active:bg-muted/70 transition-colors px-3 -mx-3 rounded touch-manipulation cursor-pointer group"
      onClick={() => setExpandido(!expandido)}
    >
      {/* Header con contenido y chevron */}
      <div className="flex items-start gap-3">
        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          {/* Header: Badge de subrubro + fecha */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {showSubrubro && aviso.subrubro && (
              <Badge variant="outline" className="text-[10px] sm:text-xs">
                {aviso.subrubro}
              </Badge>
            )}
            {showFecha && aviso.fecha_publicacion && (
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {formatearFechaCorta(aviso.fecha_publicacion)}
              </span>
            )}
          </div>

          {/* Título / Descripción */}
          <p className="font-medium text-sm sm:text-base leading-snug group-hover:text-primary transition-colors">
            {textoTitulo}
          </p>

          {/* Emisor */}
          {showEmisor && (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5 text-xs sm:text-sm text-muted-foreground">
              <span className="truncate">{formatearEmisor(aviso.emisor)}</span>
            </div>
          )}
        </div>

        {/* Chevron a la derecha */}
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-300 flex-shrink-0 mt-0.5 ${
            expandido ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Contenido expandido con animación suave */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          expandido
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-3 pt-3 border-t border-dashed">
            {/* Resumen IA */}
            {aviso.resumen_ia && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {aviso.resumen_ia}
              </p>
            )}

            {/* Etiquetas con categoría incluida */}
            {(showEtiquetas || showCategoryBadge) && (
              <div className="flex flex-wrap gap-1 mb-3">
                {/* Badge de categoría como primera etiqueta */}
                {showCategoryBadge && categoria && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium text-white ${categoria.color}`}
                  >
                    {categoria.icon && <categoria.icon className="h-3 w-3" />}
                    {categoria.nombre}
                  </span>
                )}
                {/* Resto de etiquetas */}
                {showEtiquetas && etiquetas.length > 0 && (
                  <>
                    {etiquetas.slice(0, maxEtiquetas).map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[10px] sm:text-xs px-1.5 py-0.5"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {etiquetas.length > maxEtiquetas && (
                      <Badge
                        variant="outline"
                        className="text-[10px] sm:text-xs px-1.5 py-0.5"
                      >
                        +{etiquetas.length - maxEtiquetas}
                      </Badge>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Links externos y botones de compartir */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Links a la izquierda */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <a
                  href={aviso.url_detalle}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver original
                </a>
                {showAnexos && aviso.tiene_anexos && aviso.url_anexo && (
                  <a
                    href={aviso.url_anexo}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Anexos
                  </a>
                )}
              </div>

              {/* Botones de compartir a la derecha */}
              {showShareButtons && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      compartirEnlace(aviso);
                    }}
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Compartir"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      capturarPantalla(aviso);
                    }}
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Compartir en historia"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL CON MEMO
// ==========================================

export const AvisoCard = memo(function AvisoCard({
  aviso,
  variant = "expandible",
  showShareButtons = false,
  showEtiquetas = false,
  showCategoryBadge = false,
  showSubrubro = false,
  showFecha = false,
  showEmisor = false,
  showAnexos = false,
  useDescripcionAsTitle = false,
  maxEtiquetas = 4,
}: AvisoCardProps) {
  if (variant === "simple") {
    return (
      <AvisoCardSimple
        aviso={aviso}
        useDescripcionAsTitle={useDescripcionAsTitle}
      />
    );
  }

  return (
    <AvisoCardExpandible
      aviso={aviso}
      showShareButtons={showShareButtons}
      showEtiquetas={showEtiquetas}
      showCategoryBadge={showCategoryBadge}
      showSubrubro={showSubrubro}
      showFecha={showFecha}
      showEmisor={showEmisor}
      showAnexos={showAnexos}
      useDescripcionAsTitle={useDescripcionAsTitle}
      maxEtiquetas={maxEtiquetas}
    />
  );
});

export default AvisoCard;
