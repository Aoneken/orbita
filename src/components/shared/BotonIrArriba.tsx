import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

interface BotonIrArribaProps {
  /** Clase adicional para posicionamiento custom */
  className?: string;
  /** Umbral de scroll en píxeles para mostrar el botón (default: 300) */
  threshold?: number;
  /** Posición del botón: normal o elevada (cuando hay selector de fechas) */
  position?: "normal" | "elevated";
}

/**
 * Botón flotante para volver al inicio de la página
 * Se muestra automáticamente cuando el usuario hace scroll hacia abajo
 * Usa safe-area-inset para evitar superposición con barra de gestos iOS
 */
export function BotonIrArriba({
  className = "",
  threshold = 300,
  position = "normal",
}: BotonIrArribaProps) {
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setMostrar(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const irArriba = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!mostrar) return null;

  const positionClass =
    position === "elevated" ? "floating-btn-elevated" : "floating-btn-normal";

  return (
    <button
      type="button"
      onClick={irArriba}
      className={`fixed right-4 z-40 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all active:scale-95 touch-manipulation ${positionClass} ${className}`}
      aria-label="Ir arriba"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
