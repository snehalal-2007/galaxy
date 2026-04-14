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
}: CosmicStickyTitleLayoutProps) {
  const headerMw = maxW[maxWidth];
  const bodyMw = maxW[contentMaxWidth ?? maxWidth];

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
      <header className="relative z-20 shrink-0 border-b border-border/30 bg-background/50 backdrop-blur-md">
        <div className={cn("mx-auto px-6 pt-24 md:pt-28 pb-3 md:pb-4", headerMw)}>
          {title}
          {headerExtra ? <div className="mt-2 md:mt-2.5">{headerExtra}</div> : null}
        </div>
      </header>
      <main
        className={cn(
          "relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-y-contain",
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
