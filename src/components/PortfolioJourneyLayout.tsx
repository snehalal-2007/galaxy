import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { CosmicPageShell } from "@/components/CosmicPageShell";
import { AboutJourneySection } from "@/pages/About";
import Certifications from "@/pages/Certifications";
import Education from "@/pages/Education";
import Galaxy from "@/pages/Galaxy";
import MissionLog from "@/pages/MissionLog";
import Skills from "@/pages/Skills";

const SCROLL_NAV_SUPPRESS_MS = 420;

/** Routes that share one vertical scroll stack; pathname drives nav highlight. */
export const JOURNEY_PATHS = ["/about", "/education", "/skills", "/mission-log", "/certifications", "/galaxy"] as const;

function pathToSectionIndex(pathname: string): number {
  const i = JOURNEY_PATHS.indexOf(pathname as (typeof JOURNEY_PATHS)[number]);
  return i >= 0 ? i : 0;
}

/**
 * One scroll column for About → Skills → Mission log → Galaxy.
 * Scrolling updates the URL with `replace` so `NavLink` active states follow the viewport.
 * Visiting `/skills` (etc.) scrolls that band into view.
 */
export function PortfolioJourneyLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([null, null, null, null, null, null]);
  const offsetsRef = useRef<number[]>([0, 0, 0, 0, 0, 0]);
  const ignoreScrollNavUntil = useRef(0);
  /** When true, pathname change came from scroll → URL sync; do not reset `scrollTop`. */
  const pathnameFromScroll = useRef(false);
  /** Fade the journey content in when arriving (e.g. after the moon-launch from `/`). */
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduce) {
      setEntered(true);
      return;
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const measureOffsets = useCallback(() => {
    const root = scrollRef.current;
    if (!root) return;
    offsetsRef.current = sectionRefs.current.map((el) => (el ? el.offsetTop : 0));
  }, []);

  useLayoutEffect(() => {
    measureOffsets();
  }, [measureOffsets, pathname]);

  useLayoutEffect(() => {
    if (pathnameFromScroll.current) {
      pathnameFromScroll.current = false;
      return;
    }
    const root = scrollRef.current;
    const idx = pathToSectionIndex(pathname);
    const section = sectionRefs.current[idx];
    if (!root || !section) return;
    ignoreScrollNavUntil.current = performance.now() + SCROLL_NAV_SUPPRESS_MS;
    root.scrollTop = section.offsetTop;
  }, [pathname]);

  useLayoutEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const ro = new ResizeObserver(() => measureOffsets());
    ro.observe(root);
    sectionRefs.current.forEach((el) => {
      if (el) ro.observe(el);
    });
    return () => ro.disconnect();
  }, [measureOffsets]);

  const onScroll = () => {
    if (performance.now() < ignoreScrollNavUntil.current) return;
    const root = scrollRef.current;
    if (!root) return;
    measureOffsets();
    const offsets = offsetsRef.current;
    const probe = root.scrollTop + root.clientHeight * 0.3;
    let idx = offsets.length - 1;
    for (let i = 0; i < offsets.length; i++) {
      const start = offsets[i] ?? 0;
      const end = i + 1 < offsets.length ? offsets[i + 1]! : Number.POSITIVE_INFINITY;
      if (probe >= start && probe < end) {
        idx = i;
        break;
      }
    }
    const nextPath = JOURNEY_PATHS[idx];
    if (nextPath && pathname !== nextPath) {
      pathnameFromScroll.current = true;
      navigate(nextPath, { replace: true });
    }
  };

  const setSectionRef = (index: number) => (el: HTMLElement | null) => {
    sectionRefs.current[index] = el;
  };

  return (
    <CosmicPageShell>
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="relative h-[100dvh] overflow-x-hidden overflow-y-auto overscroll-y-contain"
        style={{
          opacity: entered ? 1 : 0,
          transition: "opacity 600ms ease-out",
        }}
        aria-label="Portfolio: scroll through About, Education, Skills, Experience, Certifications, and Galaxy"
      >
        <section
          ref={setSectionRef(0)}
          id="about"
          className="relative min-h-[100dvh]"
          aria-labelledby="about-heading"
        >
          <AboutJourneySection />
        </section>

        <section
          ref={setSectionRef(1)}
          id="education"
          className="relative min-h-[100dvh]"
          aria-label="Education"
        >
          <Education embed />
        </section>

        <section ref={setSectionRef(2)} id="skills" className="relative min-h-[100dvh]" aria-label="Skills">
          <Skills embed />
        </section>

        <section
          ref={setSectionRef(3)}
          id="mission-log"
          className="relative min-h-[100dvh]"
          aria-label="Mission log"
        >
          <MissionLog embed />
        </section>

        <section
          ref={setSectionRef(4)}
          id="certifications"
          className="relative min-h-[100dvh]"
          aria-label="Certifications"
        >
          <Certifications embed />
        </section>

        <section ref={setSectionRef(5)} id="galaxy" className="relative min-h-[100dvh]" aria-label="Galaxy">
          <Galaxy embed />
        </section>
      </div>
      <Outlet />
    </CosmicPageShell>
  );
}
