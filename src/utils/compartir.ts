import { formatearEmisor, formatearFechaAbsoluta } from "@/lib/utils";
import type { AvisoBora } from "@/types";
import { toast } from "sonner";
import { obtenerCategoriaDeAviso } from "./avisos";

// ==========================================
// MÓDULO: COMPARTIR
// ==========================================
//
// Este módulo maneja toda la lógica de compartir contenido de Órbita.
//
// ARQUITECTURA:
// ┌─────────────────────────────────────────────────────────────────┐
// │                        COMPARTIR TEXTO                          │
// ├─────────────────────────────────────────────────────────────────┤
// │  compartirEnlace(aviso)     → Texto formateado del aviso        │
// │  compartirSintesis(texto)   → Texto formateado de síntesis      │
// │                                                                 │
// │  Flujo: generarTexto → nativeShare() || copyToClipboard()       │
// └─────────────────────────────────────────────────────────────────┘
// ┌─────────────────────────────────────────────────────────────────┐
// │                       COMPARTIR IMAGEN                          │
// ├─────────────────────────────────────────────────────────────────┤
// │  capturarPantalla(aviso)    → Imagen Canvas del aviso           │
// │  capturarSintesis(texto)    → Imagen Canvas de síntesis         │
// │                                                                 │
// │  Flujo: generarCanvas → toBlob() → share() || download()        │
// └─────────────────────────────────────────────────────────────────┘
//
// REGLAS DE FORMATO:
// - Fechas: SIEMPRE absolutas (DD/MM/YYYY) - nunca "Hoy" o "Ayer"
// - Footer: "orbita.aoneken.com" en todas las imágenes
// - Créditos: "_Vía Órbita: https://orbita.aoneken.com_" en textos
//
// ==========================================

// ==========================================
// CONFIGURACIÓN DE PRODUCCIÓN
// ==========================================

/** URL de producción para compartir */
const PRODUCTION_URL = "https://orbita.aoneken.com";

// ==========================================
// CONFIGURACIÓN DE COLORES Y ESTILOS
// ==========================================

const COLORES = {
  fondo: "#0f172a", // slate-900
  fondoCard: "#1e293b", // slate-800
  primario: "#3b82f6", // blue-500
  texto: "#f8fafc", // slate-50
  textoSecundario: "#94a3b8", // slate-400
  acento: "#22c55e", // green-500
  borde: "#334155", // slate-700
};

const CATEGORIAS_COLORES: Record<string, string> = {
  empleo: "#22c55e",
  energia: "#eab308",
  salud: "#ef4444",
  economia: "#3b82f6",
  justicia: "#a855f7",
  transporte: "#06b6d4",
  gobierno: "#64748b",
  agro: "#f59e0b",
  seguridad: "#78716c",
  industria: "#6366f1",
  comunicaciones: "#ec4899",
  social: "#f97316",
  educacion: "#14b8a6",
  ambiente: "#84cc16",
  exterior: "#f43f5e",
  otros: "#6b7280",
};

// ==========================================
// FUNCIONES DE COMPARTIR TEXTO
// ==========================================

/**
 * Genera texto formateado para compartir un aviso individual
 * Formato estandarizado: Header → Contenido → Metadatos → Link → Créditos
 */
export function generarTextoAviso(aviso: AvisoBora): string {
  const categoria = obtenerCategoriaDeAviso(aviso);
  // Usar fecha absoluta para compartir (nunca "Hoy" o "Ayer")
  const fechaTexto = formatearFechaAbsoluta(aviso.fecha_publicacion);
  const emisor = formatearEmisor(aviso.emisor);

  const lineas = [
    // Header
    `📰 *BOLETÍN OFICIAL*`,
    `📅 ${fechaTexto}`,
    ``,
    // Contenido
    `📋 *${aviso.subrubro}*`,
    categoria ? `🏷️ ${categoria.nombre}` : null,
    ``,
    aviso.descripcion_ia,
    ``,
    aviso.resumen_ia ? `💡 _${aviso.resumen_ia}_` : null,
    aviso.resumen_ia ? `` : null,
    // Metadatos
    `🏛️ ${emisor}`,
    ``,
    // Créditos (colocados ANTES del link para que la previsualización use orbita.aoneken.com)
    `_Vía Órbita: ${PRODUCTION_URL}_`,
    ``,
    // Link original (se deja al final; algunos servicios muestran la primera URL encontrada)
    `🔗 ${aviso.url_detalle}`,
    ``,
  ];

  return lineas.filter(Boolean).join("\n");
}

