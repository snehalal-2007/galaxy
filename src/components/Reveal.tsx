import {
  createElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

type RevealProps = {
  children: ReactNode;
  /** Element to render (e.g. "section", "li"); defaults to a div. */
  as?: ElementType;
  className?: string;
  /** Stagger delay in ms before this item animates in. */
  delay?: number;
  /** Upward travel distance in px while hidden; pass 0 for a fade-only reveal. */
  y?: number;
  /** Extra inline styles (merged underneath the reveal transform). */
  style?: CSSProperties;
  /** Any other props (e.g. aria-*, id) are forwarded to the rendered element. */
  [key: string]: unknown;
};

/**
 * Fades + slides its children up the first time they scroll into view.
 * Dependency-free (IntersectionObserver). Honors `prefers-reduced-motion`
 * by showing content immediately with no transition.
 */
export function Reveal({
  children,
  as = "div",
  className,
  delay = 0,
  y = 24,
  style,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const revealStyle: CSSProperties = {
    ...style,
    opacity: shown ? 1 : 0,
    transform: shown ? "none" : `translateY(${y}px)`,
    transition: "opacity 600ms ease-out, transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
    transitionDelay: `${delay}ms`,
    willChange: "opacity, transform",
  };

  return createElement(as, { ...rest, ref, className, style: revealStyle }, children);
}
