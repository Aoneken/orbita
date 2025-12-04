import { useFechasConSintesis } from "@/hooks";
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ==========================================
// TIPOS
// ==========================================

type ModoSeleccion = "single" | "range";

interface RangoFechas {
  desde: string | undefined;
  hasta: string | undefined;
}

interface SelectorFechaFlotanteProps {
  /** Modo inicial: 'single' para fecha única, 'range' para rango */
  mode: ModoSeleccion;

  /** Permite al usuario cambiar entre modos (solo disponible cuando mode='range') */
  allowModeSwitch?: boolean;

  /** Fecha seleccionada (modo single) */
  fechaSeleccionada?: string;

  /** Callback cuando cambia la fecha (modo single) */
  onFechaChange?: (fecha: string | undefined) => void;

  /** Rango de fechas seleccionado (modo range) */
  rangoFechas?: RangoFechas;

  /** Callback cuando cambia el rango (modo range) */
  onRangoChange?: (rango: RangoFechas) => void;

  /** Posición vertical del botón flotante */
  position?: "default" | "elevated";
}

// ==========================================
// CONSTANTES
// ==========================================

const NOMBRES_MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DIAS_SEMANA = ["D", "L", "M", "M", "J", "V", "S"];

// ==========================================
// HELPERS
// ==========================================

function formatearFechaCorta(fecha: string | undefined): string {
  if (!fecha) return "...";
  const [, mes, dia] = fecha.split("-");
  return `${dia}/${mes}`;
}