/**
 * Servicio: Copiar texto al portapapeles
 */
export async function copyToClipboard(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    toast.success("📋 Texto copiado al portapapeles", {
      description: "Listo para pegar en WhatsApp, Telegram, etc.",
    });
    return true;
  } catch {
    toast.error("No se pudo copiar el texto");
    return false;
  }
}

/**
 * Servicio: Compartir nativo
 */
export async function nativeShare(data: ShareData): Promise<boolean> {
  if (!navigator.share) return false;

  try {
    await navigator.share(data);
    return true;
  } catch (error) {
    // Si el usuario cancela, no es un "error" per se, pero la acción no se completó
    if ((error as Error).name === "AbortError") return true; // Consideramos "handled"
    return false;
  }
}

/**
 * Controlador: Comparte un aviso usando Web Share API o clipboard como fallback
 * NOTA: No incluimos 'url' en ShareData para que el navegador muestre el texto completo
 * (la URL ya está incluida en el texto generado)
 */
export async function compartirEnlace(aviso: AvisoBora): Promise<void> {
  const texto = generarTextoAviso(aviso);
  const shareData: ShareData = {
    title: `Boletín Oficial: ${aviso.subrubro}`,
    text: texto,
    // NO incluir 'url' aquí - ya está en el texto y así el navegador muestra todo
  };

  const shared = await nativeShare(shareData);

  if (!shared) {
    await copyToClipboard(texto);
  }
}

// ==========================================
// FUNCIONES DE GENERAR IMAGEN
// ==========================================

/**
 * Carga una fuente web para usar en Canvas
 */
async function cargarFuente(): Promise<void> {
  try {
    await document.fonts.load("600 24px Inter");
    await document.fonts.load("400 16px Inter");
  } catch {
    // Si falla, usamos fuente del sistema
  }
}

/**
 * Divide texto en líneas que quepan en un ancho dado
 */
function dividirTextoEnLineas(
  ctx: CanvasRenderingContext2D,
  texto: string,
  maxAncho: number
): string[] {
  const palabras = texto.split(" ");
  const lineas: string[] = [];
  let lineaActual = "";

  for (const palabra of palabras) {
    const prueba = lineaActual ? `${lineaActual} ${palabra}` : palabra;
    const medida = ctx.measureText(prueba);

    if (medida.width > maxAncho && lineaActual) {
      lineas.push(lineaActual);
      lineaActual = palabra;
    } else {
      lineaActual = prueba;
    }
  }

  if (lineaActual) {
    lineas.push(lineaActual);
  }

  return lineas;
}

/**
 * Dibuja un rectángulo redondeado
 */
function dibujarRectRedondeado(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ancho: number,
  alto: number,
  radio: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radio, y);
  ctx.lineTo(x + ancho - radio, y);
  ctx.quadraticCurveTo(x + ancho, y, x + ancho, y + radio);
  ctx.lineTo(x + ancho, y + alto - radio);
  ctx.quadraticCurveTo(x + ancho, y + alto, x + ancho - radio, y + alto);
  ctx.lineTo(x + radio, y + alto);
  ctx.quadraticCurveTo(x, y + alto, x, y + alto - radio);
  ctx.lineTo(x, y + radio);
  ctx.quadraticCurveTo(x, y, x + radio, y);
  ctx.closePath();
}

/**
 * Genera una imagen bonita del aviso para compartir en redes
 */
