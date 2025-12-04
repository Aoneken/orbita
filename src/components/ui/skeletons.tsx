import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton para la síntesis del día
export function SintesisSkeleton() {
  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-40" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Síntesis narrativa */}
        <div className="mb-4 p-4 bg-background rounded-lg border">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[88%]" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mb-4">
          <Skeleton className="h-3 w-32 mb-2" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>

        {/* Etiquetas */}
        <div className="mb-4">
          <Skeleton className="h-3 w-28 mb-2" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-18 rounded-full" />
          </div>
        </div>

        {/* Emisores */}
        <div className="mb-4">
          <Skeleton className="h-3 w-36 mb-2" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-6 w-40 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton para la lista de decretos
export function DecretosSkeleton({ cantidad = 5 }: { cantidad?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: cantidad }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 py-4 border-b px-3 -mx-3"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-full" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-5 rounded" />
        </div>
      ))}
    </div>
  );
}

// Skeleton para las cards del dashboard
export function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

// Skeleton para tarjeta de aviso en Feed
export function AvisoCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-2" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2 sm:pb-3 px-3 sm:px-6">
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-4 w-24 mb-3" />
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </CardContent>
      <div className="px-3 sm:px-6 pb-3 sm:pb-6 flex gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </Card>
  );
}

// Skeleton para gráficos de barras
export function BarChartSkeleton({ barras = 5 }: { barras?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: barras }).map((_, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton
            className="h-2 rounded-full"
            style={{ width: `${100 - i * 15}%` }}
          />
        </div>
      ))}
    </div>
  );
}

// Skeleton para el header de fecha
export function FechaHeaderSkeleton() {
  return (
    <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-5 w-48" />
    </div>
  );
}
