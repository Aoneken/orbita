import { CATEGORIAS, type Categoria } from "@/constants/categorias";
import type { AvisoBora } from "@/types";

/**
 * Obtiene la categoría de un aviso basándose en sus etiquetas
 * @param aviso - Aviso del BORA
 * @returns La categoría correspondiente o null si no tiene categoría
 */
export function obtenerCategoriaDeAviso(aviso: AvisoBora): Categoria | null {
  const etiquetasAviso = aviso.etiquetas as string[] | null;
  if (!etiquetasAviso || etiquetasAviso.length === 0) return null;

  for (const categoria of CATEGORIAS) {
    for (const etiqueta of categoria.etiquetas) {
      if (etiquetasAviso.includes(etiqueta)) {
        return categoria;
      }
    }
  }
  return null;
}

/**
 * Elimina emisores duplicados o que son subconjuntos de otros
 * @param emisores - Lista de emisores
 * @returns Lista de emisores sin duplicados
 */
export function eliminarEmisorDuplicados(emisores: string[]): string[] {
  if (!emisores || emisores.length === 0) return [];

  const vistos = new Set<string>();
  return emisores.filter((emisor) => {
    // Normalizar el emisor para comparación
    const normalizado = emisor.toLowerCase().trim();

    // Verificar si ya existe o es parte de otro emisor
    for (const visto of vistos) {
      if (visto.includes(normalizado) || normalizado.includes(visto)) {
        return false;
      }
    }

    vistos.add(normalizado);
    return true;
  });
}

/**
 * Agrupa tipos de normas en 4 categorías principales
 * @param desgloseTiposRaw - Desglose de tipos desde la BD
 * @returns Objeto con tipos agrupados o null si no hay datos
 */
export function agruparTiposNorma(
  desgloseTiposRaw: Record<string, number> | null
): Record<string, number> | null {
  if (!desgloseTiposRaw) return null;

  const agrupado: Record<string, number> = {
    Decretos: 0,
    Resoluciones: 0,
    Disposiciones: 0,
    Otros: 0,
  };

  for (const [tipo, cantidad] of Object.entries(desgloseTiposRaw)) {
    const tipoNormalizado = tipo.toLowerCase();
    if (tipoNormalizado.includes("decreto")) {
      agrupado.Decretos += cantidad;
    } else if (tipoNormalizado.includes("resoluci")) {
      agrupado.Resoluciones += cantidad;
    } else if (tipoNormalizado.includes("disposici")) {
      agrupado.Disposiciones += cantidad;
    } else {
      agrupado.Otros += cantidad;
    }
  }

  // Filtrar categorías con 0 elementos
  return Object.fromEntries(
    Object.entries(agrupado).filter(([, cantidad]) => cantidad > 0)
  );
}
