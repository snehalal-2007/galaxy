import type { ReactNode } from "react";
import { CosmicSiteNav } from "@/components/CosmicSiteNav";
import { cn } from "@/lib/utils";

type CosmicPageShellProps = {
  children: ReactNode;
  /** Merged onto the outer wrapper (e.g. `flex flex-col items-center justify-center` for the moon page). */
  className?: string;
  /**
   * Moon home (`/`) uses no top nav. All other inner pages should use the default `true`.
   * Do not mount `<Starfield />` here — the app keeps one persistent background in `App.tsx`.
   */
  showNav?: boolean;
};

/**
 * Standard page wrapper: stacks above the global starfield (`z-10`), full height, optional nav.
 * Use this for every new route except rare full-screen custom layouts.
 */
export function CosmicPageShell({
  children,
  className,
  showNav = true,
}: CosmicPageShellProps) {
  return (
    <div className={cn("relative z-10 min-h-screen overflow-hidden", className)}>
      {showNav ? <CosmicSiteNav /> : null}
      {children}
    </div>
  );
}
