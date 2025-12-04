/**
 * Tipos para la tabla avisos_bora de Supabase
 */

export interface AvisoBora {
  id_aviso: number;
  seccion: string;
  edicion: string;
  fecha_publicacion: string;
  rubro_principal: string;
  subrubro: string;
  numero_acto: number;
  año_acto: number;
  titulo: string;
  emisor: string;
  codigo_norma: string;
  url_detalle: string;
  url_pdf_seccion: string | null;
  url_anexo: string | null;
  tiene_anexos: boolean;
  /** Etiquetas asignadas por IA. Siempre es array desde la BD (JSONB) */
  etiquetas: string[] | null;
  descripcion_ia: string;
  resumen_ia: string;
  created_at: string;
}

/**
 * Rango de fechas para filtros
 */
export interface RangoFechas {
  desde: string | undefined;
  hasta: string | undefined;
}

export interface FiltrosAviso {
  busqueda?: string;
  etiquetas?: string[];
  subrubro?: string;
  emisor?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  fechaExacta?: string; // Para filtrar por un día específico
}

export interface EstadisticasDiarias {
  fecha: string;
  cantidad: number;
}

export interface ConteoEtiqueta {
  etiqueta: string;
  cantidad: number;
}

export interface ConteoSubrubro {
  subrubro: string;
  cantidad: number;
}

export interface ConteoEmisor {
  emisor: string;
  cantidad: number;
}

/**
 * Tipos para la tabla envios_telegram de Supabase
 */
export interface EnvioTelegram {
  id: number;
  ok: boolean;
  mensaje_id: number;
  bot_id: number;
  is_bot: boolean;
  bot_nombre: string;
  bot_username: string;
  chat_id: number;
  chat_nombre: string;
  chat_type: string;
  fecha_envio: string;
  total_normas: number;
  sintesis_ia: string;
  total_etiquetas_unicas: number;
  etiquetas_top3: string[];
  desglose_tipos: Record<string, number>;
  desglose_categorias: Record<string, number>;
  total_con_anexos: number;
  emisores_top3: string[];
  created_at: string;
}
