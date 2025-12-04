import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  ChevronDown,
  FileText,
  Loader2,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { createContext, useContext, useMemo, useState } from "react";

import {
  BotonIrArriba,
  NotificacionFiltro,
  SelectorFechaFlotante,
  ViewHeader,
} from "@/components/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useRangoFechas } from "@/contexts";
import {
  useAvisosPorFecha,
  useConteoEtiquetas,
  useConteoSubrubros,
  useEstadisticas,
  useSintesisTelegram,
  useTopEmisores,
} from "@/hooks";

// Contexto para pasar el rango de fechas a componentes hijos
const DashboardFilterContext = createContext<{
  rangoFechas: { desde?: string; hasta?: string };
  tieneRango: boolean;
}>({ rangoFechas: {}, tieneRango: false });

function useDashboardFilter() {
  return useContext(DashboardFilterContext);
}

// Componente de estadística individual con indicador de tendencia
function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="flex items-baseline gap-2">
          <div className="text-xl sm:text-2xl font-bold">
            {value.toLocaleString()}
          </div>
          {trend && (
            <div
              className={`flex items-center text-[10px] sm:text-xs font-medium ${
                trend === "up"
                  ? "text-green-500 dark:text-green-400"
                  : trend === "down"
                  ? "text-red-500 dark:text-red-400"
                  : "text-muted-foreground"
              }`}
            >
              {trend === "up" ? (
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
              ) : trend === "down" ? (
                <ArrowDownRight className="h-3 w-3 mr-0.5" />
              ) : (
                <Activity className="h-3 w-3 mr-0.5" />
              )}
            </div>
          )}
        </div>
        {description && (
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Gráfico de barras simple para etiquetas con gradiente
function BarraProgreso({
  label,
  value,
  max,
  colorClass = "from-primary to-primary/60",
}: {
  label: string;
  value: number;
  max: number;
  colorClass?: string;
}) {
  const porcentaje = (value / max) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs sm:text-sm gap-2">
        <span className="truncate flex-1 font-medium">{label}</span>
        <span className="text-muted-foreground whitespace-nowrap text-xs">
          {value.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 sm:h-2 bg-secondary/50 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
}

// Componente de tendencias de etiquetas con colapsable
function TendenciasEtiquetas() {
  const { rangoFechas, tieneRango } = useDashboardFilter();
  const { data: etiquetas, isLoading } = useConteoEtiquetas(
    tieneRango ? rangoFechas : undefined
  );
  const [expandido, setExpandido] = useState(false);

  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex items-center justify-center h-48 sm:h-64">
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const top10 = etiquetas?.slice(0, 10) || [];
  const max = top10[0]?.cantidad || 1;
  // Siempre mostrar los primeros 5, el resto se muestra en el CollapsibleContent
  const visibles = top10.slice(0, 5);
  const ocultos = top10.slice(5);

  return (
    <Card className="col-span-full lg:col-span-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2 sm:pb-4 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Temas {tieneRango ? "del Período" : "del Mes"}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Etiquetas más frecuentes {tieneRango ? "(filtrado)" : "(30 días)"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <Collapsible open={expandido} onOpenChange={setExpandido}>
          <div className="space-y-3 sm:space-y-4">
            {visibles.map((item, i) => (
              <BarraProgreso
                key={item.etiqueta}
                label={item.etiqueta}
                value={item.cantidad}
                max={max}
                colorClass={
                  i === 0
                    ? "from-green-500 to-green-500/60"
                    : i < 3
                    ? "from-blue-500 to-blue-500/60"
                    : "from-primary to-primary/60"
                }
              />
            ))}
          </div>

          <CollapsibleContent>
            <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              {ocultos.map((item) => (
                <BarraProgreso
                  key={item.etiqueta}
                  label={item.etiqueta}
                  value={item.cantidad}
                  max={max}
                  colorClass="from-primary to-primary/60"
                />
              ))}
            </div>
          </CollapsibleContent>

          {ocultos.length > 0 && (
            <CollapsibleTrigger className="w-full mt-4 py-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 touch-manipulation border-t border-border/50">
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  expandido ? "rotate-180" : ""
                }`}
              />
              {expandido ? "Ver menos" : `Ver ${ocultos.length} más`}
            </CollapsibleTrigger>
          )}
        </Collapsible>
      </CardContent>
    </Card>
  );
}

// Componente de distribución por tipo de acto
function DistribucionSubrubros() {
  const { rangoFechas, tieneRango } = useDashboardFilter();
  const { data: subrubros, isLoading } = useConteoSubrubros(
    tieneRango ? rangoFechas : undefined
  );
  const [expandido, setExpandido] = useState(false);

  // Deduplicación estricta: asegura una única entrada por subrubro
  const subrubrosUnicos = useMemo(() => {
    if (!subrubros) return [];
    const seen = new Map<string, { subrubro: string; cantidad: number }>();
    for (const item of subrubros) {
      const key = item.subrubro.toLowerCase();
      const existing = seen.get(key);
      if (existing) {
        // Si existe, sumar cantidades (por si hay variación de mayúsculas)
        existing.cantidad += item.cantidad;
      } else {
        seen.set(key, { ...item });
      }
    }
    return Array.from(seen.values()).sort((a, b) => b.cantidad - a.cantidad);
  }, [subrubros]);

  if (isLoading) {
    return (
      <Card className="col-span-full sm:col-span-1 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex items-center justify-center h-48 sm:h-64">
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const top8 = subrubrosUnicos.slice(0, 8);
  const max = top8[0]?.cantidad || 1;
  // Siempre mostrar los primeros 4, el resto se muestra en el CollapsibleContent
  const visibles = top8.slice(0, 4);
  const ocultos = top8.slice(4);

  return (
    <Card className="col-span-full sm:col-span-1 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2 sm:pb-4 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Distribución Normativa
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Por tipo de acto {tieneRango ? "(filtrado)" : "(30 días)"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <Collapsible open={expandido} onOpenChange={setExpandido}>
          <div className="space-y-3 sm:space-y-4">
            {visibles.map((item, index) => (
              <BarraProgreso
                key={`${item.subrubro}-${index}`}
                label={item.subrubro}
                value={item.cantidad}
                max={max}
                colorClass="from-orange-500 to-orange-500/60"
              />
            ))}
          </div>

          <CollapsibleContent>
            <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              {ocultos.map((item, index) => (
                <BarraProgreso
                  key={`${item.subrubro}-expanded-${index}`}
                  label={item.subrubro}
                  value={item.cantidad}
                  max={max}
                  colorClass="from-orange-500 to-orange-500/60"
                />
              ))}
            </div>
          </CollapsibleContent>

          {ocultos.length > 0 && (
            <CollapsibleTrigger className="w-full mt-4 py-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 touch-manipulation border-t border-border/50">
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  expandido ? "rotate-180" : ""
                }`}
              />
              {expandido ? "Ver menos" : `+${ocultos.length}`}
            </CollapsibleTrigger>
          )}
        </Collapsible>
      </CardContent>
    </Card>
  );
}

// Componente de top organismos emisores
function TopEmisores() {
  const { rangoFechas, tieneRango } = useDashboardFilter();
  const { data: emisores, isLoading } = useTopEmisores(
    8,
    tieneRango ? rangoFechas : undefined
  );
  const [expandido, setExpandido] = useState(false);

  if (isLoading) {
    return (
      <Card className="col-span-full sm:col-span-1 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex items-center justify-center h-48 sm:h-64">
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const max = emisores?.[0]?.cantidad || 1;
  // Siempre mostrar los primeros 4, el resto se muestra en el CollapsibleContent
  const visibles = emisores?.slice(0, 4) || [];
  const ocultos = emisores?.slice(4) || [];

  return (
    <Card className="col-span-full sm:col-span-1 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2 sm:pb-4 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Top Emisores {tieneRango ? "" : "(30d)"}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Organismos más activos {tieneRango ? "(filtrado)" : "del mes"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <Collapsible open={expandido} onOpenChange={setExpandido}>
          <div className="space-y-3 sm:space-y-4">
            {visibles.map((item) => (
              <BarraProgreso
                key={item.emisor}
                label={item.emisor}
                value={item.cantidad}
                max={max}
                colorClass="from-purple-500 to-purple-500/60"
              />
            ))}
          </div>

          <CollapsibleContent>
            <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              {ocultos.map((item) => (
                <BarraProgreso
                  key={item.emisor}
                  label={item.emisor}
                  value={item.cantidad}
                  max={max}
                  colorClass="from-purple-500 to-purple-500/60"
                />
              ))}
            </div>
          </CollapsibleContent>

          {ocultos.length > 0 && (
            <CollapsibleTrigger className="w-full mt-4 py-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 touch-manipulation border-t border-border/50">
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  expandido ? "rotate-180" : ""
                }`}
              />
              {expandido ? "Ver menos" : `+${ocultos.length}`}
            </CollapsibleTrigger>
          )}
        </Collapsible>
      </CardContent>
    </Card>
  );
}

// Calendario de actividad mejorado
function CalendarioActividad() {
  const { rangoFechas, tieneRango } = useDashboardFilter();
  const { data: fechas, isLoading } = useAvisosPorFecha(
    tieneRango ? rangoFechas : undefined
  );

  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex items-center justify-center h-40 sm:h-48">
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Si no hay datos, mostrar mensaje
  if (!fechas || fechas.length === 0) {
    return (
      <Card className="col-span-full lg:col-span-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2 sm:pb-4 px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex items-center justify-center h-32 sm:h-40 text-muted-foreground text-sm">
            No hay datos para este período
          </div>
        </CardContent>
      </Card>
    );
  }

  // En móvil 7 días, en desktop 14
  const diasMostrar =
    typeof window !== "undefined" && window.innerWidth < 640 ? 7 : 14;
  const ultimasFechas = fechas?.slice(0, diasMostrar).reverse() || [];
  const max = Math.max(...ultimasFechas.map((f) => f.cantidad), 1);

  return (
    <Card className="col-span-full lg:col-span-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2 sm:pb-4 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Actividad {tieneRango ? "del Período" : "Reciente"}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Volumen de publicaciones diario {tieneRango ? "(filtrado)" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="flex items-end gap-1 sm:gap-2 h-32 sm:h-40">
          {ultimasFechas.map((item) => {
            const altura = Math.max((item.cantidad / max) * 100, 5); // Mínimo 5% de altura

            // Parsear fecha localmente para evitar problemas de timezone
            const [year, month, day] = item.fecha.split("-").map(Number);
            const fecha = new Date(year, month - 1, day);

            const dia = fecha.toLocaleDateString("es-AR", { weekday: "short" });
            const diaNum = fecha.getDate();

            return (
              <div
                key={item.fecha}
                className="flex-1 flex flex-col items-center group relative h-full"
              >
                {/* Tooltip simple */}
                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-sm whitespace-nowrap z-10 pointer-events-none">
                  {item.cantidad} avisos
                </div>

                {/* Contenedor de la barra con altura flex para que el % funcione */}
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-primary/80 to-primary rounded-t-sm transition-all group-hover:from-primary group-hover:to-primary/90"
                    style={{ height: `${altura}%` }}
                  />
                </div>
                <div className="flex flex-col items-center shrink-0 pt-1">
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase">
                    {dia}
                  </span>
                  <span className="text-[10px] sm:text-xs font-medium">
                    {diaNum}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de comparativa semanal
function ComparativaSemanal() {
  const { data: stats, isLoading } = useEstadisticas();

  if (isLoading) {
    return (
      <Card className="col-span-full sm:col-span-1 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex items-center justify-center h-48 sm:h-64">
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const semanaActual = stats?.semana || 0;
  const semanaAnterior = stats?.semanaAnterior || 0;
  const max = Math.max(semanaActual, semanaAnterior, 1);

  return (
    <Card className="col-span-full sm:col-span-1 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2 sm:pb-4 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Rendimiento Semanal
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Comparativa vs semana anterior
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="space-y-6 mt-4">
          {/* Semana Actual */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="font-medium">Esta Semana</span>
              <span className="font-bold text-primary">{semanaActual}</span>
            </div>
            <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                style={{ width: `${(semanaActual / max) * 100}%` }}
              />
            </div>
          </div>

          {/* Semana Anterior */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="font-medium text-muted-foreground">
                Semana Anterior
              </span>
              <span className="font-bold text-muted-foreground">
                {semanaAnterior}
              </span>
            </div>
            <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-muted-foreground/40 rounded-full transition-all duration-500"
                style={{ width: `${(semanaAnterior / max) * 100}%` }}
              />
            </div>
          </div>

          {/* Diferencia */}
          <div className="pt-2 border-t border-border/50 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Variación</span>
            <div
              className={`flex items-center text-sm font-bold ${
                semanaActual >= semanaAnterior
                  ? "text-green-500 dark:text-green-400"
                  : "text-red-500 dark:text-red-400"
              }`}
            >
              {semanaActual >= semanaAnterior ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              {Math.abs(semanaActual - semanaAnterior)} avisos
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// COMPONENTE: SEÑALES DEL DÍA (Alertas inteligentes)
// ==========================================

function SenalesDelDia() {
  const { data: sintesis, isLoading } = useSintesisTelegram();
  const { data: stats } = useEstadisticas();

  const alertas = useMemo(() => {
    const items: Array<{
      tipo: "warning" | "info" | "success";
      titulo: string;
      detalle: string;
      icon: typeof AlertTriangle;
    }> = [];

    if (stats) {
      // Alerta por cambio significativo
      if (stats.hoy > stats.ayer * 1.5 && stats.ayer > 0) {
        items.push({
          tipo: "warning",
          titulo: "Actividad Inusual",
          detalle: `+${Math.round(
            ((stats.hoy - stats.ayer) / stats.ayer) * 100
          )}% más avisos que ayer`,
          icon: Zap,
        });
      }

      if (stats.hoy < stats.ayer * 0.5 && stats.hoy > 0) {
        items.push({
          tipo: "info",
          titulo: "Baja Actividad",
          detalle: "Menos de la mitad que ayer",
          icon: Activity,
        });
      }
    }

    if (sintesis) {
      // Top etiquetas del día
      if (sintesis.etiquetas_top3 && sintesis.etiquetas_top3.length > 0) {
        items.push({
          tipo: "info",
          titulo: "Temas Dominantes",
          detalle: sintesis.etiquetas_top3.slice(0, 3).join(", "),
          icon: TrendingUp,
        });
      }

      // Muchos anexos
      if (sintesis.total_con_anexos > 5) {
        items.push({
          tipo: "info",
          titulo: "Documentación Adjunta",
          detalle: `${sintesis.total_con_anexos} normas con anexos técnicos`,
          icon: FileText,
        });
      }
    }

    // Si no hay alertas, mostrar mensaje neutro
    if (items.length === 0) {
      items.push({
        tipo: "success",
        titulo: "Actividad Normal",
        detalle: "Sin movimientos destacables",
        icon: Activity,
      });
    }

    return items;
  }, [sintesis, stats]);

  if (isLoading) {
    return (
      <Card className="col-span-full sm:col-span-1 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex items-center justify-center h-48 sm:h-64">
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const colorMap = {
    warning:
      "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300",
    info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300",
    success:
      "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300",
  };

  const iconColorMap = {
    warning: "text-amber-500 dark:text-amber-400",
    info: "text-blue-500 dark:text-blue-400",
    success: "text-green-500 dark:text-green-400",
  };

  return (
    <Card className="col-span-full sm:col-span-1 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2 sm:pb-4 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Señales del Día
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Movimientos y tendencias detectadas
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="space-y-2">
          {alertas.map((alerta, i) => {
            const Icon = alerta.icon;
            return (
              <div
                key={i}
                className={`p-3 rounded-lg border ${
                  colorMap[alerta.tipo]
                } flex items-start gap-3`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 mt-0.5 ${
                    iconColorMap[alerta.tipo]
                  }`}
                />
                <div>
                  <div className="font-medium text-sm">{alerta.titulo}</div>
                  <div className="text-xs opacity-80 mt-0.5">
                    {alerta.detalle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// COMPONENTE: PROTAGONISTAS HOY
// ==========================================

function ProtagonistasHoy() {
  const { data: sintesis, isLoading } = useSintesisTelegram();

  if (isLoading) {
    return (
      <Card className="col-span-full sm:col-span-1 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!sintesis?.emisores_top3 || sintesis.emisores_top3.length === 0) {
    return null;
  }

  return (
    <Card className="col-span-full sm:col-span-1 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2 sm:pb-4 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Protagonistas Hoy
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Organismos con más publicaciones
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="flex flex-wrap gap-2">
          {sintesis.emisores_top3.map((emisor, i) => (
            <span
              key={emisor}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                i === 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {emisor}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Vista principal del Dashboard
export function DashboardView() {
  const { rangoFechas, setRangoFechas } = useRangoFechas();
  const { data: stats, isLoading: loadingStats } = useEstadisticas();

  const tieneRango = !!(rangoFechas.desde || rangoFechas.hasta);

  // Cálculo de tendencias reales
  const hoyTrend =
    (stats?.hoy || 0) > (stats?.ayer || 0)
      ? "up"
      : (stats?.hoy || 0) < (stats?.ayer || 0)
      ? "down"
      : "neutral";

  const semanaTrend =
    (stats?.semana || 0) > (stats?.semanaAnterior || 0)
      ? "up"
      : (stats?.semana || 0) < (stats?.semanaAnterior || 0)
      ? "down"
      : "neutral";

  return (
    <DashboardFilterContext.Provider value={{ rangoFechas, tieneRango }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 relative">
        {/* Indicador flotante de filtro activo - componente reutilizable */}
        <NotificacionFiltro
          rangoFechas={rangoFechas}
          onClear={() => setRangoFechas({ desde: undefined, hasta: undefined })}
          variant="badge"
        />

        <ViewHeader
          title="Dashboard"
          description="Métricas en tiempo real del Boletín Oficial"
          icon={<BarChart3 className="h-6 w-6" />}
          className="mb-6 sm:mb-8"
        />

        {/* Estadísticas principales - 2 cols en móvil, 4 en desktop */}
        {/* NOTA: "Total Histórico" es estático (referencia global), el resto reacciona al contexto */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4 mb-6 sm:mb-8">
          {loadingStats ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card
                  key={i}
                  className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
                >
                  <CardContent className="flex items-center justify-center h-24 sm:h-32">
                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Total Histórico"
                value={stats?.total || 0}
                description="Avisos procesados"
                icon={FileText}
                trend="neutral"
              />
              <StatCard
                title="Publicados Hoy"
                value={stats?.hoy || 0}
                description="Boletín del día"
                icon={Calendar}
                trend={hoyTrend}
              />
              <StatCard
                title="Últimos 7 Días"
                value={stats?.semana || 0}
                description="Actividad semanal"
                icon={TrendingUp}
                trend={semanaTrend}
              />
              <StatCard
                title="Promedio Diario"
                value={stats?.semana ? Math.round(stats.semana / 7) : 0}
                description="Esta semana"
                icon={BarChart3}
                trend="neutral"
              />
            </>
          )}
        </div>

        {/* Grid de gráficos - stack vertical en móvil */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <TendenciasEtiquetas />
          <DistribucionSubrubros />
          <ComparativaSemanal />
          <TopEmisores />
          <CalendarioActividad />
          <SenalesDelDia />
          <ProtagonistasHoy />
        </div>
      </div>

      {/* Selector de fecha flotante (rango) */}
      <SelectorFechaFlotante
        mode="range"
        allowModeSwitch={true}
        rangoFechas={rangoFechas}
        onRangoChange={setRangoFechas}
      />
      <BotonIrArriba />
    </DashboardFilterContext.Provider>
  );
}
