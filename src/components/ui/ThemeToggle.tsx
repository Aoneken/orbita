// ==========================================
// COMPONENTE: ThemeToggle
// Botón para alternar entre modos claro/oscuro/sistema
// ==========================================

import { useTheme, type Theme } from "@/contexts";
import { cn } from "@/lib/utils";
import { Monitor, Moon, Sun } from "lucide-react";

// ==========================================
// TIPOS
// ==========================================

interface ThemeToggleProps {
  /** Variante visual del toggle */
  variant?: "icon" | "dropdown" | "segmented";
  /** Clases adicionales */
  className?: string;
  /** Mostrar label de texto (solo para dropdown) */
  showLabel?: boolean;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

/**
 * Botón de toggle para cambiar el tema de la aplicación
 * Por defecto usa la variante "icon" (simple botón con icono)
 */
export function ThemeToggle({
  variant = "icon",
  className,
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme, isLoading } = useTheme();

  // Ciclar entre temas: light -> dark -> system -> light
  const cycleTheme = () => {
    const themeOrder: Theme[] = ["light", "dark", "system"];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  // Renderizar icono según el tema actual
  const renderThemeIcon = () => {
    if (isLoading) {
      return (
        <div className="h-4 w-4 animate-pulse bg-muted-foreground/20 rounded-full" />
      );
    }

    if (theme === "system") {
      return <Monitor className="h-4 w-4" />;
    }

    // Usar tema resuelto para mostrar sol/luna
    if (resolvedTheme === "dark") {
      return <Moon className="h-4 w-4" />;
    }

    return <Sun className="h-4 w-4" />;
  };

  // Label del tema actual
  const getThemeLabel = (): string => {
    switch (theme) {
      case "light":
        return "Claro";
      case "dark":
        return "Oscuro";
      case "system":
        return "Sistema";
      default:
        return "Tema";
    }
  };

  // ==========================================
  // VARIANTE: ICON (por defecto)
  // ==========================================
  if (variant === "icon") {
    return (
      <button
        onClick={cycleTheme}
        className={cn(
          "relative flex items-center justify-center",
          "h-9 w-9 rounded-lg",
          "bg-muted/50 hover:bg-muted",
          "text-muted-foreground hover:text-foreground",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "touch-manipulation active:scale-95",
          className
        )}
        title={`Tema: ${getThemeLabel()}`}
        aria-label={`Cambiar tema (actual: ${getThemeLabel()})`}
      >
        {renderThemeIcon()}
      </button>
    );
  }

  // ==========================================
  // VARIANTE: SEGMENTED (3 botones)
  // ==========================================
  if (variant === "segmented") {
    const themes: { id: Theme; icon: typeof Sun; label: string }[] = [
      { id: "light", icon: Sun, label: "Claro" },
      { id: "dark", icon: Moon, label: "Oscuro" },
      { id: "system", icon: Monitor, label: "Auto" },
    ];

    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 p-1 rounded-lg bg-muted/50",
          className
        )}
        role="radiogroup"
        aria-label="Selector de tema"
      >
        {themes.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTheme(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "touch-manipulation",
              theme === id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            role="radio"
            aria-checked={theme === id}
            aria-label={label}
          >
            <Icon className="h-4 w-4" />
            {showLabel && <span className="hidden sm:inline">{label}</span>}
          </button>
        ))}
      </div>
    );
  }

  // ==========================================
  // VARIANTE: DROPDOWN (con label)
  // ==========================================
  return (
    <button
      onClick={cycleTheme}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg",
        "bg-muted/50 hover:bg-muted",
        "text-sm font-medium",
        "text-muted-foreground hover:text-foreground",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "touch-manipulation active:scale-95",
        className
      )}
      aria-label={`Cambiar tema (actual: ${getThemeLabel()})`}
    >
      {renderThemeIcon()}
      {showLabel && <span>{getThemeLabel()}</span>}
    </button>
  );
}

export default ThemeToggle;
