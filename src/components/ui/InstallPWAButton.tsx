// ==========================================
// BOTÓN DE INSTALACIÓN PWA INTELIGENTE
// ==========================================
// Muestra un botón para instalar la app como PWA.
// Se oculta automáticamente si:
// - La app ya está instalada (modo standalone)
// - El navegador no soporta instalación
// - El usuario ya instaló la app

import { Download } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Extender la interfaz Window para incluir el evento beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

/**
 * Hook para manejar la lógica de instalación de PWA
 */
function useInstallPWA() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detectar si ya está corriendo como PWA (standalone)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        // Para iOS Safari
        ("standalone" in window.navigator &&
          (window.navigator as Navigator & { standalone: boolean })
            .standalone === true);
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Escuchar cambios en el modo de display (por si el usuario instala)
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };
    mediaQuery.addEventListener("change", handleChange);

    // Capturar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevenir que Chrome muestre el prompt automático
      e.preventDefault();
      // Guardar el evento para usarlo después
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Detectar cuando la app fue instalada
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Función para disparar la instalación
  const promptInstall = useCallback(async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;

      if (outcome === "accepted") {
        setIsInstalled(true);
        setInstallPrompt(null);
        return true;
      }
      return false;
    } catch {
      console.error("Error al mostrar prompt de instalación");
      return false;
    }
  }, [installPrompt]);

  // El botón es visible si:
  // - Tenemos el evento de instalación capturado
  // - No estamos en modo standalone
  // - No se ha instalado la app
  const canInstall = !!installPrompt && !isStandalone && !isInstalled;

  return {
    canInstall,
    promptInstall,
    isStandalone,
  };
}

/**
 * Botón de instalación de PWA para el header.
 * Solo se muestra cuando la instalación es posible.
 */
export function InstallPWAButton() {
  const { canInstall, promptInstall } = useInstallPWA();

  // No renderizar si no se puede instalar
  if (!canInstall) return null;

  return (
    <button
      type="button"
      onClick={promptInstall}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-colors active:scale-95 animate-pulse shadow-sm"
      aria-label="Instalar aplicación"
      title="Instalar Órbita como app"
    >
      <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      <span className="hidden sm:inline">Instalar</span>
    </button>
  );
}
