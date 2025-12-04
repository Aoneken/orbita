// ==========================================
// VISTA 404 - Página No Encontrada
// Fallback para rutas inválidas
// ==========================================

import { Home, SearchX } from "lucide-react";

import { ViewHeader } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";

interface NotFoundViewProps {
  onNavigateHome?: () => void;
}

export function NotFoundView({ onNavigateHome }: NotFoundViewProps) {
  const handleGoHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      // Fallback: recargar en home
      window.location.href = "/";
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-4 sm:pb-6">
      <ViewHeader
        title="Página no encontrada"
        description="La ruta que buscas no existe"
        icon={<SearchX className="h-8 w-8 text-muted-foreground" />}
        className="mb-6 sm:mb-8"
      />

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6 pb-6 text-center space-y-6">
          <div className="text-6xl sm:text-8xl font-bold text-muted-foreground/30">
            404
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground">
              Parece que te perdiste en el Boletín Oficial.
            </p>
            <p className="text-sm text-muted-foreground">
              No te preocupes, podés volver al inicio.
            </p>
          </div>

          <button
            onClick={handleGoHome}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl transition-colors hover:bg-primary/90 touch-manipulation active:scale-95"
          >
            <Home className="h-4 w-4" />
            Volver al Inicio
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
