import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import type { Certification } from "@/data/certifications";
import { cn } from "@/lib/utils";

/**
 * Certifications gallery with two layouts that share state:
 *  - Desktop (md+): a sliding scroll-snap carousel with neighbor peeks.
 *  - Phone (< md): a single, deterministically-centered card (no peeks), since
 *    the scroll-snap track tends to drift on small viewports.
 * Both support arrows, dots, the X/N counter, arrow keys, swipe, and click-to-verify.
 */
export function CertificationCarousel({ items }: { items: Certification[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const dragStartX = useRef<number | null>(null);
  const didDrag = useRef(false);
  // Open on the 3rd card (or the last, if fewer) so neighbors peek on both sides — looks balanced.
  const [active, setActive] = useState(() => Math.min(2, items.length - 1));
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia?.("(min-width: 768px)").matches ?? false
  );

  useEffect(() => {
    setReduceMotion(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const count = items.length;
  const clampIndex = (i: number) => Math.max(0, Math.min(count - 1, i));
  const atStart = active === 0;
  const atEnd = active === count - 1;

  // --- Desktop: scroll-snap track ---
  const measureActive = () => {
    const root = scrollerRef.current;
    if (!root) return;
    const center = root.scrollLeft + root.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActive(best);
  };

  const onScroll = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(measureActive);
  };

  const slideTo = (i: number) => {
    cardRefs.current[i]?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  // Re-center the active card when switching into the desktop layout.
  useEffect(() => {
    if (!isDesktop) return;
    cardRefs.current[active]?.scrollIntoView({ behavior: "auto", inline: "center", block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop]);

  /** Navigate: desktop slides the track, phone just sets the index. */
  const select = (i: number) => {
    const next = clampIndex(i);
    if (isDesktop) slideTo(next);
    else setActive(next);
  };
  const goPrev = () => select(active - 1);
  const goNext = () => select(active + 1);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    }
  };

  const openVerify = (cert: Certification) => {
    const url = cert.verifyUrl?.trim();
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  // --- Phone: swipe handling ---
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragStartX.current = e.clientX;
    didDrag.current = false;
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    if (Math.abs(e.clientX - dragStartX.current) > 8) didDrag.current = true;
  };
  const onPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (dx <= -50) goNext();
    else if (dx >= 50) goPrev();
  };

  const cardShell = "overflow-hidden rounded-xl border bg-card/60 backdrop-blur-sm";
  const imageWrap = "aspect-[5/4] w-full overflow-hidden bg-white/[0.04] p-4 md:p-5";
  // Desktop leaves room for peeks; phone has no peeks, so the card can be larger.
  const desktopCardVar = { "--cardw": "clamp(180px, 56vw, 440px)" } as CSSProperties;
  const mobileCardVar = { "--cardw": "clamp(220px, 70vw, 460px)" } as CSSProperties;

  const CardFace = ({ cert, isActive }: { cert: Certification; isActive: boolean }) => {
    const verifyUrl = cert.verifyUrl?.trim();
    return (
      <>
        <div className={imageWrap}>
          {cert.image ? (
            <img
              src={cert.image}
              alt={`${cert.title} — ${cert.issuer} certificate`}
              className="h-full w-full object-contain"
              draggable={false}
              loading="lazy"
            />
          ) : null}
        </div>
        <div className="space-y-0.5 p-3 md:p-4">
          <p className="truncate text-sm font-bold uppercase tracking-[0.1em] text-foreground">
            {cert.title}
          </p>
          <p className="truncate text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground">
            {cert.issuer} · {cert.year}
          </p>
          {isActive && verifyUrl ? (
            <a
              href={verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 inline-flex items-center gap-1 text-[0.65rem] font-medium uppercase tracking-[0.15em] text-foreground/75 underline-offset-4 transition hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Verify credential
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </div>
      </>
    );
  };

  const arrowBtn =
    "absolute top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-foreground backdrop-blur-sm transition hover:border-foreground/45 hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-20";

  const current = items[active];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-full">
        {isDesktop ? (
          /* Desktop: sliding scroll-snap carousel with peeks */
          <div
            ref={scrollerRef}
            onScroll={onScroll}
            onKeyDown={onKeyDown}
            tabIndex={0}
            role="group"
            aria-roledescription="carousel"
            aria-label="Certifications gallery"
            className={cn(
              "relative flex w-full snap-x snap-mandatory items-center gap-4 overflow-x-auto overflow-y-hidden py-8",
              "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              !reduceMotion && "scroll-smooth"
            )}
            style={{
              ...desktopCardVar,
              paddingInline: "max(1rem, calc(50% - var(--cardw) / 2))",
              overscrollBehaviorX: "contain",
            }}
          >
            {items.map((c, i) => {
              const isActive = i === active;
              const clickable = !isActive || !!c.verifyUrl?.trim();
              return (
                <article
                  key={c.id}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  onClick={() => (isActive ? openVerify(c) : select(i))}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "relative shrink-0 snap-center select-none",
                    cardShell,
                    isActive ? "border-foreground/40" : "border-border/50",
                    clickable ? "cursor-pointer" : "cursor-default"
                  )}
                  style={{
                    width: "var(--cardw)",
                    transform: isActive ? "scale(1)" : "scale(0.88)",
                    opacity: isActive ? 1 : 0.45,
                    boxShadow: isActive
                      ? "0 0 38px rgba(120,150,220,0.18), inset 0 0 0 1px rgba(255,255,255,0.05)"
                      : "none",
                    transition: reduceMotion
                      ? "none"
                      : "transform 400ms ease, opacity 400ms ease, border-color 300ms ease",
                  }}
                >
                  <CardFace cert={c} isActive={isActive} />
                </article>
              );
            })}
          </div>
        ) : (
          /* Phone: single centered card, no peeks */
          <div
            className="relative flex w-full justify-center overflow-hidden py-8 focus-visible:outline-none"
            style={{ ...mobileCardVar, touchAction: "pan-y", overscrollBehaviorX: "contain" }}
            role="group"
            aria-roledescription="carousel"
            aria-label="Certifications gallery"
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
          >
            <article
              key={current.id}
              onClick={() => {
                if (!didDrag.current) openVerify(current);
              }}
              aria-current="true"
              className={cn(
                "relative z-10 shrink-0 select-none border-foreground/40",
                cardShell,
                current.verifyUrl?.trim() ? "cursor-pointer" : "cursor-default"
              )}
              style={{
                width: "var(--cardw)",
                boxShadow: "0 0 38px rgba(120,150,220,0.18), inset 0 0 0 1px rgba(255,255,255,0.05)",
                animation: reduceMotion ? undefined : "cert-fade-in 360ms ease",
              }}
            >
              <CardFace cert={current} isActive />
            </article>
          </div>
        )}

        {isDesktop ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              disabled={atStart}
              aria-label="Previous certificate"
              className={cn(arrowBtn, "-left-2 md:-left-4 xl:-left-12")}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={atEnd}
              aria-label="Next certificate"
              className={cn(arrowBtn, "-right-2 md:-right-4 xl:-right-12")}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Choose certificate">
          {items.map((c, i) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Certificate ${i + 1}: ${c.title}`}
              onClick={() => select(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                i === active ? "w-5 bg-foreground" : "w-1.5 bg-foreground/30 hover:bg-foreground/55"
              )}
            />
          ))}
        </div>
        <span className="text-xs tabular-nums tracking-[0.2em] text-muted-foreground">
          {active + 1} / {count}
        </span>
      </div>
    </div>
  );
}