function formatearRangoCorto(rango: RangoFechas): string | null {
  if (!rango.desde && !rango.hasta) return null;
  if (rango.desde && rango.hasta && rango.desde === rango.hasta) {
    return formatearFechaCorta(rango.desde);
  }
  return `${formatearFechaCorta(rango.desde)}→${formatearFechaCorta(
    rango.hasta
  )}`;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export function SelectorFechaFlotante({
  mode,
  allowModeSwitch = false,
  fechaSeleccionada,
  onFechaChange,
  rangoFechas = { desde: undefined, hasta: undefined },
  onRangoChange,
  position = "default",
}: SelectorFechaFlotanteProps) {
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mesActual, setMesActual] = useState(new Date());
  const [modoActivo, setModoActivo] = useState<ModoSeleccion>(mode);
  const [seleccionando, setSeleccionando] = useState<"desde" | "hasta">(
    "desde"
  );
  const { data: fechasDisponibles, isLoading } = useFechasConSintesis();
  const calendarRef = useRef<HTMLDivElement>(null);

  // Sincronizar modo cuando cambia la prop
  useEffect(() => {
    setModoActivo(mode);
  }, [mode]);

  // Cerrar calendario al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setMostrarCalendario(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calcular días del mes
  const getDiasDelMes = () => {
    const año = mesActual.getFullYear();
    const mes = mesActual.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaInicio = primerDia.getDay();

    const dias: {
      fecha: string;
      dia: number;
      disponible: boolean;
      esHoy: boolean;
      esSeleccionado: boolean;
      esFechaDesde: boolean;
      esFechaHasta: boolean;
      estaEnRango: boolean;
    }[] = [];

    // Días vacíos al inicio
    for (let i = 0; i < diaInicio; i++) {
      dias.push({
        fecha: "",
        dia: 0,
        disponible: false,
        esHoy: false,
        esSeleccionado: false,
        esFechaDesde: false,
        esFechaHasta: false,
        estaEnRango: false,
      });
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (let d = 1; d <= diasEnMes; d++) {
      const fechaStr = `${año}-${String(mes + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;
      const fechaDia = new Date(año, mes, d);
      const esHoy = fechaDia.getTime() === hoy.getTime();
      const disponible = fechasDisponibles?.includes(fechaStr) ?? false;

      // Para modo single
      const esSeleccionado =
        modoActivo === "single" && fechaSeleccionada === fechaStr;

      // Para modo range
      const esFechaDesde =
        modoActivo === "range" && rangoFechas.desde === fechaStr;
      const esFechaHasta =
        modoActivo === "range" && rangoFechas.hasta === fechaStr;
      const estaEnRango =
        modoActivo === "range" &&
        !!(
          rangoFechas.desde &&
          rangoFechas.hasta &&
          fechaStr >= rangoFechas.desde &&
          fechaStr <= rangoFechas.hasta
        );

      dias.push({
        fecha: fechaStr,
        dia: d,
        disponible,
        esHoy,
        esSeleccionado,
        esFechaDesde,
        esFechaHasta,
        estaEnRango,
      });
    }

    return dias;
  };

  const navegarMes = (delta: number) => {
    setMesActual(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
    );
  };

  const seleccionarFecha = (fecha: string) => {
    if (modoActivo === "single") {
      // En modo single, establecer el rango con desde=hasta para filtrar un solo día
      onRangoChange?.({ desde: fecha, hasta: fecha });
      onFechaChange?.(fecha);
      setMostrarCalendario(false);
    } else {
      // Modo range
      if (seleccionando === "desde") {
        if (rangoFechas.hasta && fecha > rangoFechas.hasta) {
          onRangoChange?.({ desde: fecha, hasta: undefined });
        } else {
          onRangoChange?.({ ...rangoFechas, desde: fecha });
        }
        setSeleccionando("hasta");
      } else {
        if (rangoFechas.desde && fecha < rangoFechas.desde) {
          onRangoChange?.({ desde: fecha, hasta: rangoFechas.desde });
        } else {
          onRangoChange?.({ ...rangoFechas, hasta: fecha });
        }
        setMostrarCalendario(false);
        setSeleccionando("desde");
      }
    }
  };

  const limpiarSeleccion = () => {
    if (modoActivo === "single") {
      onFechaChange?.(undefined);
    } else {
      onRangoChange?.({ desde: undefined, hasta: undefined });
      setSeleccionando("desde");
    }
    setMostrarCalendario(false);
  };

  const seleccionarSoloDia = () => {
    if (rangoFechas.desde && !rangoFechas.hasta) {
      onRangoChange?.({ desde: rangoFechas.desde, hasta: rangoFechas.desde });
      setMostrarCalendario(false);
      setSeleccionando("desde");
    }
  };

  const cambiarModo = (nuevoModo: ModoSeleccion) => {
    setModoActivo(nuevoModo);
    // Limpiar selección al cambiar de modo
    if (nuevoModo === "single") {
      onRangoChange?.({ desde: undefined, hasta: undefined });
    } else {
      onFechaChange?.(undefined);
    }
    setSeleccionando("desde");
  };

  // Determinar estado activo para estilo del botón
  const tieneSeleccion =
    modoActivo === "single"
      ? !!fechaSeleccionada
      : !!(rangoFechas.desde || rangoFechas.hasta);

  // Badge text
  const badgeText =
    modoActivo === "single"
      ? fechaSeleccionada
        ? formatearFechaCorta(fechaSeleccionada)
        : null
      : formatearRangoCorto(rangoFechas);

  // Posición CSS
  const positionClasses =
    position === "elevated"
      ? "fixed bottom-36 sm:bottom-20 right-4 z-40"
      : "fixed bottom-20 sm:bottom-6 right-4 z-40";

  return (
    <div className={positionClasses} ref={calendarRef}>
      {/* Botón flotante */}
      <button
        onClick={() => setMostrarCalendario(!mostrarCalendario)}
        className={`p-3 rounded-full shadow-lg transition-all active:scale-95 touch-manipulation ${
          tieneSeleccion
            ? "bg-primary text-primary-foreground"
            : "bg-background border text-foreground hover:bg-muted"
        }`}
        aria-label={
          modoActivo === "single"
            ? "Seleccionar fecha"
            : "Seleccionar rango de fechas"
        }
      >
        <Calendar className="h-5 w-5" />
      </button>

      {/* Badge con fecha/rango seleccionado */}
      {badgeText && (
        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap shadow-sm">
          {badgeText}
        </div>
      )}

      {/* Calendario emergente */}
      {mostrarCalendario && (
        <div className="absolute bottom-full right-0 mb-2 bg-background border rounded-xl shadow-xl p-4 min-w-[300px]">
          {/* Toggle de modo (solo si allowModeSwitch es true) */}
          {allowModeSwitch && (
            <div className="flex items-center justify-center gap-1 mb-3 p-1 bg-muted rounded-lg">
              <button
                onClick={() => cambiarModo("single")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  modoActivo === "single"
                    ? "bg-background shadow-sm font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CalendarDays className="h-4 w-4" />
                <span>Día</span>
              </button>
              <button
                onClick={() => cambiarModo("range")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  modoActivo === "range"
                    ? "bg-background shadow-sm font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CalendarRange className="h-4 w-4" />
                <span>Rango</span>
              </button>
            </div>
          )}

          {/* Indicador de selección de rango (solo en modo range) */}
          {modoActivo === "range" && (
            <div className="flex items-center justify-center gap-2 mb-3 text-sm">
              <span
                className={`px-2 py-1 rounded ${
                  seleccionando === "desde" ? "bg-primary/20 font-medium" : ""
                }`}
              >
                Desde: {formatearFechaCorta(rangoFechas.desde)}
              </span>
              <span className="text-muted-foreground">→</span>
              <span
                className={`px-2 py-1 rounded ${
                  seleccionando === "hasta" ? "bg-primary/20 font-medium" : ""
                }`}
              >
                Hasta: {formatearFechaCorta(rangoFechas.hasta)}
              </span>
            </div>
          )}

          {/* Header del calendario */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navegarMes(-1)}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="font-medium">
              {NOMBRES_MESES[mesActual.getMonth()]} {mesActual.getFullYear()}
            </span>
            <button
              onClick={() => navegarMes(1)}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DIAS_SEMANA.map((dia, i) => (
              <div
                key={i}
                className="text-center text-xs text-muted-foreground font-medium py-1"
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {getDiasDelMes().map((item, i) => (
                <button
                  key={i}
                  onClick={() =>
                    item.disponible && seleccionarFecha(item.fecha)
                  }
                  disabled={!item.disponible || item.dia === 0}
                  className={`
                    aspect-square flex items-center justify-center text-sm rounded-lg transition-colors
                    ${item.dia === 0 ? "invisible" : ""}
                    ${
                      item.disponible
                        ? "hover:bg-primary/10 cursor-pointer"
                        : "text-muted-foreground/30 cursor-not-allowed"
                    }
                    ${item.esHoy ? "ring-2 ring-primary ring-offset-1" : ""}
                    ${
                      item.esSeleccionado
                        ? "bg-primary text-primary-foreground"
                        : ""
                    }
                    ${
                      item.esFechaDesde || item.esFechaHasta
                        ? "bg-primary text-primary-foreground"
                        : ""
                    }
                    ${
                      item.estaEnRango &&
                      !item.esFechaDesde &&
                      !item.esFechaHasta
                        ? "bg-primary/30"
                        : ""
                    }
                  `}
                >
                  {item.dia > 0 ? item.dia : ""}
                </button>
              ))}
            </div>
          )}

          {/* Footer con acciones */}
          {tieneSeleccion && (
            <div className="mt-4 pt-3 border-t flex gap-2">
              {modoActivo === "range" &&
                rangoFechas.desde &&
                !rangoFechas.hasta && (
                  <button
                    onClick={seleccionarSoloDia}
                    className="flex-1 text-sm text-primary hover:text-primary/80 py-2 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    Solo este día
                  </button>
                )}
              <button
                onClick={limpiarSeleccion}
                className="flex-1 text-sm text-primary hover:text-primary/80 py-2 rounded-lg hover:bg-primary/10 transition-colors"
              >
                {modoActivo === "single" ? "Volver a hoy" : "Limpiar filtro"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
