import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BarChart3, Home, Info, Search } from "lucide-react";
import { Suspense, lazy, useState } from "react";

import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { InstallPWAButton } from "@/components/ui/InstallPWAButton";
import {
  AnimatePresence,
  DirectionalPageTransition,
} from "@/components/ui/transitions";
import { FechaProvider } from "@/contexts";
import {
  useConnectionStatus,
  useRealtimeAvisos,
  useUltimaActualizacion,
} from "@/hooks";
import { clearAppBadge } from "@/utils/notifications";
import { formatearActualizacion } from "@/lib/utils";

// Lazy-loaded views para code-splitting
const InicioView = lazy(() =>
  import("@/components/views/InicioView").then((m) => ({
    default: m.InicioView,
  }))
);
const ExplorarView = lazy(() =>
  import("@/components/views/ExplorarView").then((m) => ({
    default: m.ExplorarView,
  }))
);
const DashboardView = lazy(() =>
  import("@/components/views/DashboardView").then((m) => ({
    default: m.DashboardView,
  }))
);
const InfoView = lazy(() =>
  import("@/components/views/InfoView").then((m) => ({ default: m.InfoView }))
);

// Fallback de carga para Suspense
function ViewLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

// Cliente de React Query optimizado
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos - datos considerados frescos
      gcTime: 1000 * 60 * 30, // 30 minutos - mantener en cache
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

type Vista = "inicio" | "explorar" | "dashboard" | "info";

const VISTAS = [
  {
    id: "inicio" as Vista,
    nombre: "Inicio",
    icon: Home,
    descripcion: "Síntesis diaria",
  },
  {
    id: "explorar" as Vista,
    nombre: "Explorar",
    icon: Search,
    descripcion: "Buscar avisos",
  },
  {
    id: "dashboard" as Vista,
    nombre: "Dashboard",
    icon: BarChart3,
    descripcion: "Análisis",
  },
  {
    id: "info" as Vista,
    nombre: "Info",
    icon: Info,
    descripcion: "Acerca de",
  },
];

