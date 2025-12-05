// ==========================================
// BOTÓN DE INSTALACIÓN PWA INTELIGENTE
// ==========================================
// Muestra un botón para instalar la app como PWA.
// Se oculta automáticamente si:
// - La app ya está instalada (modo standalone)
// - El navegador no soporta instalación
// - El usuario ya instaló la app

import { Download, Share, PlusSquare } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [isIOS] = useState(() =>
    /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
  );

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
    // En iOS no podemos invocar el prompt, retornamos false para manejarlo en la UI
    if (isIOS) return false;

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
  }, [installPrompt, isIOS]);

  // El botón es visible si:
  // - Tenemos el evento de instalación capturado (Android/Desktop) O es iOS
  // - No estamos en modo standalone
  // - No se ha instalado la app
  const canInstall = (!!installPrompt || isIOS) && !isStandalone && !isInstalled;

  return {
    canInstall,
    promptInstall,
    isStandalone,
    isIOS,
  };
}

/**
 * Botón de instalación de PWA para el header.
 * Solo se muestra cuando la instalación es posible.
 */
export function InstallPWAButton() {
  const { canInstall, promptInstall, isIOS } = useInstallPWA();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // No renderizar si no se puede instalar
  if (!canInstall) return null;

  const handleClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      await promptInstall();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-colors active:scale-95 animate-pulse shadow-sm"
        aria-label="Instalar aplicación"
        title="Instalar Órbita como app"
      >
        <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">Instalar</span>
      </button>

      <Dialog open={showIOSInstructions} onOpenChange={setShowIOSInstructions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Instalar Órbita en iOS</DialogTitle>
            <DialogDescription>
              Sigue estos pasos para instalar la aplicación en tu pantalla de inicio:
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center p-2 rounded-md bg-muted text-primary">
                <Share className="h-5 w-5" />
              </div>
              <p className="text-sm">
                1. Toca el botón <strong>Compartir</strong> en la barra inferior de Safari.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center p-2 rounded-md bg-muted text-primary">
                <PlusSquare className="h-5 w-5" />
              </div>
              <p className="text-sm">
                2. Busca y selecciona <strong>Agregar a Inicio</strong> en el menú.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
