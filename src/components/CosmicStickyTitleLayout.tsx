import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const maxW = {
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  full: "max-w-none w-full",
} as const;

export type CosmicStickyTitleMaxWidth = keyof typeof maxW;

type CosmicStickyTitleLayoutProps = {
  title: ReactNode;
  children: ReactNode;
  /** Width constraint for the fixed header (title). */
  maxWidth?: CosmicStickyTitleMaxWidth;
  /** Width constraint for the scrollable body; defaults to `maxWidth`. */
  contentMaxWidth?: CosmicStickyTitleMaxWidth;
  /** Rendered under the title inside the fixed header (e.g. Galaxy tagline). */
  headerExtra?: ReactNode;
  /** Extra classes on the scrollable `<main>`. */
  mainClassName?: string;
  /** Merged onto the inner wrapper around `children` (padding / spacing below the title). */
  contentInnerClassName?: string;
  /**
   * When true, the block is at least one viewport tall and grows with content; use inside a
   * parent vertical scroll (e.g. stacked “journey” on About) instead of locking to `100dvh`.
   */
  documentSection?: boolean;
};

/**
 * Locks the page title (and optional header row) while the rest of the page scrolls.
 * Keeps long content from sliding under the fixed top nav.
 */
export function CosmicStickyTitleLayout({
  title,
  children,
  maxWidth = "6xl",
  contentMaxWidth,
  headerExtra,
  mainClassName,
  contentInnerClassName,
  documentSection = false,
}: CosmicStickyTitleLayoutProps) {
  const headerMw = maxW[maxWidth];
  const bodyMw = maxW[contentMaxWidth ?? maxWidth];

  return (
    <div
      className={cn(
        "flex flex-col",
        documentSection
          ? "min-h-[100dvh]"
          : "h-[100dvh] max-h-[100dvh] overflow-hidden"
      )}
    >
      <header className="relative z-20 shrink-0 border-b border-border/30 bg-background/50 backdrop-blur-md">
        <div
          className={cn(
            "mx-auto pb-3 md:pb-4",
            /*
             * Phone: symmetric inset clears fixed menu (`left-6` + `h-11` + gap) on both sides
             * so the title stays visually centered and does not sit under the menu control.
             */
            "px-[calc(1.5rem+2.75rem+0.75rem)] md:px-6",
            /* Phone: same vertical band as fixed menu (`top-6` + `h-11` in CosmicSiteNav). */
            "pt-6 md:pt-28",
            headerMw
          )}
        >
          <div className="flex min-h-11 items-center justify-center md:block md:min-h-0">
            {title}
          </div>
          {headerExtra ? <div className="mt-2 md:mt-2.5">{headerExtra}</div> : null}
        </div>
      </header>
      <main
        className={cn(
          "relative z-10 min-h-0 flex-1",
          documentSection
            ? "flex flex-col overflow-visible"
            : "overflow-y-auto overscroll-y-contain",
          mainClassName
        )}
      >
        <div
          className={cn("mx-auto px-6 pb-16 pt-4 md:pb-20 md:pt-6", bodyMw, contentInnerClassName)}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
