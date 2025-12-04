/**
 * PWA Badging API utilities
 * Permite mostrar indicadores visuales en el icono de la app instalada
 */

/**
 * Muestra un badge en el icono de la PWA indicando contenido nuevo
 * Solo funciona si la API está soportada y la app está instalada
 */
export async function setNewContentBadge(): Promise<boolean> {
  try {
    if ("setAppBadge" in navigator) {
      await navigator.setAppBadge(1);
      return true;
    }
    return false;
  } catch (error) {
    // Silenciar errores - la API puede fallar en ciertos contextos
    console.debug("[PWA Badge] No se pudo establecer el badge:", error);
    return false;
  }
}

/**
 * Limpia el badge del icono de la PWA
 * Debe ejecutarse cuando el usuario interactúa con el contenido
 */
export async function clearAppBadge(): Promise<boolean> {
  try {
    if ("clearAppBadge" in navigator) {
      await navigator.clearAppBadge();
      return true;
    }
    return false;
  } catch (error) {
    console.debug("[PWA Badge] No se pudo limpiar el badge:", error);
    return false;
  }
}

/**
 * Verifica si la API de Badging está disponible
 */
export function isBadgingSupported(): boolean {
  return "setAppBadge" in navigator && "clearAppBadge" in navigator;
}