async function generarImagenAviso(aviso: AvisoBora): Promise<Blob> {
  await cargarFuente();

  const categoria = obtenerCategoriaDeAviso(aviso);
  const colorCategoria = categoria
    ? CATEGORIAS_COLORES[categoria.id] || COLORES.primario
    : COLORES.primario;

  // Dimensiones para stories (9:16) o cuadrado para feed
  const ancho = 1080;
  const padding = 60;
  const anchoContenido = ancho - padding * 2;

  // Crear canvas temporal para medir altura necesaria
  const canvasTemp = document.createElement("canvas");
  const ctxTemp = canvasTemp.getContext("2d")!;
  ctxTemp.font = "600 42px Inter, system-ui, sans-serif";

  // Calcular líneas del título
  const lineasTitulo = dividirTextoEnLineas(
    ctxTemp,
    aviso.descripcion_ia || aviso.titulo,
    anchoContenido
  );

  // Calcular líneas del resumen si existe
  ctxTemp.font = "400 28px Inter, system-ui, sans-serif";
  const lineasResumen = aviso.resumen_ia
    ? dividirTextoEnLineas(ctxTemp, aviso.resumen_ia, anchoContenido)
    : [];

  // Calcular altura dinámica
  const alturaTitulo = lineasTitulo.length * 54;
  const alturaResumen = lineasResumen.length * 38;
  const alturaMinima = 800;
  const alturaCalculada =
    padding + // top
    80 + // header
    40 + // espacio
    alturaTitulo + // título
    (lineasResumen.length > 0 ? 40 + alturaResumen : 0) + // resumen
    60 + // espacio
    100 + // metadata
    80 + // footer
    padding; // bottom

  const alto = Math.max(alturaMinima, alturaCalculada);

  // Crear canvas final
  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext("2d")!;

  // Fondo con gradiente
  const gradiente = ctx.createLinearGradient(0, 0, 0, alto);
  gradiente.addColorStop(0, COLORES.fondo);
  gradiente.addColorStop(1, "#020617");
  ctx.fillStyle = gradiente;
  ctx.fillRect(0, 0, ancho, alto);

  // Decoración: círculo difuminado superior
  const gradienteCirculo = ctx.createRadialGradient(
    ancho * 0.8,
    alto * 0.1,
    0,
    ancho * 0.8,
    alto * 0.1,
    300
  );
  gradienteCirculo.addColorStop(0, `${colorCategoria}30`);
  gradienteCirculo.addColorStop(1, "transparent");
  ctx.fillStyle = gradienteCirculo;
  ctx.fillRect(0, 0, ancho, alto);

  let y = padding;

  // === HEADER ===
  // Logo/Marca
  ctx.font = "700 32px Inter, system-ui, sans-serif";
  ctx.fillStyle = COLORES.texto;
  ctx.fillText("📰 ÓRBITA", padding, y + 40);

  // Badge de tipo
  ctx.font = "600 22px Inter, system-ui, sans-serif";
  const textoTipo = aviso.subrubro.toUpperCase();
  const anchoTipo = ctx.measureText(textoTipo).width + 32;

  dibujarRectRedondeado(
    ctx,
    ancho - padding - anchoTipo,
    y + 12,
    anchoTipo,
    44,
    22
  );
  ctx.fillStyle = colorCategoria;
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(textoTipo, ancho - padding - anchoTipo / 2, y + 42);
  ctx.textAlign = "left";

  y += 80;

  // Línea decorativa
  ctx.strokeStyle = colorCategoria;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(padding, y);
  ctx.lineTo(padding + 100, y);
  ctx.stroke();

  y += 40;

  // === TÍTULO ===
  ctx.font = "600 42px Inter, system-ui, sans-serif";
  ctx.fillStyle = COLORES.texto;

  for (const linea of lineasTitulo) {
    ctx.fillText(linea, padding, y + 42);
    y += 54;
  }

  // === RESUMEN ===
  if (lineasResumen.length > 0) {
    y += 20;
    ctx.font = "400 28px Inter, system-ui, sans-serif";
    ctx.fillStyle = COLORES.textoSecundario;

    for (const linea of lineasResumen) {
      ctx.fillText(linea, padding, y + 28);
      y += 38;
    }
  }

  y += 40;

  // === CATEGORÍA ===
  if (categoria) {
    const anchoCat = ctx.measureText(categoria.nombre).width + 50;
    dibujarRectRedondeado(ctx, padding, y, anchoCat, 40, 20);
    ctx.fillStyle = `${colorCategoria}40`;
    ctx.fill();

    ctx.font = "500 20px Inter, system-ui, sans-serif";
    ctx.fillStyle = colorCategoria;
    ctx.fillText(`🏷️ ${categoria.nombre}`, padding + 16, y + 27);
    y += 60;
  }

  // === METADATA ===
  ctx.font = "400 24px Inter, system-ui, sans-serif";
  ctx.fillStyle = COLORES.textoSecundario;

  const emisor = formatearEmisor(aviso.emisor);
  // Usar fecha absoluta en captura (nunca "Hoy" o "Ayer")
  const fecha = formatearFechaAbsoluta(aviso.fecha_publicacion);

  ctx.fillText(`🏛️ ${emisor}`, padding, y + 24);
  y += 36;
  ctx.fillText(`📅 ${fecha}`, padding, y + 24);

  // === FOOTER ===
  y = alto - padding - 40;

  // Línea separadora
  ctx.strokeStyle = COLORES.borde;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, y - 20);
  ctx.lineTo(ancho - padding, y - 20);
  ctx.stroke();

  ctx.font = "400 20px Inter, system-ui, sans-serif";
  ctx.fillStyle = COLORES.textoSecundario;
  ctx.fillText("Boletín Oficial simplificado por IA", padding, y + 20);

  ctx.textAlign = "right";
  ctx.fillStyle = COLORES.primario;
  ctx.fillText("orbita.aoneken.com", ancho - padding, y + 20);
  ctx.textAlign = "left";

  // Convertir a Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("No se pudo generar la imagen"));
        }
      },
      "image/png",
      1.0
    );
  });
}

