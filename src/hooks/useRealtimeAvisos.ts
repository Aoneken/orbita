import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { setNewContentBadge } from "@/utils/notifications";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Estado de conexión del canal realtime
 */
export type RealtimeStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

/**
 * Opciones de configuración del hook
 */
interface UseRealtimeAvisosOptions {
  /** Callback opcional cuando se recibe un nuevo aviso */
  onNewAviso?: (payload: unknown) => void;
  /** Mostrar toast de notificación (default: true) */
  showToast?: boolean;
  /** Habilitar la suscripción (default: true) */
  enabled?: boolean;
}

/**
 * Hook para suscribirse a cambios en tiempo real de la tabla avisos_bora
 *
 * Funcionalidades:
 * - Escucha eventos INSERT en la tabla avisos_bora
 * - Invalida automáticamente las queries de avisos para refrescar la UI
 * - Activa el badge PWA cuando hay nuevos avisos
 * - Proporciona estado de conexión para indicador visual
 */
export function useRealtimeAvisos(options: UseRealtimeAvisosOptions = {}) {
  const { onNewAviso, enabled = true } = options;

  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RealtimeStatus>("disconnected");
  const [newAvisosCount, setNewAvisosCount] = useState(0);
  const [lastEventTime, setLastEventTime] = useState<Date | null>(null);

  /**
   * Resetea el contador de nuevos avisos
   * Debe llamarse cuando el usuario interactúa con el feed
   */
  const clearNewAvisosCount = useCallback(() => {
    setNewAvisosCount(0);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setStatus("disconnected");
      return;
    }

    let channel: RealtimeChannel | null = null;

    const setupSubscription = async () => {
      try {
        setStatus("connecting");

        channel = supabase
          .channel("avisos-realtime")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "avisos_bora",
            },
            async (payload) => {
              console.debug("[Realtime] Nuevo aviso detectado:", payload.new);

              // 1. Invalidar queries para refrescar la lista
              await queryClient.invalidateQueries({ queryKey: ["avisos"] });
              await queryClient.invalidateQueries({
                queryKey: ["sintesis-telegram"],
              });
              await queryClient.invalidateQueries({
                queryKey: ["conteo-subrubros"],
              });
              await queryClient.invalidateQueries({
                queryKey: ["conteo-etiquetas"],
              });
              await queryClient.invalidateQueries({
                queryKey: ["top-emisores"],
              });
              await queryClient.invalidateQueries({
                queryKey: ["avisos-por-fecha"],
              });
              await queryClient.invalidateQueries({
                queryKey: ["estadisticas"],
              });

              // 2. Activar badge PWA
              await setNewContentBadge();

              // 3. Actualizar estado interno
              setNewAvisosCount((prev) => prev + 1);
              setLastEventTime(new Date());

              // 4. Callback opcional
              if (onNewAviso) {
                onNewAviso(payload.new);
              }
            }
          )
          .subscribe((status) => {
            console.debug("[Realtime] Estado del canal:", status);

            if (status === "SUBSCRIBED") {
              setStatus("connected");
            } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
              setStatus("error");
            } else if (status === "TIMED_OUT") {
              setStatus("disconnected");
            }
          });
      } catch (error) {
        console.error("[Realtime] Error al configurar suscripción:", error);
        setStatus("error");
      }
    };

    setupSubscription();

    // Cleanup: desuscribirse al desmontar
    return () => {
      if (channel) {
        console.debug("[Realtime] Desuscribiendo del canal...");
        supabase.removeChannel(channel);
      }
    };
  }, [enabled, queryClient, onNewAviso]);

  return {
    /** Estado actual de la conexión realtime */
    status,
    /** Cantidad de nuevos avisos desde la última interacción */
    newAvisosCount,
    /** Timestamp del último evento recibido */
    lastEventTime,
    /** Función para resetear el contador de nuevos avisos */
    clearNewAvisosCount,
    /** Indica si está conectado y escuchando */
    isConnected: status === "connected",
    /** Indica si hubo un error de conexión */
    hasError: status === "error",
  };
}
