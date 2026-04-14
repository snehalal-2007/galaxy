import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Starfield from "@/components/Starfield";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import profilePhoto from "@/data/profile.png";
import profileDescription from "@/data/profile-description.json";

/** Bio text: edit `src/data/profile-description.json` — use `\\n\\n` between paragraphs. */
const ABOUT_TYPEWRITER_TEXT = profileDescription.body as string;

/** Milliseconds per character at 1× (higher = slower). */
const BASE_MS_PER_CHAR = 54;

const SPEED_STEPS = [
  { label: "1×", mult: 1 },
  { label: "1.5×", mult: 1.5 },
  { label: "2×", mult: 2 },
] as const;

function TypewriterBio({
  text,
  speedMultiplier,
}: {
  text: string;
  speedMultiplier: number;
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [complete, setComplete] = useState(false);
  const countRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    countRef.current = 0;
    setVisibleCount(0);
    setComplete(false);
  }, [text]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (text.length === 0) {
      setComplete(true);
      return;
    }

    if (countRef.current >= text.length) {
      setVisibleCount(text.length);
      setComplete(true);
      return;
    }

    const ms = Math.max(10, BASE_MS_PER_CHAR / speedMultiplier);

    const step = () => {
      if (countRef.current >= text.length) {
        setComplete(true);
        timeoutRef.current = null;
        return;
      }
      countRef.current += 1;
      setVisibleCount(countRef.current);
      if (countRef.current >= text.length) {
        setComplete(true);
        timeoutRef.current = null;
        return;
      }
      timeoutRef.current = window.setTimeout(step, ms);
    };

    timeoutRef.current = window.setTimeout(step, ms);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, speedMultiplier]);

  const shown = text.slice(0, visibleCount);

  return (
    <div
      className="text-muted-foreground text-sm leading-relaxed md:text-base whitespace-pre-line pr-16 pb-10"
      aria-busy={!complete}
    >
      {shown}
      {!complete && <span className="typewriter-caret" aria-hidden="true">|</span>}
    </div>
  );
}

const About = () => {
  const [speedIndex, setSpeedIndex] = useState(0);
  const speed = SPEED_STEPS[speedIndex];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <Starfield />

      <div className="fixed top-6 left-6 z-30 flex flex-wrap gap-2">
        <Link to="/">
          <Button variant="cosmic" size="sm">
            <ArrowLeft className="mr-1 h-3 w-3" /> Home
          </Button>
        </Link>
        <Link to="/galaxy">
          <Button variant="cosmic" size="sm">
            Galaxy
          </Button>
        </Link>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 pb-16 pt-24 md:pt-28 md:pb-24">
        <h1
          className="text-foreground font-bold uppercase text-glow text-center mb-10 md:mb-14"
          style={{ letterSpacing: "0.25em", fontSize: "clamp(0.85rem, 2.8vw, 1.35rem)" }}
        >
          ABOUT THE SELENOPHILE
        </h1>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 md:items-stretch">
          {/* Left: square box + photo */}
          <div className="mx-auto w-full max-w-sm md:mx-0 md:max-w-none">
            <div
              className="aspect-square w-full overflow-hidden rounded-lg border border-border bg-card/40"
              style={{
                boxShadow:
                  "0 0 40px rgba(100,130,200,0.08), inset 0 0 0 1px rgba(255,255,255,0.04)",
              }}
            >
              <img
                src={profilePhoto}
                alt="Portrait"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right: description rectangle */}
          <div className="relative flex min-h-[min(100%,22rem)] flex-1 rounded-lg border border-border bg-card/50 p-6 backdrop-blur-sm md:min-h-[min(70vh,28rem)] md:p-8">
            <TypewriterBio text={ABOUT_TYPEWRITER_TEXT} speedMultiplier={speed.mult} />
            <button
              type="button"
              onClick={() => setSpeedIndex((i) => (i + 1) % SPEED_STEPS.length)}
              className="absolute bottom-4 right-4 border border-foreground/25 bg-background/70 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-foreground backdrop-blur-sm transition hover:border-foreground/45 hover:bg-background/90"
              aria-label={`Typing speed ${speed.label}. Click to cycle speed.`}
            >
              {speed.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
