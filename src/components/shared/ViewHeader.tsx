import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface ViewHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  align?: "center" | "left";
  className?: string;
}

export function ViewHeader({
  title,
  description,
  icon,
  badge,
  align = "center",
  className,
}: ViewHeaderProps) {
  const isLeftAligned = align === "left";
  const alignmentClasses = isLeftAligned
    ? "items-start text-left"
    : "items-center text-center";
  const badgeAlignment = isLeftAligned ? "justify-start" : "justify-center";

  return (
    <section
      className={cn(
        "w-full space-y-2 text-foreground select-none",
        "pt-2 sm:pt-4 pb-2",
        className
      )}
    >
      <div className={cn("flex flex-col gap-1", alignmentClasses)}>
        {icon && (
          <div
            className={cn(
              "flex items-center gap-2 text-primary",
              isLeftAligned ? "justify-start" : "justify-center"
            )}
          >
            {icon}
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {title}
        </h1>

        {description && (
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl">
            {description}
          </p>
        )}
      </div>

      {badge && <div className={cn("flex", badgeAlignment)}>{badge}</div>}
    </section>
  );
}