function Navegacion({
  vistaActual,
  onChange,
  realtimeStatus,
}: {
  vistaActual: Vista;
  onChange: (vista: Vista) => void;
  realtimeStatus: "connecting" | "connected" | "disconnected" | "error";
}) {
  const { data: ultimaActualizacion } = useUltimaActualizacion();
  const { data: isConnected, isLoading: isCheckingConnection } =
    useConnectionStatus();

  // Determinar estado del indicador de conexión
  // 🟢 Verde: Realtime conectado (escuchando en vivo)
  // 🔵 Azul: BD conectada (fetching estándar)
  // 🟡 Amarillo: Conectando
  // 🔴 Rojo: Desconectado/Error
  const getConnectionIndicator = () => {
    if (isCheckingConnection) {
      return {
        color: "bg-yellow-500 animate-pulse",
        title: "Verificando conexión...",
      };
    }
    if (realtimeStatus === "connected") {
      return {
        color: "bg-green-500 animate-[pulse_3s_ease-in-out_infinite]",
        title: "En vivo: escuchando cambios en tiempo real",
      };
    }
    if (realtimeStatus === "connecting") {
      return {
        color: "bg-blue-500 animate-pulse",
        title: "Conectando al servidor en tiempo real...",
      };
    }
    if (isConnected) {
      return {
        color: "bg-blue-500",
        title: "Conectado a la base de datos",
      };
    }
    return {
      color: "bg-red-500 animate-[pulse_1s_ease-in-out_infinite]",
      title: "Sin conexión",
    };
  };

  const indicator = getConnectionIndicator();

  return (
    <>
      {/* Header superior - Logo a la izquierda, título centrado, fecha a la derecha */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b select-none safe-area-top">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo + Botón de instalación a la izquierda */}
            <div className="flex items-center gap-2">
              <picture>
                <source srcSet="/logo-header.webp" type="image/webp" />
                <img
                  src="/logo-header.png"
                  alt="Logo Órbita"
                  className="h-9 sm:h-10 w-auto"
                />
              </picture>
              {/* Botón de instalación PWA con animación de pulso */}
              <InstallPWAButton />
            </div>

            {/* Título centrado */}
            <div className="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
              <span className="font-bold text-lg sm:text-xl">Órbita</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                v1.2.1
              </span>
            </div>

            {/* Indicador de conexión + Theme Toggle + Fecha de actualización a la derecha */}
            <div className="flex items-center gap-2">
              {/* Toggle de tema (Dark Mode) */}
              <ThemeToggle />

              {/* Indicador de conexión animado (verde=realtime, azul=BD, rojo=offline) */}
              <span
                className={`h-2 w-2 rounded-full ${indicator.color}`}
                title={indicator.title}
              />
              {ultimaActualizacion && (
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {formatearActualizacion(ultimaActualizacion)}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navegación inferior fija en móvil, superior en desktop */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t sm:sticky sm:top-14 sm:border-t-0 sm:border-b safe-area-bottom select-none">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-around sm:justify-center sm:gap-2 h-16 sm:h-12 px-2">
            {VISTAS.map((vista) => {
              const Icon = vista.icon;
              const isActive = vistaActual === vista.id;

              return (
                <button
                  type="button"
                  key={vista.id}
                  onClick={() => onChange(vista.id)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all min-w-[72px] sm:min-w-0 active:scale-95 ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  aria-label={vista.descripcion}
                >
                  <Icon
                    className={`h-5 w-5 sm:h-4 sm:w-4 ${
                      isActive ? "text-primary" : ""
                    }`}
                  />
                  <span>{vista.nombre}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}

function AppContent() {
  const [vistaActual, setVistaActual] = useState<Vista>("inicio");
  const [direction, setDirection] = useState<"left" | "right">("right");

  // Hook de realtime para avisos
  const { status: realtimeStatus, clearNewAvisosCount } = useRealtimeAvisos({
    onNewAviso: () => {
      // Toast opcional cuando llega un nuevo aviso
      // toast.info("Nuevos avisos detectados", { duration: 3000 });
    },
  });

  // Handler para cambio de vista con tracking de dirección
  const handleVistaChange = (nuevaVista: Vista) => {
    const currentIndex = VISTAS.findIndex((v) => v.id === vistaActual);
    const newIndex = VISTAS.findIndex((v) => v.id === nuevaVista);

    // Determinar dirección basada en índices
    setDirection(newIndex >= currentIndex ? "right" : "left");
    setVistaActual(nuevaVista);

    // Scroll Restoration: volver arriba al cambiar de vista
    window.scrollTo({ top: 0, behavior: "instant" });

    // Limpiar badge PWA y contador cuando el usuario navega a explorar
    if (nuevaVista === "explorar") {
      clearNewAvisosCount();
      clearAppBadge();
    }
  };

  // Wrapper para navegación desde vistas hijas
  const handleNavigate = (vista: string) => {
    if (["inicio", "explorar", "dashboard", "info"].includes(vista)) {
      handleVistaChange(vista as Vista);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navegacion
        vistaActual={vistaActual}
        onChange={handleVistaChange}
        realtimeStatus={realtimeStatus}
      />

      {/* Contenido principal con transiciones animadas direccionales */}
      <main className="pb-20 sm:pb-0">
        <Suspense fallback={<ViewLoader />}>
          <AnimatePresence mode="wait">
            {vistaActual === "inicio" && (
              <DirectionalPageTransition key="inicio" direction={direction}>
                <InicioView onNavigate={handleNavigate} />
              </DirectionalPageTransition>
            )}
            {vistaActual === "explorar" && (
              <DirectionalPageTransition key="explorar" direction={direction}>
                <ExplorarView />
              </DirectionalPageTransition>
            )}
            {vistaActual === "dashboard" && (
              <DirectionalPageTransition key="dashboard" direction={direction}>
                <DashboardView />
              </DirectionalPageTransition>
            )}
            {vistaActual === "info" && (
              <DirectionalPageTransition key="info" direction={direction}>
                <InfoView />
              </DirectionalPageTransition>
            )}
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Footer - oculto en móvil */}
      <footer className="hidden sm:block border-t mt-12 py-6 select-none">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Órbita - BORA simplificado por Aoneken</p>
          <p className="mt-1">Datos Procesados con IA</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FechaProvider>
        <AppContent />
        <Toaster position="top-center" richColors closeButton />
      </FechaProvider>
    </QueryClientProvider>
  );
}

export default App;