/**
 * Captura y comparte una imagen del aviso para redes sociales
 */
export async function capturarPantalla(aviso: AvisoBora): Promise<void> {
  const toastId = toast.loading("Generando imagen...");

  try {
    const blob = await generarImagenAviso(aviso);
    const file = new File([blob], `orbita-${aviso.id_aviso}.png`, {
      type: "image/png",
    });

    // Intentar compartir con Web Share API (si soporta archivos)
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: `${aviso.subrubro}: ${aviso.descripcion_ia?.slice(0, 50)}...`,
          files: [file],
        });
        toast.success("¡Imagen lista para compartir!", { id: toastId });
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          toast.dismiss(toastId);
          return;
        }
      }
    }

    // Fallback: descargar imagen
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orbita-${aviso.id_aviso}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("📸 Imagen descargada", {
      id: toastId,
      description: "Lista para compartir en Instagram, Twitter, etc.",
    });
  } catch {
    toast.error("No se pudo generar la imagen", { id: toastId });
  }
}

// ==========================================
// FUNCIONES PARA SÍNTESIS
// ==========================================

/**
 * Genera texto formateado para compartir síntesis
 */
function generarTextoSintesis(
  sintesisIA: string,
  fecha: string | null
): string {
  // Usar fecha absoluta para compartir (nunca "Hoy" o "Ayer")
  const fechaTexto = formatearFechaAbsoluta(fecha);

  return [
    `📰 *SÍNTESIS DEL BOLETÍN OFICIAL*`,
    `📅 ${fechaTexto}`,
    ``,
    sintesisIA,
    ``,
    `_Vía Órbita: ${PRODUCTION_URL}_`,
  ].join("\n");
}

/**
 * Comparte una síntesis del día
 */
export async function compartirSintesis(
  sintesisIA: string,
  fecha: string | null
): Promise<void> {
  const texto = generarTextoSintesis(sintesisIA, fecha);

  const shareData: ShareData = {
    title: "Síntesis del Boletín Oficial",
    text: texto,
  };

  const shared = await nativeShare(shareData);

  if (!shared) {
    await copyToClipboard(texto);
  }
}

/**
 * Genera y comparte imagen de la síntesis
 */
