import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { CosmicPageShell } from "@/components/CosmicPageShell";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, ChevronLeft, ChevronRight, X } from "lucide-react";
import portfolioData from "@/data/projects.json";

/** Per-skill row with a small visual */
export interface ProjectSkill {
  name: string;
  imageUrl: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  skills: ProjectSkill[];
  liveUrl: string;
  githubUrl: string;
  /** Normalized position 0–1 inside the map */
  x: number;
  y: number;
}

type ProjectSeed = Omit<Project, "x" | "y">;

/** Stable 0–1 hash for layout (no runtime randomness). */
function hash01(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 2 ** 32;
}

function scatterForProject(id: string): { x: number; y: number } {
  const margin = 0.08;
  const span = 1 - 2 * margin;
  return {
    x: margin + hash01(`${id}\0lon`) * span,
    y: margin + hash01(`${id}\0lat`) * span,
  };
}

const PROJECT_SEEDS: ProjectSeed[] = portfolioData.projects as ProjectSeed[];

const Galaxy = () => {
  const [selected, setSelected] = useState<Project | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    setGalleryIndex(0);
  }, [selected?.id]);

  const projects = useMemo(
    () => PROJECT_SEEDS.map((p) => ({ ...p, ...scatterForProject(p.id) })),
    []
  );

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDims({ w: rect.width, h: rect.height });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const getPos = useCallback(
    (p: Project) => ({
      x: p.x * dims.w,
      y: p.y * dims.h,
    }),
    [dims]
  );

  return (
    <CosmicPageShell>
      {/* Title */}
      <div className="relative z-10 pt-8 pb-4 text-center">
        <h1 className="cosmic-page-title text-foreground font-bold uppercase text-glow">
          MY GALAXY
        </h1>
        <p className="text-muted-foreground text-xs mt-2" style={{ letterSpacing: "0.2em" }}>
          CLICK A STAR TO EXPLORE
        </p>
      </div>

      {/* Project stars */}
      <div
        ref={containerRef}
        className="relative z-10 mx-auto"
        style={{
          width: "min(90vw, 1000px)",
          height: "min(70vh, 600px)",
          marginTop: "2vh",
        }}
      >
        {projects.map((project) => {
          const pos = getPos(project);
          const isHovered = hovered === project.id;
          return (
            <button
              key={project.id}
              type="button"
              className="absolute flex flex-col items-center group"
              style={{
                left: pos.x,
                top: pos.y,
                transform: "translate(-50%, -50%)",
                zIndex: 2,
              }}
              onMouseEnter={() => setHovered(project.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(project)}
            >
              <div
                className="rounded-full transition-all duration-300"
                style={{
                  width: isHovered ? 16 : 10,
                  height: isHovered ? 16 : 10,
                  background: "hsl(var(--foreground))",
                  boxShadow: isHovered
                    ? "0 0 20px 6px rgba(255,255,255,0.5), 0 0 40px 10px rgba(180,200,255,0.2)"
                    : "0 0 8px 2px rgba(255,255,255,0.3)",
                }}
              />
              <span
                className="text-foreground text-xs mt-2 transition-opacity duration-300 whitespace-nowrap"
                style={{
                  opacity: isHovered ? 1 : 0.5,
                  letterSpacing: "0.1em",
                  fontSize: "0.65rem",
                  textShadow: "0 0 10px rgba(0,0,0,0.8)",
                }}
              >
                {project.title}
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
          role="presentation"
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

          <div
            className="relative z-50 border border-border bg-card/95 backdrop-blur-md rounded-lg max-w-2xl w-full max-h-[88vh] overflow-y-auto p-6 pr-8"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-detail-title"
            style={{
              boxShadow: "0 0 40px rgba(100,130,200,0.1), 0 0 80px rgba(100,130,200,0.05)",
            }}
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <h2
              id="project-detail-title"
              className="text-foreground text-lg font-bold uppercase mb-2 pr-8"
              style={{ letterSpacing: "0.15em" }}
            >
              {selected.title}
            </h2>

            <p className="text-muted-foreground text-sm leading-relaxed mb-5">{selected.description}</p>

            <p className="text-muted-foreground text-[0.65rem] uppercase tracking-[0.2em] mb-2">Gallery</p>
            {selected.images.length > 0 ? (
              <div className="relative mb-6">
                <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border bg-muted">
                  <img
                    key={`${selected.id}-${galleryIndex}`}
                    src={selected.images[galleryIndex]}
                    alt={`${selected.title} preview ${galleryIndex + 1} of ${selected.images.length}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {selected.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-foreground backdrop-blur-sm transition hover:bg-black/65"
                        onClick={() =>
                          setGalleryIndex(
                            (i) => (i - 1 + selected.images.length) % selected.images.length
                          )
                        }
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-foreground backdrop-blur-sm transition hover:bg-black/65"
                        onClick={() =>
                          setGalleryIndex((i) => (i + 1) % selected.images.length)
                        }
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-[0.65rem] tabular-nums tracking-wider text-foreground/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        {galleryIndex + 1} / {selected.images.length}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : null}

            <p className="text-muted-foreground text-[0.65rem] uppercase tracking-[0.2em] mb-2">Skills</p>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 list-none p-0 m-0">
              {selected.skills.map((skill) => (
                <li
                  key={skill.name}
                  className="flex items-center gap-3 rounded-md border border-border bg-background/40 p-2"
                >
                  <img
                    src={skill.imageUrl}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded object-cover border border-border"
                    loading="lazy"
                  />
                  <span className="text-foreground text-xs tracking-wide">{skill.name}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3 pt-1">
              <a href={selected.liveUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="cosmic" size="sm" type="button">
                  <ExternalLink className="mr-1 h-3 w-3" /> Live
                </Button>
              </a>
              <a href={selected.githubUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="cosmic" size="sm" type="button">
                  <Github className="mr-1 h-3 w-3" /> Code
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </CosmicPageShell>
  );
};

export default Galaxy;
