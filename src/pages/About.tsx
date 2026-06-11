import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Github, Linkedin, Mail } from "lucide-react";
import { CosmicStickyTitleLayout } from "@/components/CosmicStickyTitleLayout";
import profilePhoto from "@/data/profile.png";
import profileDescription from "@/data/profile-description.json";

/** `profile-description.json` — bio in `body`, links in `social`. */
type ProfileSocial = {
  /** Full URL to your GitHub profile */
  github?: string;
  /** Full URL to your LinkedIn profile; omit or use "" to hide the LinkedIn button */
  linkedin?: string;
  /** Address copied to clipboard when visitors click the mail icon */
  email?: string;
};

type ProfileDescription = {
  body: string;
  social?: ProfileSocial;
};

const PROFILE = profileDescription as ProfileDescription;

/** Bio text: edit `src/data/profile-description.json` — use `\\n\\n` between paragraphs. */
const ABOUT_TYPEWRITER_TEXT = PROFILE.body;

const DEFAULT_GITHUB = "https://github.com/snehalal-2007";

function AboutSocialRow() {
  const s = PROFILE.social;
  const githubHref = (s?.github?.trim() || DEFAULT_GITHUB) as string;
  const linkedinHref = s?.linkedin?.trim();
  const email = s?.email?.trim();

  const copyEmail = async () => {
    if (!email) {
      toast.error("Add social.email in profile-description.json");
      return;
    }
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email copied to clipboard");
    } catch {
      toast.error("Could not copy email");
    }
  };

  const iconBtn =
    "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-card/50 text-foreground transition hover:border-foreground/40 hover:bg-card/70 hover:text-foreground";

  return (
    <div className="mt-0 flex flex-wrap items-center justify-center gap-3 border-t border-border/40 pt-3 md:col-span-2 md:justify-start md:gap-4 md:pt-4">
      <a
        href={githubHref}
        target="_blank"
        rel="noopener noreferrer"
        className={iconBtn}
        aria-label="GitHub profile"
      >
        <Github className="h-5 w-5" strokeWidth={1.75} />
      </a>
      {linkedinHref && (
        <a
          href={linkedinHref}
          target="_blank"
          rel="noopener noreferrer"
          className={iconBtn}
          aria-label="LinkedIn profile"
        >
          <Linkedin className="h-5 w-5" strokeWidth={1.75} />
        </a>
      )}
      <button type="button" onClick={copyEmail} className={iconBtn} aria-label="Copy email address">
        <Mail className="h-5 w-5" strokeWidth={1.75} />
      </button>
    </div>
  );
}

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
      className="grid text-muted-foreground text-sm leading-relaxed md:text-base pr-16 pb-10"
      aria-busy={!complete}
    >
      {/* Invisible full-text spacer reserves the final height so the box never grows/reflows while typing. */}
      <span className="invisible whitespace-pre-line [grid-area:1/1]" aria-hidden="true">
        {text}
      </span>
      <div className="whitespace-pre-line [grid-area:1/1]">
        {shown}
        {!complete && <span className="typewriter-caret" aria-hidden="true">|</span>}
      </div>
    </div>
  );
}

/** About band inside `PortfolioJourneyLayout` (not a standalone route). */
export function AboutJourneySection() {
  const [speedIndex, setSpeedIndex] = useState(0);
  const speed = SPEED_STEPS[speedIndex];

  return (
    <CosmicStickyTitleLayout
      documentSection
      maxWidth="5xl"
      contentInnerClassName="pt-6 md:pt-10"
      title={
        <h1
          id="about-heading"
          className="cosmic-page-title text-center font-bold uppercase text-foreground text-glow text-balance leading-snug max-md:!tracking-[0.22em]"
        >
          ABOUT THE SELENOPHILE
        </h1>
      }
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-x-12 md:gap-y-4 md:items-stretch">
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
              className="h-full w-full scale-205 object-cover object-center"
              loading="lazy"
            />
          </div>
        </div>

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

        <AboutSocialRow />
      </div>
    </CosmicStickyTitleLayout>
  );
}