export async function capturarSintesis(
  sintesisIA: string,
  fecha: string | null
): Promise<void> {
  const toastId = toast.loading("Generando imagen...");

  try {
    await cargarFuente();

    // Usar fecha absoluta en captura (nunca "Hoy" o "Ayer")
    const fechaTexto = formatearFechaAbsoluta(fecha);

    // Dimensiones
    const ancho = 1080;
    const padding = 60;
    const anchoContenido = ancho - padding * 2;

    // Medir altura necesaria
    const canvasTemp = document.createElement("canvas");
    const ctxTemp = canvasTemp.getContext("2d")!;
    ctxTemp.font = "400 32px Inter, system-ui, sans-serif";

    const lineas = dividirTextoEnLineas(ctxTemp, sintesisIA, anchoContenido);
    const alturaTexto = lineas.length * 44;
    const alto = Math.max(800, padding * 2 + 160 + alturaTexto + 100);

    // Canvas final
    const canvas = document.createElement("canvas");
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext("2d")!;

    // Fondo
    const gradiente = ctx.createLinearGradient(0, 0, 0, alto);
    gradiente.addColorStop(0, COLORES.fondo);
    gradiente.addColorStop(1, "#020617");
    ctx.fillStyle = gradiente;
    ctx.fillRect(0, 0, ancho, alto);

    // Decoración
    const gradienteCirculo = ctx.createRadialGradient(
      ancho * 0.2,
      alto * 0.1,
      0,
      ancho * 0.2,
      alto * 0.1,
      400
    );
    gradienteCirculo.addColorStop(0, `${COLORES.primario}20`);
    gradienteCirculo.addColorStop(1, "transparent");
    ctx.fillStyle = gradienteCirculo;
    ctx.fillRect(0, 0, ancho, alto);

    let y = padding;

    // Header
    ctx.font = "700 36px Inter, system-ui, sans-serif";
    ctx.fillStyle = COLORES.texto;
    ctx.fillText("📰 SÍNTESIS DEL DÍA", padding, y + 40);

    ctx.font = "400 24px Inter, system-ui, sans-serif";
    ctx.fillStyle = COLORES.textoSecundario;
    ctx.textAlign = "right";
    ctx.fillText(fechaTexto, ancho - padding, y + 40);
    ctx.textAlign = "left";

    y += 80;

    // Línea decorativa
    ctx.strokeStyle = COLORES.primario;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(padding + 120, y);
    ctx.stroke();

    y += 40;

    // Contenido
    ctx.font = "400 32px Inter, system-ui, sans-serif";
    ctx.fillStyle = COLORES.texto;

    for (const linea of lineas) {
      ctx.fillText(linea, padding, y + 32);
      y += 44;
    }

    // Footer
    y = alto - padding - 30;

    ctx.strokeStyle = COLORES.borde;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, y - 20);
    ctx.lineTo(ancho - padding, y - 20);
    ctx.stroke();

    ctx.font = "400 20px Inter, system-ui, sans-serif";
    ctx.fillStyle = COLORES.textoSecundario;
    ctx.fillText("Boletín Oficial simplificado por IA", padding, y + 15);

    ctx.textAlign = "right";
    ctx.fillStyle = COLORES.primario;
    ctx.fillText("orbita.aoneken.com", ancho - padding, y + 15);

    // Convertir a Blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("No se pudo generar"))),
        "image/png",
        1.0
      );
    });

    const file = new File([blob], `orbita-sintesis-${fecha || "hoy"}.png`, {
      type: "image/png",
    });

    // Intentar compartir
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: "Síntesis del Boletín Oficial",
          files: [file],
        });
        toast.success("¡Imagen lista!", { id: toastId });
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          toast.dismiss(toastId);
          return;
        }
      }
    }

    // Fallback: descargar
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orbita-sintesis-${fecha || "hoy"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("📸 Imagen descargada", {
      id: toastId,
      description: "Lista para compartir en redes sociales",
    });
  } catch {
    toast.error("No se pudo generar la imagen", { id: toastId });
  }
}
