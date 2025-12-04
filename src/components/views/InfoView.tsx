// ==========================================
// VISTA INFO - Acerca de Órbita
// Estilo unificado con el resto de la SPA
// ==========================================

import {
  AlertTriangle,
  Code2,
  Database,
  ExternalLink,
  Github,
  Info,
  Mail,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";

import { BotonIrArriba, ViewHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================

// Chip de tecnología con icono y color
function TechChip({
  icon: Icon,
  label,
  colorClass,
}: {
  icon: React.ElementType;
  label: string;
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-muted/50 hover:bg-muted/80 rounded-xl transition-colors">
      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${colorClass}`} />
      <span className="text-sm sm:text-base font-medium">{label}</span>
    </div>
  );
}

// Link externo estilizado
function ExternalLinkButton({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-xl transition-colors touch-manipulation active:scale-95"
    >
      <Icon className="h-4 w-4" />
      {children}
    </a>
  );
}

// ==========================================
// VISTA PRINCIPAL
// ==========================================

export function InfoView() {
  const versionBadge = (
    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
      <Zap className="h-4 w-4" />
      <span className="font-medium text-sm sm:text-base">v1.0</span>
    </div>
  );

  const logoElement = (
    <picture>
      <source srcSet="/logo-info.webp" type="image/webp" />
      <img
        src="/logo-info.png"
        alt="Logo Órbita"
        className="h-20 sm:h-24 w-auto drop-shadow-sm"
      />
    </picture>
  );

  return (
    <>
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-4 sm:pb-6">
        <ViewHeader
          title="Órbita"
          description="Boletín Oficial Simplificado"
          icon={logoElement}
          badge={versionBadge}
          className="mb-6 sm:mb-8"
        />

        {/* ¿Qué es Órbita? */}
        <Card className="mb-4 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">¿Qué es Órbita?</CardTitle>
                <CardDescription>
                  Tu acceso simplificado al Boletín Oficial
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm sm:text-base">
            <p>
              <strong className="text-foreground">Órbita</strong> es una
              herramienta que simplifica el acceso al Boletín Oficial de la
              República Argentina (BORA), transformando el lenguaje legal
              complejo en resúmenes claros y fáciles de entender.
            </p>
            <p className="text-muted-foreground">
              Cada día procesamos automáticamente las publicaciones oficiales y
              generamos síntesis utilizando inteligencia artificial, para que
              puedas mantenerte informado sin necesidad de leer documentos
              extensos.
            </p>
          </CardContent>
        </Card>

        {/* Tecnología */}
        <Card className="mb-4 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Tecnología</CardTitle>
                <CardDescription>
                  Stack moderno para una experiencia fluida
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <TechChip
                icon={Sparkles}
                label="React 19"
                colorClass="text-blue-500 dark:text-blue-400"
              />
              <TechChip
                icon={Code2}
                label="TypeScript"
                colorClass="text-yellow-500 dark:text-yellow-400"
              />
              <TechChip
                icon={Database}
                label="Supabase"
                colorClass="text-green-500 dark:text-green-400"
              />
              <TechChip
                icon={Sparkles}
                label="IA Generativa"
                colorClass="text-purple-500 dark:text-purple-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Fuente de datos */}
        <Card className="mb-4 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Fuente de Datos</CardTitle>
                <CardDescription>
                  Información oficial verificada
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm sm:text-base">
              Todos los datos provienen del{" "}
              <a
                href="https://www.boletinoficial.gob.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
              >
                Boletín Oficial de la República Argentina
                <ExternalLink className="h-3 w-3" />
              </a>
              , la fuente oficial de publicación de normas y actos
              administrativos del Estado Nacional.
            </p>
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-xl">
              <AlertTriangle className="h-4 w-4 text-yellow-500 dark:text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Las síntesis y descripciones son generadas por IA y pueden
                contener errores. Siempre consultá el documento original para
                información precisa.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Créditos - Firma profesional */}
        <Card className="mb-4 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6 pb-6">
            {/* Layout principal: Avatar + Info en línea */}
            <div className="flex items-center gap-4">
              {/* Avatar estilizado */}
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/30 flex items-center justify-center shadow-md shrink-0">
                <span className="text-2xl font-bold text-primary">A</span>
              </div>

              {/* Información con jerarquía */}
              <div className="flex flex-col gap-1.5">
                {/* Nivel 1: Principal */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">
                    Desarrollado por
                  </span>
                  <span className="font-semibold text-lg">Aoneken</span>
                </div>

                {/* Nivel 2: Badge */}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Github className="h-3 w-3 mr-1" />
                    Open Source
                  </Badge>
                </div>

                {/* Nivel 3: Detalle/Caption */}
                <p className="text-xs text-muted-foreground italic">
                  Con ❤️ y mucho mate 🧉
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links y Contacto */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <ExternalLinkButton
            href="https://github.com/Aoneken/orbita"
            icon={Github}
          >
            Ver en GitHub
          </ExternalLinkButton>
          <ExternalLinkButton href="mailto:comercial@aoneken.com" icon={Mail}>
            Contacto
          </ExternalLinkButton>
          <ExternalLinkButton href="https://t.me/orbita_aok" icon={Send}>
            Canal Telegram
          </ExternalLinkButton>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pb-4 space-y-1">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Órbita · Datos procesados con IA
          </p>
          <p className="text-xs text-muted-foreground">
            Este proyecto no está afiliado al Gobierno de Argentina.
          </p>
        </div>
      </div>

      {/* Botón flotante - consistente con otras vistas */}
      <BotonIrArriba />
    </>
  );
}
