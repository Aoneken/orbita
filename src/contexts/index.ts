// ==========================================
// BARREL EXPORT: CONTEXTS
// ==========================================

// Provider del contexto de fechas
export { FechaProvider } from "./FechaContext";

// Provider del contexto de tema (Dark Mode)
export { ThemeProvider, useTheme, type Theme } from "./ThemeContext";

// Hooks (separados para Fast Refresh optimization)
export {
  useFechaContext,
  useFechaSeleccionada,
  useRangoFechas,
} from "./useFechaHooks";
