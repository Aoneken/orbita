// ==========================================
// CONTEXTO DE TEMA - Dark Mode System
// Usa next-themes para persistencia y detección automática
// ==========================================

import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";
import { createContext, useContext, type ReactNode } from "react";

// ==========================================
// TIPOS
// ==========================================

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark" | undefined;
  systemTheme: "light" | "dark" | undefined;
  isLoading: boolean;
}

// ==========================================
// CONTEXTO
// ==========================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ==========================================
// HOOK PERSONALIZADO
// ==========================================

/**
 * Hook para acceder al sistema de tema
 * Proporciona: tema actual, tema resuelto, tema del sistema, y funciones para cambiar
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }

  return context;
}

// ==========================================
// PROVIDER INTERNO
// ==========================================

function ThemeContextProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();

  // isLoading es derivado directamente del estado de resolvedTheme
  const isLoading = !resolvedTheme;

  const value: ThemeContextType = {
    theme: (theme as Theme) ?? "system",
    setTheme: (newTheme: Theme) => setTheme(newTheme),
    resolvedTheme: resolvedTheme as "light" | "dark" | undefined,
    systemTheme: systemTheme as "light" | "dark" | undefined,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// ==========================================
// PROVIDER PRINCIPAL
// ==========================================

interface ThemeProviderProps {
  children: ReactNode;
  /** Tema por defecto si no hay preferencia guardada */
  defaultTheme?: Theme;
  /** Key para localStorage */
  storageKey?: string;
}

/**
 * Provider principal del sistema de temas
 * Envuelve la aplicación para habilitar dark mode
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "orbita-theme",
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      storageKey={storageKey}
      enableSystem
      disableTransitionOnChange={false}
    >
      <ThemeContextProvider>{children}</ThemeContextProvider>
    </NextThemesProvider>
  );
}

export type { Theme, ThemeContextType };
